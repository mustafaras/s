(function(){
"use strict";
var SEYMA_CONSTANTS=window.SeymaConstants||{};
var SEYMA_REMINDERS=window.SeymaReminders||null;
var SEYMA_MESSAGING=window.SeymaMessaging||null;
var KEY=SEYMA_CONSTANTS.KEY||"seyma-reset-v1", TKEY=SEYMA_CONSTANTS.TKEY||"seyma-theme";
// Saygı + Terapi Odası (İçsel Pusula), 2026-07-13 09:00 TR saatiyle (UTC+3, sabit
// offset — cihazın kendi saat dilimi ayarından bağımsız) aktif olur. data.startDate
// / kullanıcının kaç gündür uygulamayı kullandığı bu anı HİÇ etkilemez: ikisi de
// kilit açılana kadar "yakında" durumunda kalır, data.motivation kilit açılana
// kadar hiçbir koşulda oluşturulmaz (bkz. ensureMotivationRoot çağrı noktaları).
// Dosyanın en başında tanımlı — boot sırasında (data yüklenir yüklenmez) bile
// doğru değerlendirilsin diye (var hoisting nedeniyle daha aşağıda tanımlansaydı
// ilk boot çağrısında henüz atanmamış/undefined olurdu).
var FEATURE_GATE_TS=SEYMA_CONSTANTS.FEATURE_GATE_TS||new Date("2026-07-13T09:00:00+03:00").getTime();
function featuresLive(){ return Date.now()>=FEATURE_GATE_TS; }

var ICONS=SEYMA_CONSTANTS.ICONS||{};
// SVG ikon yardımcısı — emoji yerine tutarlı, tema-uyumlu (currentColor) çizgi ikonlar.
// size: piksel; cls: ekstra CSS class (opsiyonel, örn. "seyIconSpin"). Bilinmeyen isimde
// boş kare yerine sessizce boş span döner (uygulama çökmesin).
function icon(name,size,cls){ return window.SeymaHelpers.icon.apply(null,arguments); }
var HABITS=[
  {key:'sweetManaged',icon:icon('cookie',22),title:'Tatlı krizini yönettim',sub:'Tatlı seni değil, sen tatlıyı yönettin.',msg:'Tatlı lobisi bugün hafif geriledi. Şeyma 1 - Tatlı 0.'},
  {key:'foodManaged',icon:icon('utensils',22),title:'Yemek/açlık krizini yönettim',sub:'Gerçek açlık mı, duygusal açlık mı — ayırt ettin.',msg:'Açlık dalgasını izledin, boğulmadın. Beden mutlu, sen kaptansın.',since:'2026-07-10'},
  {key:'coffeeManaged',icon:icon('coffee',22),title:'Kahve/kafein krizini yönettim',sub:'Gerçek yorgunluk mu, alışkanlık mı — sen karar verdin.',msg:'Kafein isteğine sen yön verdin. Uykun bunu unutmayacak.',since:'2026-07-10'},
  {key:'eveningControl',icon:icon('moon',22),title:"Akşam 7'den sonra gereksiz atıştırmadım",sub:'Gerçek açlık başka, dolapla duygusal bağ başka.',msg:'Mutfak seferi iptal. Operasyon başarılı.'},
  {key:'walked20',icon:icon('footprints',22),title:'En az 9.000 adım yürüdüm',sub:'Günlük 9.000 adım, bedenine tatlı bir eşik (tatilde ve kendi hedefinde esner).',msg:'Yürüyüş tamam. Metabolizma "bunu not ettim" dedi.'},
  {key:'protein',icon:icon('egg',22),title:'2 ana öğünde protein vardı',sub:'Tokluk ekibi göreve başladı.',msg:'Protein geldi, krizlerin beli hafif büküldü.'},
  {key:'water',icon:icon('droplet',22),title:'Su içmeyi ihmal etmedim',sub:'Küçük şey, büyük fark.',msg:'Su tamam. Cilt bariyeri sessizce teşekkür ediyor.'},
  {key:'vitaminD',icon:icon('sun',22),title:'D₃K₂ damla takviyemi aldım',sub:'Minik destek, güneş hesabına yazıldı.',msg:'D₃K₂ damla tamam. Güneş desteği kayda geçti.'},
  {key:'sleepReg',icon:icon('bed',22),title:'Yeterli uyudum (7,5+ saat)',sub:'Uyku, dengenin sessiz kahramanı.',msg:'Uyku tamam. Hormonlar ve ruh hâlin sessizce teşekkür ediyor.',since:'2026-06-28'},
  {key:'journaled',icon:icon('pen-line',22),title:'Duygu/günlük notu yazdım',sub:'Zihni boşaltmak, kaygıyı hafifletir.',msg:'Bir cümle bile olsa yazdın; zihin biraz nefes aldı.',since:'2026-07-03'},
  {key:'mediaFed',icon:icon('sparkles',22),title:'Zihnimi besledim',sub:'Okudum, izledim, dinledim, öğrendim ya da kurs/pratik yaptım.',msg:'Zihnine iyi bir şey kattın — küçük ama besleyici.',since:'2026-07-09'},
  {key:'freshAir',icon:icon('leaf',22),title:'Açık havaya çıktım',sub:'Doğal ışık, ruh hâlini yukarı çeker.',msg:'Açık hava tamam. Güneş ve ruh hâlin selam gönderdi.',since:'2026-07-03'},
  {key:'selfKind',icon:icon('heart',22),title:'Kendime kötü davranmadım',sub:'En önemli tik bu.',msg:'Bugünün en kıymetli hamlesi: kendine yüklenmemek.'},
  {key:'caffeineOk',icon:icon('coffee',22),title:'Günlük kafein limitini aşmadım',sub:'Kafein saat ve miktarına bağlı — elle açılmaz.',msg:'Kafein limiti + zamanlama tamam. Uyku için de temiz bir gün.',since:'2026-07-10'},
  {key:'magnesium',icon:icon('pill',22),title:'Magnezyum takviyesi aldım',sub:'Destek gününü tamamladın.',msg:'Magnezyum desteği tamam. Beden sana teşekkür ediyor.'}
];
var HABIT_TOTAL=HABITS.length;

// ── Zihin-Beden Beslenmesi: kurs & pratik kataloğu ──
var SOUL_ACTIVITY_CATALOG=[
  {id:'pilates',label:'Pilates',icon:'flower-2',sci:'Kortikospinal plastisite, propriyosepsiyon, lumbopelvik stabilite',blurb:'Derin karın stabilizatörleri aktive eder, düşük bel ağrısı riskini azaltır, duruşu düzeltir.'},
  {id:'ney',label:'Ney',icon:'wind',sci:'Nefes regülasyonu, HRV artışı, parasempatik aktivasyon',blurb:'Yavaş nefes vagus siniri aracılığıyla duygusal dengeyi destekler, iç sessizliği artırır.'},
  {id:'riding',label:'Binicilik',icon:'heart-handshake',sci:'Hippoterapi, vestibüler uyarım, duygusal düzenleme, postüral kontrol',blurb:'Atın ritmik hareketi denge ve koordinasyonu uyarır; doğayla bağ ve güven duygusu verir.'}
];
function soulActivityById(id){ for(var i=0;i<SOUL_ACTIVITY_CATALOG.length;i++){ if(SOUL_ACTIVITY_CATALOG[i].id===id) return SOUL_ACTIVITY_CATALOG[i]; } return null; }
function soulActivityIcon(id){ var a=soulActivityById(id); return a?a.icon:'sparkles'; }
function soulActivityLabel(id){ var a=soulActivityById(id); return a?a.label:ucfirst(id); }
function soulActivityEntries(date){ var d=data&&data.days?data.days[date||activeDate()||todayStr()]:null; return (d&&Array.isArray(d.soulActivities))?d.soulActivities:[]; }
function soulActivityTypeCount(day,type){ if(!day||!Array.isArray(day.soulActivities)) return 0; var n=0; day.soulActivities.forEach(function(a){ if(a&&a.type===type) n++; }); return n; }
function soulActivityMinutesTotal(rec){ if(!rec||!Array.isArray(rec.soulActivities)) return 0; var t=0; rec.soulActivities.forEach(function(a){ var m=Number(a&&a.duration); if(!isNaN(m)&&m>0) t+=m; }); return t; }
function soulActivityCountsForDateRange(start,end){
  var counts={}; var mins={};
  SOUL_ACTIVITY_CATALOG.forEach(function(a){ counts[a.id]=0; mins[a.id]=0; });
  if(!data||!data.days) return {counts:counts,mins:mins};
  var s=start||todayStr(); var e=end||s;
  Object.keys(data.days).forEach(function(date){
    if(date<s||date> e) return;
    var rec=data.days[date]; if(!rec||!Array.isArray(rec.soulActivities)) return;
    rec.soulActivities.forEach(function(a){ if(!a||!a.type) return; if(counts[a.type]==null) counts[a.type]=0; if(mins[a.type]==null) mins[a.type]=0; counts[a.type]++; var m=Number(a.duration); if(!isNaN(m)&&m>0) mins[a.type]+=m; });
  });
  return {counts:counts,mins:mins};
}
function ucfirst(s){ return String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1); }

// ── İman Köşesi — prayer registry sabitleri ve imza-koruyan shimler ──
var SEYMA_PRAYER=window.SeymaPrayer||{};
var PRAYER_NAMES=SEYMA_PRAYER.PRAYER_NAMES||{};
var PRAYER_ORDER=SEYMA_PRAYER.PRAYER_ORDER||[];
var PRAYER_CITIES=SEYMA_PRAYER.PRAYER_CITIES||[];
var PRAYER_METHODS=SEYMA_PRAYER.PRAYER_METHODS||{};
function prayerCityByName(name){ return window.SeymaPrayer.prayerCityByName.apply(null,arguments); }
function prayerCityOptionsHTML(selected){ return window.SeymaPrayer.prayerCityOptionsHTML.apply(null,arguments); }
function emptyPrayerEntry(time){ return window.SeymaPrayer.emptyPrayerEntry.apply(null,arguments); }
function emptyPrayerDay(){ return window.SeymaPrayer.emptyPrayerDay.apply(null,arguments); }
function ensurePrayerDay(day){ return window.SeymaPrayer.ensurePrayerDay.apply(null,arguments); }
function prayerSettings(){ return window.SeymaPrayer.prayerSettings.apply(null,arguments); }
function prayerLocation(){ return window.SeymaPrayer.prayerLocation.apply(null,arguments); }
function prayerLocationHash(){ return window.SeymaPrayer.prayerLocationHash.apply(null,arguments); }
function prayerMethod(){ return window.SeymaPrayer.prayerMethod.apply(null,arguments); }
function prayerAdjustments(){ return window.SeymaPrayer.prayerAdjustments.apply(null,arguments); }
function fmtPrayerTime(d){ return window.SeymaPrayer.fmtPrayerTime.apply(null,arguments); }
function parsePrayerTime(t){ return window.SeymaPrayer.parsePrayerTime.apply(null,arguments); }
function prayerCacheKey(date,locHash){ return window.SeymaPrayer.prayerCacheKey.apply(null,arguments); }
function prayerReadCache(date,locHash){ return window.SeymaPrayer.prayerReadCache.apply(null,arguments); }
function prayerWriteCache(date,locHash,method,val){ return window.SeymaPrayer.prayerWriteCache.apply(null,arguments); }
function prayerTimesFromDay(p){ return window.SeymaPrayer.prayerTimesFromDay.apply(null,arguments); }
function currentPrayerIndex(times){ return window.SeymaPrayer.currentPrayerIndex.apply(null,arguments); }
function fetchAladhanTimes(date,lat,lon,method){ return window.SeymaPrayer.fetchAladhanTimes.apply(null,arguments); }
function fetchPrayerTimes(date,force){ return window.SeymaPrayer.fetchPrayerTimes.apply(null,arguments); }
function applyPrayerTimesToDay(date,times){ return window.SeymaPrayer.applyPrayerTimesToDay.apply(null,arguments); }
function prayerDaySummary(p){ return window.SeymaPrayer.prayerDaySummary.apply(null,arguments); }
function prayerPerformedCount(p){ return window.SeymaPrayer.prayerPerformedCount.apply(null,arguments); }
function prayerAllDone(p){ return window.SeymaPrayer.prayerAllDone.apply(null,arguments); }
function prayerStreak(){ return window.SeymaPrayer.prayerStreak.apply(null,arguments); }
// Sıradaki vakit + geri sayım (Faz 36) — render bazlı dakikalık hesap; interval yok.
function nextPrayerInfo(times){ return window.SeymaPrayer.nextPrayerInfo.apply(null,arguments); }

// ── İlham & İbadet: Zikirmatik · Saygı koleksiyonu · Rapor (Faz 35–40) ─────
var ZIKR_SEED=window.SeymaZikr&&window.SeymaZikr.ZIKR_SEED||[];
var ZIKR_NIYET={
  subhanallah:'O her türlü eksikten münezzehtir.',
  elhamdulillah:'Hamd yalnız O\'nadır.',
  allahu_ekber:'O en büyüktür.',
  la_ilaha_illallah:'O\'ndan başka ilah yoktur.',
  estagfirullah:'O çok bağışlayıcıdır.'
};
// ZP-08.1: esmaulHusnaV2.js/zikirCoreContentV1.js — ZP-01/ZP-02'de yazılmış
// ama app.js'e hiç bağlanmamış (henüz ZP-13'e bırakılmıştı) anlam/önem/
// tefekkür/kaynak içerik katmanı. Kullanıcı geri bildirimiyle öne çekildi:
// "Anlamı ve önemi" artık gizli değil, sayaç ekranında doğrudan görünür.
// editorialStatus içerik modüllerinde hâlâ 'draft' — bu bilinçli bir karar
// (insan editoryal onayı programatik olarak 'reviewed'e çevrilmiyor), yalnız
// UI'da GÖSTERİLMESİ artık kullanıcının kendi onayıyla gerçekleşiyor.
var _zikrContentEsmaIdx=null;
function zikrContentFor(p){ return window.SeymaZikr.zikrContentFor.apply(null,arguments); }
function zikrNormalizeSearchText(s){ return window.SeymaZikr.zikrNormalizeSearchText.apply(null,arguments); }
function zikrPresetSearchText(x){ return window.SeymaZikr.zikrPresetSearchText.apply(null,arguments); }
// Uzun katalog için "niyet mercekleri": yeni/veri kopyalayan presetler
// oluşturmak yerine mevcut 104 kaydı yakın anlam kümelerinde keşfettirir.
var ZIKR_TOPIC_GROUPS=[
  {id:'all',label:'Tüm konular',icon:'sparkles',terms:[]},
  {id:'rahmet',label:'Merhamet',icon:'heart',terms:['merhamet','rahmet','sefkat','bagislayan','rahman','rahim','rauf']},
  {id:'huzur',label:'Huzur & Korunma',icon:'lock',terms:['huzur','guven','esenlik','koruyan','gozeten','selam','mumin','muheymin','hafiz']},
  {id:'rizik',label:'Rızık & Açılım',icon:'sun',terms:['rizik','bereket','acilim','kapilari acan','veren','gani','mugni','fettah','rezzak','vehhab']},
  {id:'sabir',label:'Güç & Sabır',icon:'sprout',terms:['sabir','guc','kudret','dayan','metin','kavi','aziz','cebb']},
  {id:'tevbe',label:'Af & Arınma',icon:'droplets',terms:['bagisla','affeden','tevbe','gunah','gafur','gaffar','afuv','estagfirullah']},
  {id:'sukur',label:'Şükür & Tesbih',icon:'flower-2',terms:['sukur','ovgu','tesbih','tenzih','yucelt','subhanallah','elhamdulillah','allahu ekber']}
];
function zikrTopicGroup(id){ return window.SeymaZikr.zikrTopicGroup.apply(null,arguments); }
function zikrTopicMatch(x,topicId){ return window.SeymaZikr.zikrTopicMatch.apply(null,arguments); }
function zikrPresetTopicLabel(x){ return window.SeymaZikr.zikrPresetTopicLabel.apply(null,arguments); }
// GEÇİCİ ÖNİZLEME (zikirmatik-iphone16-redesign branch'ine özel): redesign
// ilerlemesini kullanıcı incelemesi için görünür kılmak amacıyla açık
// bırakıldı. main'e merge/deploy ETMEDEN ÖNCE — ZP-19 kapanışında — bu satır
// tekrar `window.__SEYMA_TEST_ZIKR__===true` sözleşmesine (yalnız headless
// test bayrağıyla açılır) döndürülmeli; canlıya bu haliyle ALINMAMALI.
var ZIKR_V2_VISIBLE=true;
// MON-20: Zikirmatik seed/motor gövdeleri app/core/zikir.js registry'sindedir.
// Bu ince kabuk aynı ad/imza/return yüzeyini korur; data kök rebind'i,
// render ve App handler mutasyonları app.js'te kalır.
function zikrUid(prefix){ return window.SeymaZikr.zikrUid.apply(null,arguments); }
function zikrInt(v){ return window.SeymaZikr.zikrInt.apply(null,arguments); }
function emptyZikrRoot(){ return window.SeymaZikr.emptyZikrRoot.apply(null,arguments); }
function zikrNormalizeManualEntry(raw){ return window.SeymaZikr.zikrNormalizeManualEntry.apply(null,arguments); }
function migrateZikrV5(z){ return window.SeymaZikr.migrateZikrV5.apply(null,arguments); }
function emptyZikrDay(){ return window.SeymaZikr.emptyZikrDay.apply(null,arguments); }
function emptyZikrPresetDay(){ return window.SeymaZikr.emptyZikrPresetDay.apply(null,arguments); }
function zikrEsmaSeed(){ return window.SeymaZikr.zikrEsmaSeed.apply(null,arguments); }
function zikrSeedPreset(p){ return window.SeymaZikr.zikrSeedPreset.apply(null,arguments); }
function zikrBaseTarget(p){ return window.SeymaZikr.zikrBaseTarget.apply(null,arguments); }
function zikrHatimTarget(p){ return window.SeymaZikr.zikrHatimTarget.apply(null,arguments); }
function zikrMath(p,count){ return window.SeymaZikr.zikrMath.apply(null,arguments); }
function zikrNewHatim(p,count,status,startedAt){ return window.SeymaZikr.zikrNewHatim.apply(null,arguments); }
function zikrNormalizeRoot(rootData){ return window.SeymaZikr.zikrNormalizeRoot.apply(null,arguments); }
function migrateZikrV4(z){ return window.SeymaZikr.migrateZikrV4.apply(null,arguments); }
function migrateZikrV3(z){ return window.SeymaZikr.migrateZikrV3.apply(null,arguments); }
function migrateZikrV2(rootData){ return window.SeymaZikr.migrateZikrV2.apply(null,arguments); }
function ensureZikrRoot(rootData){ return window.SeymaZikr.ensureZikrRoot.apply(null,arguments); }
function zikrPreset(id){ return window.SeymaZikr.zikrPreset.apply(null,arguments); }
function zikrActivePreset(){ return window.SeymaZikr.zikrActivePreset.apply(null,arguments); }
function zikrDay(date){ return window.SeymaZikr.zikrDay.apply(null,arguments); }
function zikrPresetDay(day,presetId){ return window.SeymaZikr.zikrPresetDay.apply(null,arguments); }
function zikrPresetDayCount(day,presetId){ return window.SeymaZikr.zikrPresetDayCount.apply(null,arguments); }
function zikrReflectionId(date,presetId){ return window.SeymaZikr.zikrReflectionId.apply(null,arguments); }
function zikrReflection(date,presetId){ return window.SeymaZikr.zikrReflection.apply(null,arguments); }
function zikrReflectionWordCount(d){ return window.SeymaZikr.zikrReflectionWordCount.apply(null,arguments); }
function zikrReflectionsFor(date,presetId){ return window.SeymaZikr.zikrReflectionsFor.apply(null,arguments); }
function zikrPresetDone(date,preset){ return window.SeymaZikr.zikrPresetDone.apply(null,arguments); }
function zikrDayCompleted(date){ return window.SeymaZikr.zikrDayCompleted.apply(null,arguments); }
function zikrStreak(){ return window.SeymaZikr.zikrStreak.apply(null,arguments); }
function zikrWeek(date){ return window.SeymaZikr.zikrWeek.apply(null,arguments); }
function zikrJourney(preset,create){ return window.SeymaZikr.zikrJourney.apply(null,arguments); }
function zikrActiveHatim(preset,create){ return window.SeymaZikr.zikrActiveHatim.apply(null,arguments); }
function zikrJourneyProgress(preset){ return window.SeymaZikr.zikrJourneyProgress.apply(null,arguments); }
function zikrSessionState(preset){ return window.SeymaZikr.zikrSessionState.apply(null,arguments); }
function zikrTouchTick(){ return window.SeymaZikr.zikrTouchTick.apply(null,arguments); }
function syncZikrDayMirror(date,day){ return window.SeymaZikr.syncZikrDayMirror.apply(null,arguments); }
function zikrManualActive(date,presetId){ return window.SeymaZikr.zikrManualActive.apply(null,arguments); }
function zikrTickSound(){ return window.SeymaZikr.zikrTickSound.apply(null,arguments); }
function zikrPauseSession(){ return window.SeymaZikr.zikrPauseSession.apply(null,arguments); }
function zikrManualApply(presetId,amount,date,note){ return window.SeymaZikr.zikrManualApply.apply(null,arguments); }
function zikrManualUndoEntry(entryId){ return window.SeymaZikr.zikrManualUndoEntry.apply(null,arguments); }
function zikrManualEntryCountFor(date,presetId){ return window.SeymaZikr.zikrManualEntryCountFor.apply(null,arguments); }
if(!window.SeymaZikr||typeof window.SeymaZikr.registerZikr!=='function') throw new Error('MON-20: SeymaZikr registry kurulamadı');
var ZIKR_MANUAL_MAX=window.SeymaZikr.ZIKR_MANUAL_MAX;
if(!window.SeymaZikr.registerZikr({
  data:function(){ return data; },
  getDay:getDay,
  todayStr:todayStr,
  addDays:addDays,
  dayIndexFor:dayIndexFor,
  save:save,
  ui:function(){ return ui; },
  icon:icon,
  esc:esc,
  dateLabelTR:dateLabelTR,
  contentFor:zikrContentFor,
  niyet:function(){ return ZIKR_NIYET; },
  normalizeSearchText:zikrNormalizeSearchText,
  presetSearchText:zikrPresetSearchText,
  topicGroups:function(){ return ZIKR_TOPIC_GROUPS; },
  topicGroup:zikrTopicGroup,
  topicMatch:zikrTopicMatch,
  presetTopicLabel:zikrPresetTopicLabel,
  ringRadius:function(){ return ZIKR_RING_RADIUS; },
  completeFlash:function(){ return _zikrCompleteFlash; },
  noteDraftFor:zikrNoteDraftFor,
  manualDraftFor:zikrManualDraftFor
})) throw new Error('MON-20: SeymaZikr registry kurulamadı');
// MON2-06: zikr alan gövdeleri app/core/zikir.js registry'sindedir.
if(!window.SeymaZikr||typeof window.SeymaZikr.registerZikrSurface!=='function') throw new Error('MON2-06: SeymaZikr yüzey kaydı kurulamadı');
if(!window.SeymaZikr.registerZikrSurface({
  App:function(){ return App; },
  ZIKR_RING_RADIUS:function(){ return ZIKR_RING_RADIUS; },
  ZIKR_TOPIC_GROUPS:function(){ return ZIKR_TOPIC_GROUPS; },
  ZIKR_V2_VISIBLE:function(){ return ZIKR_V2_VISIBLE; },
  _zikrBodyLocked:function(){ return _zikrBodyLocked; },
  _zikrBodyPrevOverflow:function(){ return _zikrBodyPrevOverflow; },
  _zikrCompleteFlash:function(){ return _zikrCompleteFlash; },
  _zikrContentEsmaIdx:function(){ return _zikrContentEsmaIdx; },
  a:function(){ return a; },
  data:function(){ return data; },
  dayIndexFor:function(){ return dayIndexFor; },
  defer:function(){ return setTimeout.bind(window); },
  doc:function(){ return document; },
  el:function(){ return el; },
  esc:function(){ return esc; },
  getDay:function(){ return getDay; },
  haptic:function(){ return haptic; },
  icon:function(){ return icon; },
  input:function(){ return input; },
  lastOverlayView:function(){ return lastOverlayView; },
  reminderRestoreFocus:function(){ return reminderRestoreFocus; },
  render:function(){ return render; },
  save:function(){ return save; },
  toast:function(){ return toast; },
  todayStr:function(){ return todayStr; },
  ui:function(){ return ui; },
  zikrSyncWakeLock:function(){ return zikrSyncWakeLock; },
  set__zikrBodyLocked:function(v){ _zikrBodyLocked=v; },
  set__zikrBodyPrevOverflow:function(v){ _zikrBodyPrevOverflow=v; },
  set__zikrCompleteFlash:function(v){ _zikrCompleteFlash=v; },
  set__zikrContentEsmaIdx:function(v){ _zikrContentEsmaIdx=v; },
  set_lastOverlayView:function(v){ lastOverlayView=v; },
})) throw new Error('MON2-06: SeymaZikr yüzey kaydı kurulamadı');
// MON-23: Saygı / Öncü / İman domain gövdeleri app/core/saygi.js registry'sindedir.
// app.js yalnız canlı resolver bag'ini ve imza-koruyan delegeleri tutar; data
// rebind'i, App handlerları ve sensör/DOM kabuğu burada kalır.
var SEYMA_SAYGI=window.SeymaSaygi||{};
function emptySaygiRoot(){ return window.SeymaSaygi.emptySaygiRoot.apply(null,arguments); }
function ensureSaygiRoot(){ return window.SeymaSaygi.ensureSaygiRoot.apply(null,arguments); }
function emptySaygi(){ return window.SeymaSaygi.emptySaygi.apply(null,arguments); }
function ensureSaygiDay(day){ return window.SeymaSaygi.ensureSaygiDay.apply(null,arguments); }
function saygiMarkRead(person){ return window.SeymaSaygi.saygiMarkRead.apply(null,arguments); }
function saygiCollection(){ return window.SeymaSaygi.saygiCollection.apply(null,arguments); }
function saygiReadCount(){ return window.SeymaSaygi.saygiReadCount.apply(null,arguments); }
function saygiStreak(){ return window.SeymaSaygi.saygiStreak.apply(null,arguments); }
function saygiPeople(){ return window.SeymaSaygi.saygiPeople.apply(null,arguments); }
function saygiPositiveMod(n,m){ return window.SeymaSaygi.saygiPositiveMod.apply(null,arguments); }
function saygiPersonForDate(date){ return window.SeymaSaygi.saygiPersonForDate.apply(null,arguments); }
function saygiCurrentPerson(){ return window.SeymaSaygi.saygiCurrentPerson.apply(null,arguments); }
function saygiPersonById(id){ return window.SeymaSaygi.saygiPersonById.apply(null,arguments); }
function saygiModalPerson(){ return window.SeymaSaygi.saygiModalPerson.apply(null,arguments); }
function saygiDayKey(person,date){ return window.SeymaSaygi.saygiDayKey.apply(null,arguments); }
function saygiCacheKey(lang,canonical,revision){ return window.SeymaSaygi.saygiCacheKey.apply(null,arguments); }
function saygiReadCache(key){ return window.SeymaSaygi.saygiReadCache.apply(null,arguments); }
function saygiWriteCache(key,val){ return window.SeymaSaygi.saygiWriteCache.apply(null,arguments); }
function saygiSafeUrl(url,hosts){ return window.SeymaSaygi.saygiSafeUrl.apply(null,arguments); }
function saygiFetchJSON(url,timeout){ return window.SeymaSaygi.saygiFetchJSON.apply(null,arguments); }
function saygiSummaryUrl(lang,title){ return window.SeymaSaygi.saygiSummaryUrl.apply(null,arguments); }
function saygiHtmlUrl(lang,title){ return window.SeymaSaygi.saygiHtmlUrl.apply(null,arguments); }
function saygiFetchSummary(lang,title){ return window.SeymaSaygi.saygiFetchSummary.apply(null,arguments); }
function saygiLoadSummary(person){ return window.SeymaSaygi.saygiLoadSummary.apply(null,arguments); }
function saygiPlainText(value){ return window.SeymaSaygi.saygiPlainText.apply(null,arguments); }
function saygiStopHeading(text){ return window.SeymaSaygi.saygiStopHeading.apply(null,arguments); }
function saygiBioBlocks(html){ return window.SeymaSaygi.saygiBioBlocks.apply(null,arguments); }
function saygiExternalLinks(lang,title){ return window.SeymaSaygi.saygiExternalLinks.apply(null,arguments); }
function saygiArticleFrom(person,summary,full,links){ return window.SeymaSaygi.saygiArticleFrom.apply(null,arguments); }
function saygiArticleReadableFor(person,article,date){ return window.SeymaSaygi.saygiArticleReadableFor.apply(null,arguments); }
function saygiRequestIsCurrent(person,dailyKey,requestId){ return window.SeymaSaygi.saygiRequestIsCurrent.apply(null,arguments); }
function saygiLoadArticle(person,force){ return window.SeymaSaygi.saygiLoadArticle.apply(null,arguments); }
function saygiEnsureArticle(person){ return window.SeymaSaygi.saygiEnsureArticle.apply(null,arguments); }
function saygiReadMinutes(article){ return window.SeymaSaygi.saygiReadMinutes.apply(null,arguments); }
function saygiReadingEntry(day,person){ return window.SeymaSaygi.saygiReadingEntry.apply(null,arguments); }
function saygiHasRead(person){ return window.SeymaSaygi.saygiHasRead.apply(null,arguments); }
function saygiDomainTone(host){ return window.SeymaSaygi.saygiDomainTone.apply(null,arguments); }
function faithWeekKPIs(date){ return window.SeymaSaygi.faithWeekKPIs.apply(null,arguments); }
function faithDayHeat(date){ return window.SeymaSaygi.faithDayHeat.apply(null,arguments); }
function qiblaBearing(lat,lon){ return window.SeymaSaygi.qiblaBearing.apply(null,arguments); }
function qiblaDistanceKm(lat,lon){ return window.SeymaSaygi.qiblaDistanceKm.apply(null,arguments); }
function qiblaDirectionLabel(bearing){ return window.SeymaSaygi.qiblaDirectionLabel.apply(null,arguments); }
function qiblaMetrics(location,heading){ return window.SeymaSaygi.qiblaMetrics.apply(null,arguments); }
function qiblaLocationPrecision(m){ return window.SeymaSaygi.qiblaLocationPrecision.apply(null,arguments); }
function qiblaAlignmentCopy(m){ return window.SeymaSaygi.qiblaAlignmentCopy.apply(null,arguments); }
function qiblaScreenAngle(){ return window.SeymaSaygi.qiblaScreenAngle.apply(null,arguments); }
function qiblaOverlayHTML(){ return window.SeymaSaygi.qiblaOverlayHTML.apply(null,arguments); }
function saygiSourceFallback(person){ return window.SeymaSaygi.saygiSourceFallback.apply(null,arguments); }
function saygiSourceCardHTML(article,link,isWiki){ return window.SeymaSaygi.saygiSourceCardHTML.apply(null,arguments); }
function saygiReadButtonHTML(person,done,suffix){ return window.SeymaSaygi.saygiReadButtonHTML.apply(null,arguments); }
function saygiReadActionHTML(done,suffix,disabled,main,sub){ return window.SeymaSaygi.saygiReadActionHTML.apply(null,arguments); }
function saygiLoadingHTML(){ return window.SeymaSaygi.saygiLoadingHTML.apply(null,arguments); }
function saygiComingSoonHTML(){ return window.SeymaSaygi.saygiComingSoonHTML.apply(null,arguments); }
function faithSummaryBadges(p,compact){ return window.SeymaSaygi.faithSummaryBadges.apply(null,arguments); }
function faithCornerCardHTML(){ return window.SeymaSaygi.faithCornerCardHTML.apply(null,arguments); }
function saygiPreviewCardHTML(person,done,article){ return window.SeymaSaygi.saygiPreviewCardHTML.apply(null,arguments); }
function saygiMissionCardHTML(){ return window.SeymaSaygi.saygiMissionCardHTML.apply(null,arguments); }
function faithCornerInlineHTML(){ return window.SeymaSaygi.faithCornerInlineHTML.apply(null,arguments); }
function prayerRowHTML(type,entry,isCurrent,isNext){ return window.SeymaSaygi.prayerRowHTML.apply(null,arguments); }
function hijriTodayStr(){ return window.SeymaSaygi.hijriTodayStr.apply(null,arguments); }
function kandilBadgeFor(date){ return window.SeymaSaygi.kandilBadgeFor.apply(null,arguments); }
function spiritBarHTML(){ return window.SeymaSaygi.spiritBarHTML.apply(null,arguments); }
function faithCornerOverlayHTML(){ return window.SeymaSaygi.faithCornerOverlayHTML.apply(null,arguments); }
function saygiCollectionCardHTML(person){ return window.SeymaSaygi.saygiCollectionCardHTML.apply(null,arguments); }
function saygiCollectionGridHTML(person,coll,read,total){ return window.SeymaSaygi.saygiCollectionGridHTML.apply(null,arguments); }
function saygiFilteredResultsHTML(lens,todayId){ return window.SeymaSaygi.saygiFilteredResultsHTML.apply(null,arguments); }
function saygiNormalize(text){ return window.SeymaSaygi.saygiNormalize.apply(null,arguments); }
function saygiFold(str){ return window.SeymaSaygi.saygiFold.apply(null,arguments); }
function saygiLens(){ return window.SeymaSaygi.saygiLens.apply(null,arguments); }
function saygiFilterSummary(){ return window.SeymaSaygi.saygiFilterSummary.apply(null,arguments); }
function saygiFilter(raw){ return window.SeymaSaygi.saygiFilter.apply(null,arguments); }
function saygiReadFilter(raw){ return window.SeymaSaygi.saygiReadFilter.apply(null,arguments); }
function saygiScalePercent(){ return window.SeymaSaygi.saygiScalePercent.apply(null,arguments); }
function saygiScaleIndex(){ return window.SeymaSaygi.saygiScaleIndex.apply(null,arguments); }
function saygiScaleLabel(){ return window.SeymaSaygi.saygiScaleLabel.apply(null,arguments); }
function saygiScaleIsDefault(){ return window.SeymaSaygi.saygiScaleIsDefault.apply(null,arguments); }
function saygiAnchorId(person,index){ return window.SeymaSaygi.saygiAnchorId.apply(null,arguments); }
function saygiSections(article,person){ return window.SeymaSaygi.saygiSections.apply(null,arguments); }
function saygiHasSections(article,person){ return window.SeymaSaygi.saygiHasSections.apply(null,arguments); }
function saygiFirstHeadingAnchor(article,person){ return window.SeymaSaygi.saygiFirstHeadingAnchor.apply(null,arguments); }
function saygiSectionSkipHTML(article,person,suffix){ return window.SeymaSaygi.saygiSectionSkipHTML.apply(null,arguments); }
function saygiPosition(){ return window.SeymaSaygi.saygiPosition.apply(null,arguments); }
function saygiHasPosition(){ return window.SeymaSaygi.saygiHasPosition.apply(null,arguments); }
function saygiRememberPosition(anchorId,ratio){ return window.SeymaSaygi.saygiRememberPosition.apply(null,arguments); }
function saygiClearPosition(){ return window.SeymaSaygi.saygiClearPosition.apply(null,arguments); }
function saygiReadingDirection(article){ return window.SeymaSaygi.saygiReadingDirection.apply(null,arguments); }
function saygiIsRtl(article){ return window.SeymaSaygi.saygiIsRtl.apply(null,arguments); }
function saygiDirectionLabel(article){ return window.SeymaSaygi.saygiDirectionLabel.apply(null,arguments); }
function saygiA11yAlternativeOn(){ return window.SeymaSaygi.saygiA11yAlternativeOn.apply(null,arguments); }
function saygiA11yAltHTML(suffix,ready){ return window.SeymaSaygi.saygiA11yAltHTML.apply(null,arguments); }
function saygiScaleToolHTML(){ return window.SeymaSaygi.saygiScaleToolHTML.apply(null,arguments); }
function faithAnnualHeatmapHTML(){ return window.SeymaSaygi.faithAnnualHeatmapHTML.apply(null,arguments); }
function faithRaporCardHTML(){ return window.SeymaSaygi.faithRaporCardHTML.apply(null,arguments); }
function qiblaHubCardHTML(){ return window.SeymaSaygi.qiblaHubCardHTML.apply(null,arguments); }
function saygiPreviewHubHTML(person,article,done){ return window.SeymaSaygi.saygiPreviewHubHTML.apply(null,arguments); }
function faithNavHTML(){ return window.SeymaSaygi.faithNavHTML.apply(null,arguments); }
function saygiHTML(){ return SEYMA_RENDER.saygiHTML.apply(null,arguments); }
function saygiArticleBodyHTML(person,article,done,wrapCls,includeReadAction){ return window.SeymaSaygi.saygiArticleBodyHTML.apply(null,arguments); }
function saygiPersonModalHTML(){ return window.SeymaSaygi.saygiPersonModalHTML.apply(null,arguments); }
function saygiFloatingReadHTML(){ return window.SeymaSaygi.saygiFloatingReadHTML.apply(null,arguments); }
function saygiUnlockReadButton(btn){ return window.SeymaSaygi.saygiUnlockReadButton.apply(null,arguments); }
function wireSaygiReadGate(sc,suffix){ return window.SeymaSaygi.wireSaygiReadGate.apply(null,arguments); }
function saygiDisconnectReadObserver(){ return window.SeymaSaygi.saygiDisconnectReadObserver.apply(null,arguments); }
// MON-22: Quran domain gövdeleri app/core/quran.js registry'sindedir.
// app.js yalnız canlı data shim'ini ve UI handler kabuğunun kullandığı ince
// delegeleri tutar; reducer, normalizasyon ve remote apply dışarıda yaşar.
var QURAN_SCHEMA_VERSION=window.SeymaQuran.QURAN_SCHEMA_VERSION;
var QURAN_CATALOG_VERSION=window.SeymaQuran.QURAN_CATALOG_VERSION;
var QURAN_DEFAULT_SURAH_ID=window.SeymaQuran.QURAN_DEFAULT_SURAH_ID;
var QURAN_SURAH_ID_RE=window.SeymaQuran.QURAN_SURAH_ID_RE;
var QURAN_REQUEST_ID_RE=window.SeymaQuran.QURAN_REQUEST_ID_RE;
var QURAN_VIDEO_ID_RE=window.SeymaQuran.QURAN_VIDEO_ID_RE;
var QURAN_STATUSES=window.SeymaQuran.QURAN_STATUSES;
var QURAN_REQUEST_STAMPS=window.SeymaQuran.QURAN_REQUEST_STAMPS;
var QURAN_HISTORY_MAX=window.SeymaQuran.QURAN_HISTORY_MAX;
var QURAN_NOTE_MAX=window.SeymaQuran.QURAN_NOTE_MAX;
var QURAN_NOTE_KINDS=window.SeymaQuran.QURAN_NOTE_KINDS;
var QURAN_WHATSAPP_NUMBER=window.SeymaQuran.QURAN_WHATSAPP_NUMBER;
var QURAN_RANK=window.SeymaQuran.QURAN_RANK;
var QURAN_RETRYABLE=window.SeymaQuran.QURAN_RETRYABLE;
var QURAN_TRANSITIONS=window.SeymaQuran.QURAN_TRANSITIONS;
function quranNullableStr(v){ return window.SeymaQuran.quranNullableStr.apply(null,arguments); }
function quranNormalizeRequestId(v){ return window.SeymaQuran.quranNormalizeRequestId.apply(null,arguments); }
function quranNormalizeSurahId(v){ return window.SeymaQuran.quranNormalizeSurahId.apply(null,arguments); }
function quranSafeSurahId(id){ return window.SeymaQuran.quranSafeSurahId.apply(null,arguments); }
function emptyQuranJourney(){ return window.SeymaQuran.emptyQuranJourney.apply(null,arguments); }
function normQuranNote(n){ return window.SeymaQuran.normQuranNote.apply(null,arguments); }
function quranSortNotes(list){ return window.SeymaQuran.quranSortNotes.apply(null,arguments); }
function quranStatusFromStamps(r){ return window.SeymaQuran.quranStatusFromStamps.apply(null,arguments); }
function normQuranRequest(r){ return window.SeymaQuran.normQuranRequest.apply(null,arguments); }
function ensureQuranJourney(d){ return window.SeymaQuran.ensureQuranJourney.apply(null,arguments); } function ensureQuranLearn(d){ return window.SeymaQuranLearn.ensureQuranLearn.apply(null,arguments); }
function quranStatusRank(s){ return window.SeymaQuran.quranStatusRank.apply(null,arguments); }
function quranNewRequest(){ return window.SeymaQuran.quranNewRequest.apply(null,arguments); }
function quranCanRequest(r){ return window.SeymaQuran.quranCanRequest.apply(null,arguments); }
function quranReduce(request,ev){ return window.SeymaQuran.quranReduce.apply(null,arguments); }
function quranRandomToken(len){ return window.SeymaQuran.quranRandomToken.apply(null,arguments); }
function quranNewRequestId(){ return window.SeymaQuran.quranNewRequestId.apply(null,arguments); }
function quranOutboxWriter(){ return window.SeymaQuran.quranOutboxWriter.apply(null,arguments); }
function quranOutboxErrorLabel(err){ return window.SeymaQuran.quranOutboxErrorLabel.apply(null,arguments); }
function quranResponseForSurah(rs,sid,req){ return window.SeymaQuran.quranResponseForSurah.apply(null,arguments); }
function quranApplyRemoteUpdates(delivery,responses){ return window.SeymaQuran.quranApplyRemoteUpdates.apply(null,arguments); }
function quranRandomVerseStart(){ return window.SeymaQuran.quranRandomVerseStart.apply(null,arguments); }
if(!window.SeymaQuran||typeof window.SeymaQuran.registerQuran!=='function') throw new Error('MON-22: SeymaQuran registry kurulamadı');
if(!window.SeymaQuran.registerQuran({data:function(){ return data; }})) throw new Error('MON-22: SeymaQuran registry kurulamadı'); if(!window.SeymaQuranLearn||typeof window.SeymaQuranLearn.registerQuranLearn!=='function') throw new Error('KAO-07: SeymaQuranLearn registry kurulamadı'); if(!window.SeymaQuranLearn.registerQuranLearn({data:function(){ return data; },ui:function(){ return ui; },save:save,render:render,todayStr:todayStr,esc:esc,icon:icon,getDay:getDay})) throw new Error('KAO-07: SeymaQuranLearn registry kurulamadı'); if(!window.SeymaQuranLearn.registerCaffeineTargetBed(caffeineTargetBed)) throw new Error('KAO-10: gece penceresi bağımlılığı kurulamadı'); if(!window.SeymaQuranLearn.registerQuranLearnSurface({lockBody:reminderLockBodyScroll,unlockBody:reminderUnlockBodyScroll,focusDialog:focusModalDialog,activeElementId:reminderActiveElementId,restoreFocus:reminderRestoreFocus,sheetClose:function(card,back,body){ if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose(card,back,body); else body(); },mount:function(html){ var root=document.getElementById('app'),old=document.getElementById('sey-ov-back'); if(old&&old.parentNode) old.parentNode.removeChild(old); if(root&&typeof root.insertAdjacentHTML==='function') root.insertAdjacentHTML('beforeend',html); },taskElement:function(){ return document.getElementById('kao-task'); },createLink:function(){ return document.createElement('a'); },createAudio:function(src){ var audio=document.createElement('audio'); audio.preload='none'; audio.src=src; return audio; },isQuietTime:function(){ return !!(window.SeyAudio&&typeof window.SeyAudio.isQuietTime==='function'&&window.SeyAudio.isQuietTime()); },setTimer:function(fn,ms){ return setTimeout(fn,ms); },clearTimer:function(id){ clearTimeout(id); },toast:toast})) throw new Error('KAO-10: öğrenme yüzeyi kurulamadı');
// MON2-06: quran alan gövdeleri app/core/quran.js registry'sindedir.
if(!window.SeymaQuran||typeof window.SeymaQuran.registerQuranSurface!=='function') throw new Error('MON2-06: SeymaQuran yüzey kaydı kurulamadı');
if(!window.SeymaQuran.registerQuranSurface({
  App:function(){ return App; },
  QURAN_BUCKETS:function(){ return QURAN_BUCKETS; },
  QURAN_CONFIRM_TIMEOUT_MS:function(){ return QURAN_CONFIRM_TIMEOUT_MS; },
  QURAN_FILTERS:function(){ return QURAN_FILTERS; },
  QURAN_REFRESH_TIMEOUT_MS:function(){ return QURAN_REFRESH_TIMEOUT_MS; },
  QURAN_ROW_STATES:function(){ return QURAN_ROW_STATES; },
  QURAN_TOTAL_FALLBACK:function(){ return QURAN_TOTAL_FALLBACK; },
  _quranBodyLocked:function(){ return _quranBodyLocked; },
  _quranBodyPrevOverflow:function(){ return _quranBodyPrevOverflow; },
  _quranYtRestartSurahId:function(){ return _quranYtRestartSurahId; },
  data:function(){ return data; },
  defer:function(){ return setTimeout.bind(window); },
  doc:function(){ return document; },
  el:function(){ return el; },
  esc:function(){ return esc; },
  lastOverlayView:function(){ return lastOverlayView; },
  quranAttachPlayer:function(){ return quranAttachPlayer; },
  quranDetailActionsHTML:function(){ return quranDetailActionsHTML; },
  quranDetailBodyHTML:function(){ return quranDetailBodyHTML; },
  quranDetailViewHTML:function(){ return quranDetailViewHTML; },
  quranHeadLeadHTML:function(){ return quranHeadLeadHTML; },
  quranLibraryResultsHTML:function(){ return quranLibraryResultsHTML; },
  quranLibraryViewHTML:function(){ return quranLibraryViewHTML; },
  quranVideoNotesInnerHTML:function(){ return quranVideoNotesInnerHTML; },
  render:function(){ return render; },
  save:function(){ return save; },
  sync:function(){ return window.SeySync||null; },
  toast:function(){ return toast; },
  ui:function(){ return ui; },
  zikrNormalizeSearchText:function(){ return zikrNormalizeSearchText; },
  set__quranBodyLocked:function(v){ _quranBodyLocked=v; },
  set__quranBodyPrevOverflow:function(v){ _quranBodyPrevOverflow=v; },
  set__quranYtRestartSurahId:function(v){ _quranYtRestartSurahId=v; },
  set_lastOverlayView:function(v){ lastOverlayView=v; },
})) throw new Error('MON2-06: SeymaQuran yüzey kaydı kurulamadı');
// MON-23: Saygı / İman domain gövdeleri app/core/saygi.js registry'sindedir.
// App handlerları, gerçek data rebind'i, prayer sensörleri ve ortak modal focus
// altyapısı app.js'te kalır; bu bağ yalnızca canlı dependency bag'i verir.
if(!window.SeymaSaygi||typeof window.SeymaSaygi.registerSaygi!=='function') throw new Error('MON-23: SeymaSaygi registry kurulamadı');
if(!window.SeymaSaygi.registerSaygi({
  data:function(){ return data; },
  ui:function(){ return ui; },
  getDay:getDay,
  todayStr:todayStr,
  addDays:addDays,
  diffDays:diffDays,
  dayIndexFor:dayIndexFor,
  dateLabelTR:dateLabelTR,
  icon:icon,
  esc:esc,
  featuresLive:featuresLive,
  render:render,
  quranJourneyHubCardHTML:quranJourneyHubCardHTML, kaoHubCardHTML:function(){ return window.SeymaQuranLearn?window.SeymaQuranLearn.kaoHubCardHTML():''; },
  zikrVisible:function(){ return ZIKR_V2_VISIBLE; },
  zikrPreviewCardHTML:zikrPreviewCardHTML
})) throw new Error('MON-23: SeymaSaygi dependency bag kurulamadı');
if(!window.SeymaMotivation||typeof window.SeymaMotivation.registerMotivation!=='function') throw new Error('MON-26: SeymaMotivation registry kurulamadı');
if(!window.SeymaMotivation.registerMotivation({
  data:function(){ return data; },
  ui:function(){ return ui; },
  dark:function(){ return dark; },
  getDay:getDay,
  activeDate:activeDate,
  diffDays:diffDays,
  icon:icon,
  esc:esc,
  segTabs:segTabs,
  progBar:progBar,
  featuresLive:featuresLive,
  fmtWhen:fmtWhen,
  fmtDateNice:fmtDateNice
})) throw new Error('MON-26: SeymaMotivation dependency bag kurulamadı');

if(!window.SeymaCrisis||typeof window.SeymaCrisis.registerCrisis!=='function') throw new Error('MON-27: SeymaCrisis registry kurulamadı');
if(!window.SeymaCrisis.registerCrisis({
  data:function(){ return data; },
  ui:function(){ return ui; },
  dark:function(){ return dark; },
  todayStr:todayStr,
  isVacationDay:isVacationDay,
  icon:icon,
  esc:esc,
  find:find,
  pad:pad
})) throw new Error('MON-27: SeymaCrisis dependency bag kurulamadı');

if(!window.SeymaJournal||typeof window.SeymaJournal.registerJournal!=='function') throw new Error('MON-28: SeymaJournal registry kurulamadı');
if(!window.SeymaJournal.registerJournal({
  data:function(){ return data; },
  ui:function(){ return ui; },
  activeDate:activeDate,
  dayIndexFor:dayIndexFor,
  todayStr:todayStr,
  addDays:addDays,
  icon:icon,
  esc:esc,
  find:find,
  motivationProgram:function(){ return window.MotivationProgramV2; }
})) throw new Error('MON-28: SeymaJournal dependency bag kurulamadı');

function ensureHealthCardState(){ if(!ui.cards) ui.cards={}; if(ui.cards['h-sleep']===undefined) ui.cards['h-sleep']=true; }

// MON-33: library / reading / watching / listening / learning / soul HTML and
// read-only projections live in app/core/library.js. Entry mutations, archive
// synchronization and backfill remain app-owned here by design.
var LISTEN_KINDS=[['sarki',icon('music',13)+' Şarkı'],['album',icon('disc',13)+' Albüm'],['podcast',icon('mic',13)+' Podcast']];
if(!window.SeymaLibrary||typeof window.SeymaLibrary.registerLibrary!=='function') throw new Error('MON-33: SeymaLibrary registry kurulamadı');
if(!window.SeymaLibrary.registerLibrary({
  data:function(){ return data; },
  ui:function(){ return ui; },
  getDay:getDay,
  todayStr:todayStr,
  addDays:addDays,
  dayIndexFor:dayIndexFor,
  shortDate:shortDate,
  fmt:fmt,
  icon:icon,
  esc:esc,
  segTabs:segTabs,
  progBar:progBar,
  starRow:starRow,
  miniBars:miniBars,
  statTile:statTile,
  ensureLibrary:ensureLibrary,
  ensureWatchlist:ensureWatchlist,
  ensureMusic:ensureMusic,
  ensureSoulArchive:ensureSoulArchive,
  findBook:findBook,
  findTitle:findTitle,
  findTrack:findTrack,
  findSoulItem:findSoulItem,
  soulActivityById:soulActivityById,
  soulCatalog:function(){ return SOUL_ACTIVITY_CATALOG; },
  bookGenres:function(){ return BOOK_GENRES; },
  titleGenres:function(){ return TITLE_GENRES; },
  listenKinds:function(){ return LISTEN_KINDS; },
  fmtDur:fmtDur,
  saygiSafeUrl:saygiSafeUrl,
  wxHm:wxHm,
  ucfirst:ucfirst
})) throw new Error('MON-33: SeymaLibrary dependency bag kurulamadı');
var SEYMA_LIBRARY=window.SeymaLibrary;
function readingStats(){ return SEYMA_LIBRARY.readingStats.apply(null,arguments); }
function bookPct(){ return SEYMA_LIBRARY.bookPct.apply(null,arguments); }
function titlePct(){ return SEYMA_LIBRARY.titlePct.apply(null,arguments); }
function libStats(){ return SEYMA_LIBRARY.libStats.apply(null,arguments); }
function readTotals(){ return SEYMA_LIBRARY.readTotals.apply(null,arguments); }
function hasRead(){ return SEYMA_LIBRARY.hasRead.apply(null,arguments); }
function readStreak(){ return SEYMA_LIBRARY.readStreak.apply(null,arguments); }
function weekReading(){ return SEYMA_LIBRARY.weekReading.apply(null,arguments); }
function todayReadPages(){ return SEYMA_LIBRARY.todayReadPages.apply(null,arguments); }
function allQuotes(){ return SEYMA_LIBRARY.allQuotes.apply(null,arguments); }
function watchStats(){ return SEYMA_LIBRARY.watchStats.apply(null,arguments); }
function watchDayStats(){ return SEYMA_LIBRARY.watchDayStats.apply(null,arguments); }
function watchTotals(){ return SEYMA_LIBRARY.watchTotals.apply(null,arguments); }
function hasWatch(){ return SEYMA_LIBRARY.hasWatch.apply(null,arguments); }
function watchStreak(){ return SEYMA_LIBRARY.watchStreak.apply(null,arguments); }
function weekWatch(){ return SEYMA_LIBRARY.weekWatch.apply(null,arguments); }
function todayWatchMin(){ return SEYMA_LIBRARY.todayWatchMin.apply(null,arguments); }
function allReplicas(){ return SEYMA_LIBRARY.allReplicas.apply(null,arguments); }
function listenDayStats(){ return SEYMA_LIBRARY.listenDayStats.apply(null,arguments); }
function listenTotals(){ return SEYMA_LIBRARY.listenTotals.apply(null,arguments); }
function hasListen(){ return SEYMA_LIBRARY.hasListen.apply(null,arguments); }
function weekListen(){ return SEYMA_LIBRARY.weekListen.apply(null,arguments); }
function listenStreak(){ return SEYMA_LIBRARY.listenStreak.apply(null,arguments); }
function musicStats(){ return SEYMA_LIBRARY.musicStats.apply(null,arguments); }
function allLyrics(){ return SEYMA_LIBRARY.allLyrics.apply(null,arguments); }
function overlayShell(){ return SEYMA_RENDER.overlayShell.apply(null,arguments); }
function soulOverlayShell(){ return SEYMA_RENDER.soulOverlayShell.apply(null,arguments); }
function bookStatusChip(){ return SEYMA_LIBRARY.bookStatusChip.apply(null,arguments); }
function readingOverlayHTML(){ return SEYMA_RENDER.readingOverlayHTML.apply(null,arguments); }
function readingTodayView(){ return SEYMA_LIBRARY.readingTodayView.apply(null,arguments); }
function bookCard(){ return SEYMA_LIBRARY.bookCard.apply(null,arguments); }
function readingLibraryView(){ return SEYMA_LIBRARY.readingLibraryView.apply(null,arguments); }
function readingStatsView(){ return SEYMA_LIBRARY.readingStatsView.apply(null,arguments); }
function readingQuotesView(){ return SEYMA_LIBRARY.readingQuotesView.apply(null,arguments); }
function compactModalShell(){ return SEYMA_LIBRARY.compactModalShell.apply(null,arguments); }
function bookEditModal(){ return SEYMA_LIBRARY.bookEditModal.apply(null,arguments); }
function quoteAddModal(){ return SEYMA_LIBRARY.quoteAddModal.apply(null,arguments); }
function titleStatusChip(){ return SEYMA_LIBRARY.titleStatusChip.apply(null,arguments); }
function watchOverlayHTML(){ return SEYMA_RENDER.watchOverlayHTML.apply(null,arguments); }
function watchTodayView(){ return SEYMA_LIBRARY.watchTodayView.apply(null,arguments); }
function titleCard(){ return SEYMA_LIBRARY.titleCard.apply(null,arguments); }
function watchArchiveView(){ return SEYMA_LIBRARY.watchArchiveView.apply(null,arguments); }
function watchStatsView(){ return SEYMA_LIBRARY.watchStatsView.apply(null,arguments); }
function watchQuotesView(){ return SEYMA_LIBRARY.watchQuotesView.apply(null,arguments); }
function titleEditModal(){ return SEYMA_LIBRARY.titleEditModal.apply(null,arguments); }
function replicaAddModal(){ return SEYMA_LIBRARY.replicaAddModal.apply(null,arguments); }
function listenKindMeta(){ return SEYMA_LIBRARY.listenKindMeta.apply(null,arguments); }
function listeningOverlayHTML(){ return SEYMA_RENDER.listeningOverlayHTML.apply(null,arguments); }
function listeningTodayView(){ return SEYMA_LIBRARY.listeningTodayView.apply(null,arguments); }
function trackCard(){ return SEYMA_LIBRARY.trackCard.apply(null,arguments); }
function listeningFavsView(){ return SEYMA_LIBRARY.listeningFavsView.apply(null,arguments); }
function listeningStatsView(){ return SEYMA_LIBRARY.listeningStatsView.apply(null,arguments); }
function listeningLyricsView(){ return SEYMA_LIBRARY.listeningLyricsView.apply(null,arguments); }
function trackEditModal(){ return SEYMA_LIBRARY.trackEditModal.apply(null,arguments); }
function lyricAddModal(){ return SEYMA_LIBRARY.lyricAddModal.apply(null,arguments); }
function learningEntryCard(){ return SEYMA_LIBRARY.learningEntryCard.apply(null,arguments); }
function learningTodayView(){ return SEYMA_LIBRARY.learningTodayView.apply(null,arguments); }
function learningOverlayHTML(){ return SEYMA_RENDER.learningOverlayHTML.apply(null,arguments); }
function soulActivityTodayView(){ return SEYMA_LIBRARY.soulActivityTodayView.apply(null,arguments); }
function soulActivityEntryCard(){ return SEYMA_LIBRARY.soulActivityEntryCard.apply(null,arguments); }
function soulPracticePickerHTML(){ return SEYMA_RENDER.soulPracticePickerHTML.apply(null,arguments); }
function soulActivityOverlayHTML(){ return SEYMA_RENDER.soulActivityOverlayHTML.apply(null,arguments); }
function soulArchiveSessions(){ return SEYMA_LIBRARY.soulArchiveSessions.apply(null,arguments); }
function soulArchiveOverlayHTML(){ return SEYMA_RENDER.soulArchiveOverlayHTML.apply(null,arguments); }

if(!window.SeymaHealth||typeof window.SeymaHealth.registerHealth!=='function'||!window.SeymaHealth.registerHealth({
  data:function(){ return data; },
  dateUtils:function(){ return window.SeymaDateUtils; },
  isVacationDay:isVacationDay,
  vacationSettings:vacationSettings,
  cycleStats:cycleStats,
  readingStats:readingStats,
  num:num,
  windDownSteps:function(){ return WIND_DOWN_STEPS; },
  ui:function(){ return ui; },
  activeDate:activeDate,
  dayIndexFor:dayIndexFor,
  shortDate:shortDate,
  dark:function(){ return dark; },
  icon:icon,
  esc:esc,
  find:find,
  cardOpen:cardOpen,
  editing:editing,
  collapsibleCardHTML:collapsibleCardHTML,
  emptyMealItems:emptyMealItems,
  meals:function(){ return MEALS; },
  sleepQ:function(){ return SLEEP_Q; },
  sleepMed:function(){ return SLEEP_MED; },
  mgForms:function(){ return MG_FORMS; },
  moods:function(){ return MOODS; },
  phases:function(){ return PHASES; },
  flow:function(){ return FLOW; },
  symptoms:function(){ return SYMPTOMS; },
  bodyRegions:function(){ return BODY_REGIONS; },
  dzSilhouette:function(){ return DZ_SILHOUETTE; },
  dlevels:function(){ return DLEVELS; },
  dmeds:function(){ return DMEDS; },
  findRegion:findRegion,
  dzColor:dzColor,
  sciNote:sciNote,
  hBadge:hBadge,
  fmtDist:fmtDist,
  fmtDur:fmtDur,
  bodyData:bodyData,
  ghCfgApp:ghCfgApp,
  dateLabelTR:dateLabelTR,
  energyStressBlock:energyStressBlock,
  timeHM:timeHM,
  ensureHealthCardState:ensureHealthCardState
})) throw new Error('MON-30: SeymaHealth dependency bag kurulamadı');

var SEYMA_HEALTH=window.SeymaHealth;

// MON-34: report/istatistik/heatmap read-only projections live in app/core/report.js.
if(!window.SeymaReport||typeof window.SeymaReport.registerReport!=='function') throw new Error('MON-34: SeymaReport registry kurulamadı');
if(!window.SeymaReport.registerReport({
  data:function(){ return data; },
  ui:function(){ return ui; },
  dark:function(){ return dark; },
  todayStr:todayStr,
  addDays:addDays,
  diffDays:diffDays,
  shortDate:shortDate,
  pad:pad,
  countRec:countRec,
  allDays:allDays,
  bestStreak:bestStreak,
  currentStreak:currentStreak,
  daysTracked:daysTracked,
  habitCountOn:habitCountOn,
  htToday:htToday,
  find:find,
  icon:icon,
  esc:esc,
  habits:function(){ return HABITS; },
  moods:function(){ return MOODS; },
  dayNutrition:dayNutrition,
  proteinGoal:proteinGoal,
  waterGoalCups:waterGoalCups,
  moodScore:moodScore,
  effSteps:effSteps,
  dayMovement:dayMovement,
  fmtDist:fmtDist,
  sciNote:sciNote,
  medFreeStreak:medFreeStreak
})) throw new Error('MON-34: SeymaReport dependency bag kurulamadı');
var SEYMA_REPORT=window.SeymaReport;

// MON-35: map/location/weather read-only surfaces live in app/core/map.js.
// Geolocation permission, weather fetch, persistence and movement handlers remain app-owned.
if(!window.SeymaMap||typeof window.SeymaMap.registerMap!=='function') throw new Error('MON-35: SeymaMap registry kurulamadı');
if(!window.SeymaMap.registerMap({
  data:function(){ return data; },
  ui:function(){ return ui; },
  dark:function(){ return dark; },
  todayStr:todayStr,
  pad:pad,
  countRec:countRec,
  habitCountOn:habitCountOn,
  diffDays:diffDays,
  moodEmoji:moodEmoji,
  icon:icon,
  esc:esc,
  sciNote:sciNote,
  bestStreak:bestStreak,
  moodDist:moodDist,
  featuresLive:featuresLive,
  hidePill:hidePill,
  cardOpen:cardOpen,
  fmtDist:fmtDist,
  fmtDur:fmtDur,
  autoModeLabel:autoModeLabel,
  healthSetupCardHTML:healthSetupCardHTML,
  collapsibleCardHTML:collapsibleCardHTML,
  haversineM:haversineM,
  moods:function(){ return MOODS; }
})) throw new Error('MON-35: SeymaMap dependency bag kurulamadı');
var SEYMA_MAP=window.SeymaMap;
function locationCardHTML(){ return SEYMA_MAP.locationCardHTML.apply(null,arguments); }
function hasLiveLocation(){ return SEYMA_MAP.hasLiveLocation.apply(null,arguments); }
function wxMode(){ return SEYMA_MAP.wxMode.apply(null,arguments); }
function weatherSpots(){ return SEYMA_MAP.weatherSpots.apply(null,arguments); }
function wxSpotIconName(){ return SEYMA_MAP.wxSpotIconName.apply(null,arguments); }
function wxSpotIcon(){ return SEYMA_MAP.wxSpotIcon.apply(null,arguments); }
function wxStale(){ return SEYMA_MAP.wxStale.apply(null,arguments); }
function wxMeta(){ return SEYMA_MAP.wxMeta.apply(null,arguments); }
function wxAdvice(){ return SEYMA_MAP.wxAdvice.apply(null,arguments); }
function wxQuip(){ return SEYMA_MAP.wxQuip.apply(null,arguments); }
function wxHm(){ return SEYMA_MAP.wxHm.apply(null,arguments); }
function wxSpotChip(){ return SEYMA_MAP.wxSpotChip.apply(null,arguments); }
function wxLocationPendingChip(){ return SEYMA_MAP.wxLocationPendingChip.apply(null,arguments); }
function wxDetail(){ return SEYMA_MAP.wxDetail.apply(null,arguments); }
function weatherHeaderHTML(){ return SEYMA_MAP.weatherHeaderHTML.apply(null,arguments); }
function haritaHTML(){
  var today=todayStr();
  if(!ui.calMonth) ui.calMonth=today.slice(0,7);
  // NOT (2026-09-15): bu sarmalayıcı render zincirinde ÇAĞRILMIYOR —
  // render.js kendi `haritaHTML()` (render.js:1767) → `mapTabHTML()` →
  // app.js:861 → `SEYMA_MAP.haritaHTML()` yolunu kullanır, buraya uğramaz.
  // Bu yüzden `ui.calMonth` ilk-kurulum koruması asıl sahibi olan
  // app/core/map.js `renderHarita` içine taşındı (orada savunmalı).
  // Bloğu silmek MON2 kapsamı dışıdır (kabuk envanteri `*HTML` sayımı pinli);
  // ölü kod kaydı: archive/monolit-bolumlenme-plan-2/deliverables/MON2-SONRASI-BULGULAR.md
  return SEYMA_RENDER.haritaHTML.apply(null,arguments);
}
// MON-36: profile assessment content/UI/scoring registry. Consent/session mutation,
// panel summary, sync merge and data/schema ownership remain app-owned.
var SEYMA_PROFILE=window.SeymaProfile||{};
if(!window.SeymaProfile||typeof window.SeymaProfile.registerProfile!=='function'||!window.SeymaProfile.registerProfile({
  data:function(){ return data; },
  ui:function(){ return ui; },
  save:save,
  icon:icon,
  esc:esc
})) throw new Error('MON-36: SeymaProfile dependency bag kurulamadı');
// MON2-06: profile alan gövdeleri app/core/profile.js registry'sindedir.
if(!window.SeymaProfile||typeof window.SeymaProfile.registerProfileSurface!=='function') throw new Error('MON2-06: SeymaProfile yüzey kaydı kurulamadı');
if(!window.SeymaProfile.registerProfileSurface({
  App:function(){ return App; },
  SEYMA_REMINDER_SURFACE:function(){ return SEYMA_REMINDER_SURFACE; },
  a:function(){ return a; },
  calcAge:function(){ return calcAge; },
  data:function(){ return data; },
  defer:function(){ return setTimeout.bind(window); },
  doc:function(){ return document; },
  haptic:function(){ return haptic; },
  icon:function(){ return icon; },
  render:function(){ return render; },
  save:function(){ return save; },
  sync:function(){ return window.SeySync||null; },
  ui:function(){ return ui; },

})) throw new Error('MON2-06: SeymaProfile yüzey kaydı kurulamadı');
// MON2-06: psych alan gövdeleri app/core/profile.js registry'sindedir.
if(!window.SeymaProfile||typeof window.SeymaProfile.registerPsychSurface!=='function') throw new Error('MON2-06: SeymaProfile yüzey kaydı kurulamadı');
if(!window.SeymaProfile.registerPsychSurface({
  App:function(){ return App; },
  PSYCH_SCALES:function(){ return PSYCH_SCALES; },
  a:function(){ return a; },
  confetti:function(){ return confetti; },
  data:function(){ return data; },
  defer:function(){ return setTimeout.bind(window); },
  doc:function(){ return document; },
  esc:function(){ return esc; },
  haptic:function(){ return haptic; },
  icon:function(){ return icon; },
  render:function(){ return render; },
  save:function(){ return save; },
  ui:function(){ return ui; },

})) throw new Error('MON2-06: SeymaProfile yüzey kaydı kurulamadı');
var PROFILE_CONSENT_VERSION=SEYMA_PROFILE.PROFILE_CONSENT_VERSION;
var PROFILE_QUALITY_WEIGHTS=SEYMA_PROFILE.PROFILE_QUALITY_WEIGHTS;
var PROFILE_CONSTRUCT_NARRATIVE=SEYMA_PROFILE.PROFILE_CONSTRUCT_NARRATIVE;
function emptyProfileAssessment(){ return SEYMA_PROFILE.emptyProfileAssessment.apply(null,arguments); }
function profileAssessmentItems(){ return SEYMA_PROFILE.profileAssessmentItems.apply(null,arguments); }
function profileAssessmentComputeCurrentIndex(responses){ return SEYMA_PROFILE.profileAssessmentComputeCurrentIndex.apply(null,arguments); }
function ensureProfileAssessment(d){ return SEYMA_PROFILE.ensureProfileAssessment.apply(null,arguments); }
function profileConsentChecks(){ return SEYMA_PROFILE.profileConsentChecks.apply(null,arguments); }
function profileConsentMandatoryOk(c){ return SEYMA_PROFILE.profileConsentMandatoryOk.apply(null,arguments); }
function profileConsentRow(key,label,checked){ return SEYMA_PROFILE.profileConsentRow.apply(null,arguments); }
function renderProfileConsent(){ return SEYMA_PROFILE.renderProfileConsent.apply(null,arguments); }
function profileAssessmentModuleForOrder(order){ return SEYMA_PROFILE.profileAssessmentModuleForOrder.apply(null,arguments); }
function profileItemDisplayIndex(){ return SEYMA_PROFILE.profileItemDisplayIndex.apply(null,arguments); }
function renderProfileItem(index){ return SEYMA_PROFILE.renderProfileItem.apply(null,arguments); }
function profileAssessmentPendingBreak(pa){ return SEYMA_PROFILE.profileAssessmentPendingBreak.apply(null,arguments); }
function renderProfileBreak(mod){ return SEYMA_PROFILE.renderProfileBreak.apply(null,arguments); }
function renderProfileAssessmentSOS(){ return SEYMA_PROFILE.renderProfileAssessmentSOS.apply(null,arguments); }
function renderProfileAssessmentGate(){ return SEYMA_PROFILE.renderProfileAssessmentGate.apply(null,arguments); }
function renderProfileCompletion(){ return SEYMA_PROFILE.renderProfileCompletion.apply(null,arguments); }
function scoreProfileItem(item,rawValue){ return SEYMA_PROFILE.scoreProfileItem.apply(null,arguments); }
function scoreProfileFacet(itemIds,responses){ return SEYMA_PROFILE.scoreProfileFacet.apply(null,arguments); }
function scoreProfileConstruct(constructId,responses){ return SEYMA_PROFILE.scoreProfileConstruct.apply(null,arguments); }
function scoreRiasec(responses){ return SEYMA_PROFILE.scoreRiasec.apply(null,arguments); }
function scoreValues(responses){ return SEYMA_PROFILE.scoreValues.apply(null,arguments); }
function scoreAttachment(responses){ return SEYMA_PROFILE.scoreAttachment.apply(null,arguments); }
function scoreProfileAssessment(responses){ return SEYMA_PROFILE.scoreProfileAssessment.apply(null,arguments); }
function profileAssessmentQualityCategory(score){ return SEYMA_PROFILE.profileAssessmentQualityCategory.apply(null,arguments); }
function scoreProfileAssessmentQuality(responses){ return SEYMA_PROFILE.scoreProfileAssessmentQuality.apply(null,arguments); }
function profileBand(mean){ return SEYMA_PROFILE.profileBand.apply(null,arguments); }
function profileBandLabel(band){ return SEYMA_PROFILE.profileBandLabel.apply(null,arguments); }
function profileConstructSentence(label,mean){ return SEYMA_PROFILE.profileConstructSentence.apply(null,arguments); }
function profileAssessmentContradictionNotes(scores){ return SEYMA_PROFILE.profileAssessmentContradictionNotes.apply(null,arguments); }
function buildProfileReport(scores,quality){ return SEYMA_PROFILE.buildProfileReport.apply(null,arguments); }
// MON-37: settings view/read registry; no direct data bag and no mutation ownership.
var SEYMA_SETTINGS=window.SeymaSettings||{};
if(!window.SeymaSettings||typeof window.SeymaSettings.registerSettings!=='function'||!window.SeymaSettings.registerSettings({
  state:function(){ return data; },
  view:function(){ return ui; },
  theme:function(){ return themePref; },
  icon:icon,
  esc:esc,
  reminderCopy:reminderCopy,
  daysTracked:daysTracked,
  countRec:countRec,
  featuresLive:featuresLive,
  todayStr:todayStr,
  syncConfigured:syncConfigured
})) throw new Error('MON-37: SeymaSettings registry kurulamadı');

// MON-49: render registry. Canlı data/dark resolverları, app-owned card/banner/
// save/mutation üreticileri ve domain giriş resolverları tek dependency bag ile bağlanır.
var SEYMA_RENDER=window.SeymaRender||{};
if(!window.SeymaRender||typeof window.SeymaRender.registerRender!=='function'||!window.SeymaRender.registerRender({
  data:function(){ return data; },
  ui:function(){ return ui; },
  dark:function(){ return dark; },
  todayStr:todayStr,
  editing:editing,
  activeDate:activeDate,
  dayIndexFor:dayIndexFor,
  currentStreak:currentStreak,
  countRec:countRec,
  habitCountOn:habitCountOn,
  gununHavasi:gununHavasi,
  dailyPhotoCardHTML:dailyPhotoCardHTML,
  saveBanner:saveBanner,
  shouldShowAeonNotifyBanner:shouldShowAeonNotifyBanner,
  aeonNotifyBannerHTML:aeonNotifyBannerHTML,
  locationCardHTML:locationCardHTML,
  vacationCardHidden:vacationCardHidden,
  vacationCardHTML:vacationCardHTML,
  weatherHeaderHTML:weatherHeaderHTML,
  journalLightCardHTML:journalLightCardHTML,
  reminderInboxCardHTML:reminderInboxCardHTML,
  rasitBubbleHTML:rasitBubbleHTML,
  rasitContactHTML:rasitContactHTML,
  dateLabelTR:dateLabelTR,
  esc:esc,
  icon:icon,
  heroPremiumStatsHTML:heroPremiumStatsHTML,
  heroStatsHTML:heroStatsHTML,
  heroTargetsHTML:heroTargetsHTML,
  heroScienceLine:heroScienceLine,
  motivationTodayEntryHTML:function(){ return window.SeymaMotivation.motivationTodayCardHTML.apply(null,arguments); },
  rasitActionsHTML:rasitActionsHTML,
  hubTilesHTML:hubTilesHTML,
  magnesiumFeedbackHTML:magnesiumFeedbackHTML,
  magnesiumBannerHTML:magnesiumBannerHTML,
  moodCardHTML:moodCardHTML,
  daily:function(){ return DAILY; },
  motivationProgramV2:function(){ return window.MotivationProgramV2; },
  eveningNudge:eveningNudge,
  habitsCardHTML:habitsCardHTML,
  stepReminder:stepReminder,
  beslenmeCardHTML:beslenmeCardHTML,
  waterCard:waterCard,
  reflectionCardHTML:reflectionCardHTML,
  onThisDayCard:onThisDayCard,
  healthTabHTML:function(){ return SEYMA_HEALTH.saglikHTML.apply(null,arguments); },
  reportTabHTML:function(){ return SEYMA_REPORT.raporHTML.apply(null,arguments); },
  mapTabHTML:function(){ return SEYMA_MAP.haritaHTML.apply(null,arguments); },
  saygiTabHTML:function(){ return window.SeymaSaygi.saygiHTML.apply(null,arguments); },
  roomOverlayEntryHTML:function(){ return window.SeymaMotivation.roomOverlayHTML.apply(null,arguments); },
  readingOverlayEntryHTML:function(){ return SEYMA_LIBRARY.readingOverlayHTML.apply(null,arguments); },
  watchOverlayEntryHTML:function(){ return SEYMA_LIBRARY.watchOverlayHTML.apply(null,arguments); },
  listeningOverlayEntryHTML:function(){ return SEYMA_LIBRARY.listeningOverlayHTML.apply(null,arguments); },
  learningOverlayEntryHTML:function(){ return SEYMA_LIBRARY.learningOverlayHTML.apply(null,arguments); },
  soulPracticePickerEntryHTML:function(){ return SEYMA_LIBRARY.soulPracticePickerHTML.apply(null,arguments); },
  soulActivityOverlayEntryHTML:function(){ return SEYMA_LIBRARY.soulActivityOverlayHTML.apply(null,arguments); },
  soulArchiveOverlayEntryHTML:function(){ return SEYMA_LIBRARY.soulArchiveOverlayHTML.apply(null,arguments); },
  settingsTabHTML:function(){ return window.SeymaSettings.ayarlarHTML.apply(null,arguments); },
  messageTabHTML:function(){ return SEYMA_MESSAGING.mesajHTML.apply(null,arguments); },
  appHeaderMeta:function(){ return appHeaderMeta.apply(null,arguments); },
  headerSkyClassNow:function(){ return headerSkyClassNow.apply(null,arguments); },
  saveButtonHTML:function(){ return saveButtonHTML.apply(null,arguments); },
  headerActionHTML:function(){ return headerActionHTML.apply(null,arguments); },
  headerSceneHTML:function(){ return headerSceneHTML.apply(null,arguments); },
  unreadNotifCount:function(){ return unreadNotifCount.apply(null,arguments); },
  featuresLive:function(){ return featuresLive.apply(null,arguments); },
  saygiCurrentPerson:function(){ return saygiCurrentPerson.apply(null,arguments); },
  saygiHasRead:function(){ return saygiHasRead.apply(null,arguments); },
  getDay:function(){ return getDay.apply(null,arguments); },
  ensurePrayerDay:function(){ return ensurePrayerDay.apply(null,arguments); },
  prayerDaySummary:function(){ return prayerDaySummary.apply(null,arguments); },
  zikrDayCompleted:function(){ return zikrDayCompleted.apply(null,arguments); },
  overlayShellEntryHTML:function(){ return SEYMA_LIBRARY.overlayShell.apply(null,arguments); },
  soulOverlayShellEntryHTML:function(){ return SEYMA_LIBRARY.soulOverlayShell.apply(null,arguments); },
  aeonAttachSheetHTML:function(){ return aeonAttachSheetHTML.apply(null,arguments); },
  aeonLoadVisibleMedia:function(){ return aeonLoadVisibleMedia.apply(null,arguments); },
  authGateHTML:function(){ return authGateHTML.apply(null,arguments); },
  crisisModalHTML:function(){ return crisisModalHTML.apply(null,arguments); },
  editBanner:function(){ return editBanner.apply(null,arguments); },
  ensureProfileAssessment:function(){ return ensureProfileAssessment.apply(null,arguments); },
  faithCornerOverlayHTML:function(){ return faithCornerOverlayHTML.apply(null,arguments); },
  journalModalHTML:function(){ return journalModalHTML.apply(null,arguments); },
  locationGateHTML:function(){ return locationGateHTML.apply(null,arguments); },
  locationGateRequired:function(){ return locationGateRequired.apply(null,arguments); },
  maybeFetchDailyPhoto:function(){ return maybeFetchDailyPhoto.apply(null,arguments); },
  mountSkyCanvas:function(){ return mountSkyCanvas.apply(null,arguments); },
  needsAuth:function(){ return needsAuth.apply(null,arguments); },
  paintAmbientShell:function(){ return paintAmbientShell.apply(null,arguments); },
  qiblaOverlayHTML:function(){ return qiblaOverlayHTML.apply(null,arguments); },
  quranJourneyOverlayHTML:function(){ return quranJourneyOverlayHTML.apply(null,arguments); },
  reminderActiveElementId:function(){ return reminderActiveElementId.apply(null,arguments); },
  reminderCenterOverlayHTML:function(){ return reminderCenterOverlayHTML.apply(null,arguments); },
  reminderRestoreFocus:function(){ return reminderRestoreFocus.apply(null,arguments); },
  renderProfileAssessmentGate:function(){ return renderProfileAssessmentGate.apply(null,arguments); },
  saygiDisconnectReadObserver:function(){ return saygiDisconnectReadObserver.apply(null,arguments); },
  saygiFloatingReadHTML:function(){ return saygiFloatingReadHTML.apply(null,arguments); },
  saygiPersonModalHTML:function(){ return saygiPersonModalHTML.apply(null,arguments); },
  wireAppHeaderScroll:function(){ return wireAppHeaderScroll.apply(null,arguments); },
  wireSaygiReadGate:function(){ return wireSaygiReadGate.apply(null,arguments); },
  zikroverlayHTML:function(){ return zikroverlayHTML.apply(null,arguments); },
  locBenefits:function(){ return LOC_BENEFITS; },
  renderState:function(){
    var state={};
    Object.defineProperties(state,{
      lastRenderTab:{get:function(){ return lastRenderTab; },set:function(v){ lastRenderTab=v; }},
      lastOverlay:{get:function(){ return lastOverlay; },set:function(v){ lastOverlay=v; }},
      lastOverlayView:{get:function(){ return lastOverlayView; },set:function(v){ lastOverlayView=v; }},
      lastHeaderShown:{get:function(){ return lastHeaderShown; },set:function(v){ lastHeaderShown=v; }},
      lastRoomOpen:{get:function(){ return lastRoomOpen; },set:function(v){ lastRoomOpen=v; }},
      lastCrisisKind:{get:function(){ return lastCrisisKind; },set:function(v){ lastCrisisKind=v; }}
    });
    return state;
  },
  zikrV2Visible:function(){ return ZIKR_V2_VISIBLE; },
  // MON2-05: taşınan *HTML gövdelerinin sabit/yardımcı bağımlılıkları
  AEON_ICON_URL:function(){ return AEON_ICON_URL; },
  DERIVED_ACCENT:function(){ return DERIVED_ACCENT; },
  DERIVED_HABITS:function(){ return DERIVED_HABITS; },
  HABITS:function(){ return HABITS; },
  MOODS:function(){ return MOODS; },
  NOTES:function(){ return NOTES; },
  QURAN_DEFAULT_SURAH_ID:function(){ return QURAN_DEFAULT_SURAH_ID; },
  QURAN_FILTERS:function(){ return QURAN_FILTERS; },
  QURAN_VIDEO_ID_RE:function(){ return QURAN_VIDEO_ID_RE; },
  REFLECT_PROMPTS:function(){ return REFLECT_PROMPTS; },
  SHORT_HABIT:function(){ return SHORT_HABIT; },
  TEL:function(){ return TEL; },
  VACATION_WATER_GOAL:function(){ return VACATION_WATER_GOAL; },
  WA:function(){ return WA; },
  addDays:addDays,
  allDays:allDays,
  calGoal:calGoal,
  carbsGoal:carbsGoal,
  cardOpen:cardOpen,
  collapsibleCardHTML:collapsibleCardHTML,
  dayNutrition:dayNutrition,
  derivedProgText:derivedProgText,
  diffDays:diffDays,
  effSteps:effSteps,
  energyStressBlock:energyStressBlock,
  ensureQuranJourney:ensureQuranJourney,
  ensureVacationSettings:ensureVacationSettings,
  ensureZikrRoot:ensureZikrRoot,
  fmtDateNice:fmtDateNice,
  getStats:getStats,
  habitProgress:habitProgress,
  heroStatTile:heroStatTile,
  hexA:hexA,
  isIOS:isIOS,
  isStandalonePWA:isStandalonePWA,
  isVacationDay:isVacationDay,
  moodInterp:moodInterp,
  proteinGoal:proteinGoal,
  psychFlat:psychFlat,
  psychMotiv:psychMotiv,
  psychOptions:psychOptions,
  quranActiveFilter:quranActiveFilter,
  quranActiveVerse:quranActiveVerse,
  quranCanRequest:quranCanRequest,
  quranCatalog:quranCatalog,
  quranDetailAction:quranDetailAction,
  quranEmbedOrigin:quranEmbedOrigin,
  quranFilterCounts:quranFilterCounts,
  quranFilterLabel:quranFilterLabel,
  quranFilteredSurahs:quranFilteredSurahs,
  quranJourneyCardCopy:quranJourneyCardCopy,
  quranJourneyStats:quranJourneyStats,
  quranNoteDraftFor:quranNoteDraftFor,
  quranNoteKindMeta:quranNoteKindMeta,
  quranNoteTimeLabel:quranNoteTimeLabel,
  quranPlaceDisputed:quranPlaceDisputed,
  quranPlaceLabel:quranPlaceLabel,
  quranPreviewToneOf:quranPreviewToneOf,
  quranQuestionAction:quranQuestionAction,
  quranRequestOf:quranRequestOf,
  quranRowState:quranRowState,
  quranSortNotes:quranSortNotes,
  quranStatusNote:quranStatusNote,
  quranSurah:quranSurah,
  quranTotal:quranTotal,
  quranVideoThumbUrl:quranVideoThumbUrl,
  quranViewBodyHTML:quranViewBodyHTML,
  rasitNoteIdx:rasitNoteIdx,
  shortDate:shortDate,
  sleepGoalHours:sleepGoalHours,
  stepsGoal:stepsGoal,
  waterGoalCups:waterGoalCups,
  weekBlock:weekBlock,
  zikrActivePreset:zikrActivePreset,
  zikrViewBodyHTML:zikrViewBodyHTML,
  find:find,
})) throw new Error('MON-49: SeymaRender registry kurulamadı');
// === Kafein hesabı ===
var CAFFEINE_TYPES=SEYMA_HEALTH.CAFFEINE_TYPES;
var CAFFEINE_LIMITS=SEYMA_HEALTH.CAFFEINE_LIMITS;
var CAFFEINE_SINGLE_DOSE=SEYMA_HEALTH.CAFFEINE_SINGLE_DOSE;
var CAFFEINE_HALFLIFE_H=SEYMA_HEALTH.CAFFEINE_HALFLIFE_H;
var CAFFEINE_SLEEP_SAFE_MG=SEYMA_HEALTH.CAFFEINE_SLEEP_SAFE_MG;
var CAFFEINE_CUTOFF_H=SEYMA_HEALTH.CAFFEINE_CUTOFF_H;
var CAFFEINE_DEFAULT_BED=SEYMA_HEALTH.CAFFEINE_DEFAULT_BED;
function caffeineType(){ return SEYMA_HEALTH.caffeineType.apply(null,arguments); }
function caffeineMode(){ return SEYMA_HEALTH.caffeineMode.apply(null,arguments); }
function caffeineLimit(){ return SEYMA_HEALTH.caffeineLimit.apply(null,arguments); }
function caffeineTargetBed(){ return SEYMA_HEALTH.caffeineTargetBed.apply(null,arguments); }

// ── Magnezyum Danışmanı sabitleri ──
var MG_MAX_ELEMENTAL=SEYMA_HEALTH.MG_MAX_ELEMENTAL;
var MG_FORMS=[
  {id:'glycinate',label:'Glisinat',icon:icon('moon',16),bestFor:['sleep','anxiety','muscle'],note:'Yatmadan önce uykuya yardımcı; mideye nazik.'},
  {id:'citrate',label:'Sitrat',icon:icon('zap',16),bestFor:['cramp','bloating','constipation'],note:'Kramp ve şişkinlikte destekleyici; bağırsak hareketini artırabilir.'},
  {id:'oxide',label:'Oksit',icon:icon('pill',16),bestFor:['general'],note:'Ekonomik ama emilimi düşük; ishal riski yüksek.'},
  {id:'sulfate',label:'Sülfat',icon:icon('droplets',16),bestFor:['bath','topical'],note:'Epsom tuzu olarak banyoda kullanılır; oral önerilmez.'},
  {id:'other',label:'Diğer / Karışık',icon:icon('flask',16),bestFor:['general'],note:'Bileşenleri kontrol et; elementer magnezyum miktarına bak.'}
];
var MG_SYMPTOM_WEIGHTS=SEYMA_HEALTH.MG_SYMPTOM_WEIGHTS;
var MG_WEIGHTS=SEYMA_HEALTH.MG_WEIGHTS;
var MG_REASON_LABELS=SEYMA_HEALTH.MG_REASON_LABELS;
var MG_PHASE_LABELS=SEYMA_HEALTH.MG_PHASE_LABELS;
var MG_PHASE_COLORS=SEYMA_HEALTH.MG_PHASE_COLORS;

// "HH:MM" -> dakika
function hhmmToMin(){ return SEYMA_HEALTH.hhmmToMin.apply(null,arguments); }
function minToHHMM(){ return SEYMA_HEALTH.minToHHMM.apply(null,arguments); }
function caffeineDrinks(){ return SEYMA_HEALTH.caffeineDrinks.apply(null,arguments); }
function caffeineTotalMg(){ return SEYMA_HEALTH.caffeineTotalMg.apply(null,arguments); }
function caffeineLastTime(){ return SEYMA_HEALTH.caffeineLastTime.apply(null,arguments); }
function caffeineMaxSingle(){ return SEYMA_HEALTH.caffeineMaxSingle.apply(null,arguments); }
function caffeineResidueAt(){ return SEYMA_HEALTH.caffeineResidueAt.apply(null,arguments); }
function caffeineCutoffTime(){ return SEYMA_HEALTH.caffeineCutoffTime.apply(null,arguments); }
function caffeineTimingOk(){ return SEYMA_HEALTH.caffeineTimingOk.apply(null,arguments); }
function isLutealDay(date){ var cs=cycleStats(); return cs.phase==='luteal' && date===todayStr(); }
function habitCountOn(date){ var n=0; for(var i=0;i<HABITS.length;i++){ var s=HABITS[i].since; if(!s||(date&&date>=s)) n++; } return n; }
function htToday(){ return habitCountOn(todayStr()); }
function emptyDiscomfort(){ return {regions:{},note:'',meds:[]}; }
var MOODS=[
  {id:'cok-iyi',label:'Çok iyi',short:'Çok iyi',icon:'sun',resp:'Bugün ışık saçıyoruz anlaşılan.'},
  {id:'iyi',label:'İyi',short:'İyi',icon:'flower-2',resp:'Gayet güzel. Ritim kuruluyor.'},
  {id:'normal',label:'Normal',short:'Normal',icon:'leaf',resp:'Normal de olur. Her gün festival değil.'},
  {id:'zorlandim',label:'Zorlandım',short:'Zor',icon:'cloud-rain',resp:'Zor günler oyundan düşürmez Sevgili Günışığı.'},
  {id:'cok-zorlandim',label:'Çok zorlandım',short:'Çok zor',icon:'droplets',resp:'Bugün sadece kendine yüklenmemek bile yeter.'}
];
// ── Kriz odaları: Tatlı · Yemek · Kahve. Her biri süreli, bilimsel bir mikro-müdahale.
// "Krizi yönettim" ilgili günün doneField'ini kurar → bağlı tik kendiliğinden yeşillenir.
// (Kahve krizinin tiki yok — yalnızca kayıt tutulur; sweet→sweetManaged, food→foodManaged.)
var DAILY=[
  "Bugün tek görevin başlamak. Gerisi kendiliğinden gelir.",
  "Tatlıyı silmiyoruz; sadece patronun sen olduğunu hatırlatıyoruz.",
  "Tok bir Şeyma, sakin bir Şeyma. Bugün öğünleri atlamıyoruz.",
  "Akşam mutfağı bugün kısa ziyaret saatleriyle çalışıyor.",
  "Bir lokma planı bozmaz; bırakmak bozar, o da bugün yok.",
  "Kısacık bir yürüyüş bile bugünü senin lehine çevirir.",
  "Bir hafta tamam. Bu küçük bir şey değil, bayağı iş.",
  "Kriz gelirse plan hazır: önce su, sonra nefes, sonra karar.",
  "Bugün düzen günü. Sürpriz yok, sadece sakin bir ritim.",
  "Yarı yola az kaldı; akıllı seçimler sessizce birikiyor.",
  "Hamur işiyle bugün medeni bir mesafe: selamlaşırız, sarılmayız.",
  "Akşamki o istek çoğu zaman açlık değil. Bir bak bakalım.",
  "Su artı yürüyüş, bugünün sessiz kahramanları.",
  "İki hafta geride. Kontrol da keyif de sende.",
  "Bugünün hedefi sade: rayda kal, gerisi gelir.",
  "Tatlı çekti mi? Önce üç soru: aç mıyım, sıkkın mıyım, yorgun muyum?",
  "Protein masada olunca krizler sesini kısıyor.",
  "Mutfakla bugün laubali değil, ölçülü bir ilişki.",
  "Küçük seçimler toplanıyor; sen de gayet güzel toplanıyorsun.",
  "Son düzlük. Bu bir yarış değil, sadece bir prova.",
  "Şeyma tamamlandı. Tatlıya saygı, kendine daha çok saygı."
];
var NOTES=[
  "Sevgili Günışığı, mükemmel olmana gerek yok; ben zaten senden yanayım.",
  "Bugün bir şeyi iyi yaptıysan o gün kazanılmıştır, gerisi teferruat.",
  "Aç kalma sakın; aç kalınca sen değil, içindeki kurabiye lobisi konuşuyor.",
  "Nutella'yı yargılamıyorum ama onu da fazla ciddiye almıyoruz, anlaştık mı?",
  "Tatlı krizi geldiğinde panikleme; ekip hazır, kaptan sensin.",
  "Bir lokma yüzünden koca günü yargılamak yok. Kraliçe sakinliğiyle devam.",
  "Akşam dolabın önünde durduğunda bana bir mesaj at, krizini birlikte dağıtalım.",
  "Sen bir flamingo gibisin Sevgili Günışığı: dengede dururken bile zarif.",
  "Bugün sadece su içip yürüdüysen bile kendine baktın demektir, gerisi bonus.",
  "Tatlıyla aranı açmak küslük değil; sadece medeni bir sınır koymak.",
  "Sen koca bir kraliçesin, o minik bir kurabiye. Denge hep sende.",
  "Zor bir gün mü oldu? Olur. Yarın seni bekleyen tertemiz bir sayfa var.",
  "Gülümsediğinde tatlı listesi bir alt sıraya kayıyor, fark ettin mi?",
  "Bugün kendine kibar davran; sen senin en sadık takım arkadaşınsın.",
  "Bir bardak su, bir derin nefes, bir 'ben hallederim'. Tüm formül bu.",
  "Ben buradayım Sevgili Günışığı. Kötü bir an olursa önce bana yaz, sonra dolaba değil.",
  "Akşam yürüyüşünde şehir senin podyumun; baş model sensin.",
  "Küçük zaferlerini küçümseme; birikince koca bir 'aferin' oluyorlar.",
  "Bugün ters giden bir şey olduysa bile ben yine seninle gurur duyuyorum.",
  "Tatlıyı sevmek suç değil; sadece her duyguyu tatlıyla çözmemeyi deniyoruz.",
  "Yorulduğunda mola vermek de plana dahil. Dur, nefeslen, sonra devam et.",
  "Bu oyunda da oyun dışında da takımın hep senden yana, Sevgili Günışığı.",
  "Günaydın Günışığı! Bugün en zor rakibin aynadaki gülümsemenle çoktan yenildi.",
  "Kurabiye bir kez daha seni aradı; açmadın. İşte bu, sessiz bir zafer.",
  "Bugün planın bozulduysa üzülme; en güzel danslar bazen doğaçlamadır.",
  "Su şişen senin küçük asan; bir yudum al, kraliçe modunu aç.",
  "Bir kâse yoğurt, bir avuç ceviz: minik ama sadık iki dost.",
  "Terazi bir sayı söyler ama senin değerini söyleyemez, o benim işim.",
  "Bugün üç öğün de dengedeyse sana koca bir 'işte benim Günışığım' borçluyum.",
  "Canın sıkkınsa önce beni ara; ben dinlerim, dolap dinlemez.",
  "Yürüyüş ayakkabıların bugün seni bekliyor; onları hayal kırıklığına uğratma olur mu?",
  "Protein senin görünmez zırhın; öğüne bir yumurta ekle, krizler bir adım geri gitsin.",
  "Bir gün kaçırdıysan seri bozulmadı; sadece nefes molası verdi.",
  "Tatlı seni değil, sen tatlıyı yönetiyorsun. Patron kim? Sen.",
  "Bugün kendine 'aferin' demeyi unutma; bunu en çok hak eden sensin.",
  "Akşam yedi oldu, mutfak kapandı. Şef Günışığı bugünlük paydos etti.",
  "Kendine kızacaksan önce bir sarıl; öfke sarılmanın yanında pek tutunamaz.",
  "Bugün küçük bir iyilik yaptıysan bedenine, o iyiliği yarın sana faiziyle döner.",
  "Uyku senin gizli güzellik ekibin; bu gece onlara fazla mesai yaptırma.",
  "Bir dilim ekmek dünyanın sonu değil; panik, ondan çok daha kalorili.",
  "Sen bir bahçesin Günışığı; bugün kendine biraz su, biraz güneş ver yeter.",
  "Kahveni içerken bir de kendine 'bugünü seveceğim' de, ikisi çok yakışıyor.",
  "En sevdiğim haberin: bugün de pes etmedin. Bu benim için manşet.",
  "Kilo değil, hâl önemli. Bugün nasıl hissediyorsun, gerçek soru bu.",
  "Bir öğünü atladıysan telafi çılgınlığına gerek yok; bir sonraki öğünde sakin dön.",
  "Bugün moralin düşükse, bu bir hava durumu; geçici, sen kalıcısın.",
  "Yürürken kollarını salla, başını dik tut; şehir bugün senin defilene bakıyor.",
  "Bir bardak su üşenmenin panzehiri, iki bardak su ise mucize başlangıcı.",
  "Kendine söz ver: bugün bir kez daha, sadece bir kez daha nazik olacağım.",
  "Tatlı krizi 20 dakikalık bir misafirdir; kapıyı açma, kendi gider.",
  "Bugün spor yapamadıysan merdiveni tercih et; beden küçük jestleri de sayar.",
  "Sen zaten yeterlisin Günışığı; bu yolculuk 'daha iyi' için değil, 'daha huzurlu' için.",
  "Bir tabak salata bir öğünü kurtarır, bir gülümseme bütün günü.",
  "Bugün stresliysen çeneni gevşet, omuzlarını indir; beden gerginliği bırakmayı sever.",
  "Dolap seni çağırıyorsa muhtemelen aç değil, yorgunsun. Önce bir uzan.",
  "Küçük adımlar sıkıcı gelir ama zirveye çıkanların hepsi öyle yürüdü.",
  "Bugün bir 'hayır' dediysen kendine iyi geleni seçtin; işte olgunluk bu.",
  "Sen benim en gurur duyduğum projemsin ve teslim tarihi yok, acele yok.",
  "Bir avuç badem, bir bardak su: krizin en sevmediği ikili.",
  "Bugün geç kalktıysan sorun değil; güneş de bazen ağır uyanır, yine de ısıtır.",
  "Ne yediğini değil, neden yediğini merak et; cevap çoğu zaman lezzet değil, duygu.",
  "Bugün bir bardak fazla su içtiysen, cildin sana gizlice teşekkür etti bile.",
  "Zayıf anların da senin; onları saklama, birlikte kucaklarız.",
  "Kraliçeler de yorulur Günışığı; taht her zaman dik oturmayı gerektirmez.",
  "Bir mola, bir nefes, bir 'devam'. En güçlü üçlü bu.",
  "Bugün kendine baktıysan, dünyanın en önemli işini hallettin demektir.",
  "Tartıya değil takvime bak; kaç gün kendine iyi baktın, asıl skor o.",
  "Akşam atıştırması yerine dişlerini fırçala; ağız naneli olunca kriz utanıp kaçar.",
  "Bugün bir öğünde protein varsa, yarınki krizin bileti şimdiden iptal oldu.",
  "Sen bir maraton koşucususun Günışığı, sprinter değil; tempolu ol, kazanan sensin.",
  "Bugün üzgünsen ağla, sonra yüzünü yıka; ikisi de temizler.",
  "Bir fincan bitki çayı, bir battaniye, bir sen: mükemmel akşam tarifi.",
  "Kendine 'başaramam' deme; o cümleyi sana ben yasakladım.",
  "Bugün küçük bir sınır koyduysan, öz saygının kasları çalıştı demektir.",
  "Yürüyüş sonrası o hafiflik hissi var ya, işte bedenin sana 'teşekkürler' demesi.",
  "Bir gün bozulunca serini değil moralini korumaya bak; seri zaten seni bekler.",
  "Bugün gülümsedin mi? O zaman gün, senin lehine kapandı bile.",
  "Aç açık markete gitme; boş mide en kötü alışveriş danışmanıdır.",
  "Sen olduğun hâlinle bir sanat eserisin; ben sadece çerçeveyi tutuyorum.",
  "Bugün bir kere daha denedin; işte cesaret dedikleri tam olarak bu.",
  "Kilo veren değil, huzur bulan bir Günışığı istiyorum; gerisi kendiliğinden gelir.",
  "Bir tabak sebzeye 'merhaba' de; o da sana enerjiyle karşılık verir.",
  "Bugün uykusuz kaldıysan kendine yükleme; yorgunken herkesin tatlı radarı açılır.",
  "Sabah bir bardak su, akşam bir sayfa kitap: küçük ritüeller büyük insanlar yapar.",
  "Bugün canın çekti ve yemedin diye seni alkışlıyorum, duyuyor musun?",
  "Panik yaptığında zaman genişler; 10 saniye say, kriz çoktan küçülür.",
  "Sen bir flamingosun: tek ayağın üstünde bile duruşundan ödün vermezsin.",
  "Bugün bir yudum su, bir adım yürüyüş, bir güzel düşünce. Toplam: kazanılmış gün.",
  "Kendini başkalarıyla değil, dünkü kendinle kıyasla; tek adil terazi bu.",
  "Bugün dolabı üç kere açıp kapadıysan ve yemedinse, iradene madalya takıyorum.",
  "Akşam kriziyle yalnız savaşma; telefonun bir tık ötede, ben hep açığım.",
  "Bugün kendine bir iyilik yaptıysan, o iyilik yarının Günışığı'na miras kalır.",
  "Tatlı bir ödül değil, bazen sadece bir alışkanlık; alışkanlıklar ise değişebilir.",
  "Sen yeterince güçlüsün Günışığı; sadece bunu bazen hatırlaman gerekiyor, ben hatırlatırım.",
  "Bir kâse çorba, soğuk bir günde en sadık dosttur; bugün onu yanına çağır.",
  "Bugün planına yüzde yetmiş uyduysan, o gün başarıyla mühürlenmiştir.",
  "Kendine sabırlı ol; en güzel çiçekler bile açmak için bir mevsim bekler.",
  "Bugün bir kez 'yeter, kendime iyi bakacağım' dediysen, devrim başladı bile.",
  "Yürürken müzik aç, temponu bul; en iyi terapiler bazen bir çalma listesidir.",
  "Bir dilim tatlı yediysen keyfini çıkar, sonra sayfayı çevir; suçluluk fazladan kalori.",
  "Sen benim favori insanımsın ve bu unvan hiçbir günde geri alınmaz.",
  "Bugün erken uyursan, yarının Günışığı sana gülümseyerek uyanır.",
  "Kendine 'bugün fena değildim' diyebiliyorsan, aslında harikaydın demektir.",
  "Bir bardak su elinde, bir gülümseme yüzünde; işte kazanan kombinasyon.",
  "Bugün ne kadar zorlanırsan zorlan, ben yine en çok sana inanıyorum.",
  "Denge mükemmellik değildir Günışığı; bazen bir eğrilir, sonra yine düzelirsin.",
  "Akşam yürüyüşü bir lüks değil, kendine yazdığın küçük bir aşk mektubudur.",
  "Bugün de buradasın, deniyorsun, vazgeçmiyorsun; benim gözümde bu tam bir zafer.",
  "Günışığı, sen sabah kahvemden bile daha çok içimi ısıtıyorsun; bunu bilesin diye söylüyorum.",
  "Buzdolabı ışığı romantik değil Günışığı; asıl parıltı senin gülüşünde. Kapağı kapat, aynaya bak.",
  "Tartı bugün ne derse desin, benim gözümde zaten bir numarasın; jüri tek kişilik ve rüşvet almış.",
  "Bir tabak dolusu sabır, bir kaşık öz-şefkat: en sevdiğim tarif hâlâ sensin.",
  "Kurabiye seni aradı, açmadın; şimdi ikimiz ona kızmıyoruz ama gururla bakıyoruz sana.",
  "Sen bir flamingosun Günışığı; çamurun içinde bile pembe kalmayı beceriyorsun, buna hayranım.",
  "Bugün 'yeter' diyebildiysen, o küçük cümle bütün bir sarayın en sağlam tuğlası oldu.",
  "Canın tatlı çekti diye seni yargılayacak değilim; ben ancak sana sarılmayı bilirim.",
  "Aç kalma sakın; aç Günışığı, dünyanın en dahi ama en huysuz danışmanıdır.",
  "Bir bardak su iç de o minik kraliçe tacın parlasın; susuz taht küser, biliyorsun.",
  "Bugün planın delik deşik olduysa dert etme; en güzel dantel bile deliklerden yapılır.",
  "Sen uyurken bile bu takımın kaptanısın Günışığı; ben sadece kenarda alkış tutan yardımcı antrenörüm.",
  "Akşam mutfağa gizli sefer düzenlemedin diye seni madalyayla değil, koca bir sarılmayla ödüllendiriyorum.",
  "Mükemmel olmaya çalışma; zaten olduğun hâlinle benim favori bölümümsün, tekrar tekrar izlerim.",
  "Bir dilim ekmek koca günü bozmaz Günışığı; asıl bozan, kendine söylediğin o sert cümleler.",
  "Bugün sadece nefes aldıysan bile, ben yine seninle gurur duyuyorum; çıta orada bugün.",
  "Sen o kadar tatlısın ki, yanında hiçbir tatlının şansı yok; rekabeti baştan kaybettiler.",
  "Yürüyüşe çık Günışığı; sokaklar seni görünce 'bugün hava güzelleşti' diye fısıldıyor.",
  "Bir 'hayır' dedin ya kendine yormayan şeye, işte o an içindeki kraliçe hafifçe gülümsedi.",
  "Dolabın önünde durduğunda telefonu aç, beni ara; ben dinlerim, dolap sadece üşütür.",
  "Zor bir gün mü? Gel, birlikte küçültelim; iki kişi taşıyınca dünya bir anda hafifliyor.",
  "Sen bir bahçesin Günışığı; bugün biraz su, biraz güneş, biraz da 'aferin' yeter, gerisi kendi açar.",
  "Bugün üç öğün dengedeyse sana bir kupa değil, koca bir 'işte benim Günışığım' borçluyum.",
  "Kilonu değil, kahkahanı ölç Günışığı; asıl artması gereken skor o.",
  "Bir avuç badem, bir yudum su, bir derin nefes: krizin en korktuğu üçlü sahnede.",
  "Bugün geç kalktıysan sorun değil; güneş bile bazen 'beş dakika daha' der, yine de doğar.",
  "Sen benim en uzun soluklu projemsin Günışığı ve inan, teslim tarihi yok, acele hiç yok.",
  "Tatlıyı sevmek suç değil; biz sadece her duyguyu tatlıya şikâyet etmemeyi deniyoruz, o kadar.",
  "Bir gün seriyi kaçırdın diye çöpe gitmez; seri seni bekler, çünkü aranızda sadakat var.",
  "Bugün kendine kibar bir cümle kurduysan, beynin onu duydu ve sessizce 'teşekkürler' dedi.",
  "Sen dağınık günlerinde bile zarifsin Günışığı; dağınıklık sana yakışan tek şey belki de.",
  "Akşam dişini fırçala, nane serinliği krizi utandırıp geri gönderir; küçük ama kurnaz bir taktik.",
  "Bugün bir bardak fazla su içtiysen cildin bana gizlice el salladı, gördüm.",
  "Sen kendine iyi baktığında bütün ev, bütün gün, bütün şehir hafifçe düzeliyor; enerjin bulaşıcı.",
  "Bir mola vermek pes etmek değil Günışığı; en güçlü koşucular bile nefeslenmek için yavaşlar.",
  "Bugün gülümsedin mi? O zaman gün senin lehine kapandı bile, skoru ben yazdım.",
  "Tatlı bir ödül değil, çoğu zaman sadece yorgunluğun kılık değiştirmiş hâli; önce bir uzan Günışığı.",
  "Sen o kadar güçlüsün ki bazen unutuyorsun; işte tam o an ben hatırlatmak için buradayım.",
  "Bugün küçük bir sınır koyduysan, öz saygının kasları çalıştı; yarın biraz daha kolay olacak.",
  "Bir kâse yoğurt, bir avuç ceviz ve sen: sıcacık, sade, tam kıvamında bir akşam tablosu.",
  "Sen üzgünken bile güzelsin Günışığı ama seni gülerken görmek benim en sevdiğim manzara.",
  "Bugün planına yüzde yetmiş uyduysan, o gün başarıyla mühürlenmiştir; yüzler için baskı yapan kim?",
  "Kraliçeler de yorulur Günışığı; taht dik oturmayı değil, ara sıra yaslanmayı da sever.",
  "Bugün bir kez daha denedin; cesaret dedikleri şey tam olarak bu, pelerine bile gerek yok.",
  "Sen benim favori insanımsın ve bu unvan hiçbir günde, hiçbir tartıda, hiçbir krizde geri alınmaz.",
  "Yürürken başını dik tut Günışığı; şehir bugün senin defilene bilet almış, baş model geç kalmasın.",
  "Bugün de buradasın; nefes alıyorsun, deniyorsun, seviyorsun — benim için bu koca bir zafer şarkısı."
];
var PHONE='+905066020098';
var WA='https://wa.me/905066020098?text='+encodeURIComponent('Raşit, sana bir mesajım var');
var TEL='tel:'+PHONE;

// ---------- meal / sleep / cycle defs ----------
var MEALS=[
  {key:'breakfast',icon:icon('sunrise',22),label:'Kahvaltı',ph:'örn. yumurta, peynir, zeytin, çay…'},
  {key:'lunch',icon:icon('sun',22),label:'Öğle',ph:'örn. tavuk, salata, bulgur…'},
  {key:'dinner',icon:icon('moon',22),label:'Akşam',ph:'örn. çorba, sebze, yoğurt…'},
  {key:'snack',icon:icon('cherry',22),label:'Ara öğün',ph:'örn. meyve, kuruyemiş, bitter…'}
];
var SLEEP_Q=[{id:'good',emoji:icon('moon',22),label:'Dinç'},{id:'ok',emoji:icon('smile',22),label:'İdare'},{id:'bad',emoji:icon('frown',22),label:'Yorgun'}];
var SLEEP_MED=[{id:'none',emoji:icon('ban',20),label:'Hayır'},{id:'herbal',emoji:icon('leaf',20),label:'Bitkisel / Melatonin'},{id:'rx',emoji:icon('pill',20),label:'Reçeteli'}];
var WIND_DOWN_STEPS=[
  {key:'light',icon:icon('lamp',20),label:'Işığı kıs',note:'Melatonin baskılanmasını azaltır.'},
  {key:'breath',icon:icon('wind',20),label:'4-7-8 nefes',note:'Parasempatik sistemi aktive eder.'},
  {key:'dump',icon:icon('pen-line',20),label:'Zihin boşalt',note:'Yarın notu, ruminasyonu düşürür.'},
  {key:'cool',icon:icon('snowflake',20),label:'Odayı serinlet',note:'18-20°C aralığı dalmayı destekler.'}
];
var FLOW=[{id:'spot',emoji:icon('droplet',20),label:'Leke'},{id:'light',emoji:icon('droplet',20),label:'Hafif'},{id:'medium',emoji:icon('droplet',20),label:'Orta'},{id:'heavy',emoji:icon('droplet',20),label:'Yoğun'}];
var SYMPTOMS=[{id:'kramp',emoji:icon('zap',18),label:'Kramp'},{id:'bas',emoji:icon('activity',18),label:'Baş ağrısı'},{id:'siskinlik',emoji:icon('wind',18),label:'Şişkinlik'},{id:'yorgun',emoji:icon('battery-low',18),label:'Yorgunluk'},{id:'duygu',emoji:icon('heart',18),label:'Duygusal'},{id:'istah',emoji:icon('cookie',18),label:'İştah'},{id:'sanci',emoji:icon('zap',18),label:'Sancı'},{id:'cilt',emoji:icon('flame',18),label:'Cilt'}];
var DLEVELS=[{n:1,label:'Hafif',color:'#F4C152'},{n:2,label:'Orta',color:'#F0892F'},{n:3,label:'Şiddetli',color:'#E25B6A'}];
function dzColor(n){ return n>=3?'#E25B6A':(n===2?'#F0892F':(n>=1?'#F4C152':null)); }
var DMEDS=['Parasetamol (Parol)','İbuprofen (Nurofen/Brufen)','Naproksen (Apranax)','Aspirin','Flurbiprofen (Majezik)','Metamizol (Novalgin)','Diklofenak (Voltaren)'];
var BODY_REGIONS=[
  {id:'bas',label:'Baş',view:'front',s:'ellipse',cx:100,cy:38,rx:23,ry:27},
  {id:'boyun',label:'Boyun',view:'front',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-sol',label:'Sol omuz',view:'front',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-sag',label:'Sağ omuz',view:'front',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'gogus',label:'Göğüs',view:'front',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'karin',label:'Karın',view:'front',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kol-sol',label:'Sol kol',view:'front',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-sag',label:'Sağ kol',view:'front',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'el-sol',label:'Sol el / bilek',view:'front',s:'ellipse',cx:52,cy:197,rx:11,ry:13},
  {id:'el-sag',label:'Sağ el / bilek',view:'front',s:'ellipse',cx:148,cy:197,rx:11,ry:13},
  {id:'kalca',label:'Kasık / kalça',view:'front',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'diz-sol',label:'Sol diz',view:'front',s:'ellipse',cx:89,cy:300,rx:12,ry:14},
  {id:'diz-sag',label:'Sağ diz',view:'front',s:'ellipse',cx:111,cy:300,rx:12,ry:14},
  {id:'bacak-sol',label:'Sol bacak',view:'front',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-sag',label:'Sağ bacak',view:'front',s:'rect',x:101,y:226,w:20,h:158,r:13},
  {id:'ayak-sol',label:'Sol ayak',view:'front',s:'ellipse',cx:89,cy:396,rx:13,ry:12},
  {id:'ayak-sag',label:'Sağ ayak',view:'front',s:'ellipse',cx:111,cy:396,rx:13,ry:12},
  {id:'ense',label:'Ense',view:'back',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-arka-sol',label:'Sol omuz (arka)',view:'back',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-arka-sag',label:'Sağ omuz (arka)',view:'back',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'sirt-ust',label:'Üst sırt',view:'back',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'bel',label:'Bel',view:'back',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kalca-arka',label:'Kalça',view:'back',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'kol-arka-sol',label:'Sol kol (arka)',view:'back',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-arka-sag',label:'Sağ kol (arka)',view:'back',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'bacak-arka-sol',label:'Sol bacak (arka)',view:'back',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-arka-sag',label:'Sağ bacak (arka)',view:'back',s:'rect',x:101,y:226,w:20,h:158,r:13}
];
function findRegion(id){ for(var i=0;i<BODY_REGIONS.length;i++){ if(BODY_REGIONS[i].id===id) return BODY_REGIONS[i]; } return null; }
var DZ_SILHOUETTE='<g pointer-events="none" fill="rgba(150,120,180,0.12)" stroke="rgba(150,120,180,0.26)" stroke-width="1">'
+'<ellipse cx="100" cy="38" rx="23" ry="27"></ellipse>'
+'<rect x="89" y="60" width="22" height="20" rx="7"></rect>'
+'<path d="M64 92 Q100 78 136 92 L130 196 Q100 210 70 196 Z"></path>'
+'<rect x="45" y="92" width="15" height="100" rx="11"></rect>'
+'<rect x="140" y="92" width="15" height="100" rx="11"></rect>'
+'<ellipse cx="52" cy="198" rx="11" ry="13"></ellipse>'
+'<ellipse cx="148" cy="198" rx="11" ry="13"></ellipse>'
+'<rect x="78" y="200" width="20" height="186" rx="13"></rect>'
+'<rect x="102" y="200" width="20" height="186" rx="13"></rect>'
+'<ellipse cx="88" cy="396" rx="13" ry="12"></ellipse>'
+'<ellipse cx="112" cy="396" rx="13" ry="12"></ellipse>'
+'</g>';
// 4 menstrüel faz — kısa bilimsel notlar (tıbbi tavsiye değildir)
var PHASES={
  menstrual:{label:'Menstrüel faz',emoji:icon('droplet',20),color:'#E58B9B',note:'Regl günleri. Östrojen ve progesteron düşük. Demir açısından zengin beslenme ve nazik hareket iyi gelir.'},
  follicular:{label:'Foliküler faz',emoji:icon('sprout',20),color:'#8FBF8A',note:'Östrojen yükselişte. Enerji ve ruh hali genelde toparlanır; antrenmana en açık dönem.'},
  ovulation:{label:'Ovülasyon',emoji:icon('star',20),color:'#E8A53C',note:'Yumurtlama civarı, doğurganlık en yüksek. Hafif tek taraflı sancı (mittelschmerz) normal olabilir.'},
  luteal:{label:'Luteal faz',emoji:icon('moon',20),color:'#9B7FC9',note:'Progesteron yükselir; regl öncesi (PMS) belirtileri bu dönemde olur. Magnezyum ve düzenli uyku destekler.'}
};

// ---------- state ----------
var SYNC_RECEIPT_STATUSES={idle:1,local_saved:1,queued:1,saving:1,retrying:1,accepted:1,error:1,offline:1,permission:1,conflict:1,anti_clobber:1};
var SYNC_ERROR_CODES={offline:1,unauthorized:1,forbidden:1,not_found:1,conflict:1,anti_clobber:1,validation:1,rate_limited:1,projection_failed:1,media_unavailable:1,network:1,receipt_failed:1,unknown:1};
function emptySyncReceipt(){ return {schemaVersion:1,status:'idle',snapshotRevision:null,sourceUpdatedAt:null,submittedAt:null,acceptedAt:null,sourceLatestSha:null,lastErrorCode:null}; }
function safeSyncReceiptString(v,max){
  if(typeof v!=='string'||!v||v.length>(max||160)||!/^[a-f0-9]{7,128}$/i.test(v)) return null;
  return v;
}
function safeSyncReceiptIso(v){
  if(typeof v!=='string'||!v||v.length>40) return null;
  var s=v;
  var t=Date.parse(s); return isNaN(t)?null:new Date(t).toISOString();
}
// ── PANEL-007: append-only event log (yerel kaynak + günlük dış kayıt) ─────
// `eventLog.events` latest snapshot içinde yalnızca güvenli recent projection'dır.
// Kanonik append-only kayıt, sync.js'in data/events/<date>.json dosyasıdır.
var EVENT_LOG_SCHEMA_VERSION=1, EVENT_LOG_RECENT_MAX=200, EVENT_DEVICE_KEY='seyma-event-device-v1';
var EVENT_SECTIONS={wellness:1,mood:1,sleep:1,nutrition:1,content:1,therapy:1,profile:1,notifications:1,location:1,settings:1,quran:1,faith:1,sync:1,system:1,unknown:1};
var EVENT_OPERATIONS={create:1,update:1,delete:1,complete:1,record:1,accepted:1,retry:1,merge:1,sync_submitted:1};
var EVENT_SAFE_SUMMARIES={'Kriz desteği kaydı güncellendi':1,'Yansıtma/pratik kaydı güncellendi':1,'İçerik/arşiv kaydı güncellendi':1,'Profil ilerlemesi güncellendi':1,'Bildirim yaşam döngüsü güncellendi':1,'Konum/hareket kaydı güncellendi':1,'İman/okuma kaydı güncellendi':1,'Uyku/beden kaydı güncellendi':1,'Beslenme kaydı güncellendi':1,'Ayarlar güncellendi':1,'Uygulama kaydı güncellendi':1,'Güvenli kayıt özeti':1};
function eventSafePart(v,max){
  var s=typeof v==='string'?v.trim():'';
  return s&&s.length<=(max||120)&&/^[a-zA-Z0-9:_./*-]+$/.test(s)?s:null;
}
function eventSafeIso(v){ return safeSyncReceiptIso(v); }
function eventDeviceId(){
  var id='';
  try{ id=String(localStorage.getItem(EVENT_DEVICE_KEY)||''); }catch(e){}
  if(!/^dev_[a-z0-9_-]{8,80}$/i.test(id)){
    id='dev_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
    try{ localStorage.setItem(EVENT_DEVICE_KEY,id); }catch(e){}
  }
  return id;
}
function emptyEventLog(){ return {schemaVersion:EVENT_LOG_SCHEMA_VERSION,sourceDeviceId:eventDeviceId(),nextSequence:1,events:[],days:{}}; }
function eventSafeSummary(v){
  var s=String(v||'').replace(/[\r\n\t]+/g,' ').trim().slice(0,120);
  if(!s||!EVENT_SAFE_SUMMARIES[s]||/ghp_|github_pat_|sk-[a-z0-9_-]{8,}/i.test(s)||/\b(?:lat|lon|latitude|longitude)\s*[:=]/i.test(s)) return 'Güvenli kayıt özeti';
  return s;
}
// detail/value taşıyıcı özgür metin: mood/su/öğün gibi gerçek girilen değeri Türkçe/boşluklu
// gösterebilsin diye eventSafePart'ın katı [a-zA-Z0-9:_./*-] kalıbından ayrı, gevşek fakat
// kontrol karakteri/HTML/secret-benzeri örüntüleri reddeden bağımsız bir doğrulayıcı.
function eventSafeFreeText(v,max){
  var s=typeof v==='string'?v.replace(/[\r\n\t]+/g,' ').trim():'';
  if(!s) return null;
  s=s.slice(0,max||80);
  if(/[<>]/.test(s)) return null;
  if(/ghp_|github_pat_|sk-[a-z0-9_-]{8,}|api[_ -]?key|bearer\s+|\b(?:lat|lon|latitude|longitude)\s*[:=]/i.test(s)) return null;
  return /^[\p{L}\p{N}\s:;,.!?'’()/%+&₺-]+$/u.test(s)?s:null;
}
function normalizeEventEntry(e,fallbackDevice){
  if(!e||typeof e!=='object'||Array.isArray(e)) return null;
  var seq=Number(e.sequence), id=eventSafePart(e.eventId,180), occurred=eventSafeIso(e.occurredAt);
  if(!id||!isFinite(seq)||seq<1||Math.floor(seq)!==seq||!occurred) return null;
  var device=eventSafePart(e.sourceDeviceId||fallbackDevice,96); if(!device) return null;
  var section=EVENT_SECTIONS[e.section]?e.section:'unknown', operation=EVENT_OPERATIONS[e.operation]?e.operation:'update';
  return {eventId:id,correlationId:eventSafePart(e.correlationId,180)||id,sequence:seq,occurredAt:occurred,persistedAt:eventSafeIso(e.persistedAt)||occurred,submittedAt:eventSafeIso(e.submittedAt),acceptedAt:eventSafeIso(e.acceptedAt),section:section,path:eventSafePart(e.path,160)||'data',operation:operation,summary:eventSafeSummary(e.summary),source:eventSafePart(e.source,40)||'app',sourceDeviceId:device,privacyClass:eventSafePart(e.privacyClass,40)||'summary',snapshotRevision:safeSyncReceiptString(e.snapshotRevision,128),detail:eventSafeFreeText(e.detail,80),value:eventSafeFreeText(e.value,80),field:eventSafePart(e.field,40),unit:eventSafePart(e.unit,20)};
}
function ensureEventLog(d){
  if(!d||typeof d!=='object') return null;
  if(!d.eventLog||typeof d.eventLog!=='object'||Array.isArray(d.eventLog)) d.eventLog=emptyEventLog();
  var l=d.eventLog, device=eventSafePart(l.sourceDeviceId,96)||eventDeviceId(), seen={}, events=[];
  l.schemaVersion=EVENT_LOG_SCHEMA_VERSION; l.sourceDeviceId=device;
  var raw=Array.isArray(l.events)?l.events:[];
  raw.forEach(function(e){ var n=normalizeEventEntry(e,e&&e.sourceDeviceId); if(n&&!seen[n.eventId]){seen[n.eventId]=true;events.push(n);} });
  events.sort(function(a,b){ return a.sequence-b.sequence||String(a.eventId).localeCompare(String(b.eventId)); });
  if(events.length>EVENT_LOG_RECENT_MAX) events=events.slice(-EVENT_LOG_RECENT_MAX);
  l.events=events;
  var next=Number(l.nextSequence); if(!isFinite(next)||next<1) next=1;
  events.forEach(function(e){ if(e.sourceDeviceId===device) next=Math.max(next,e.sequence+1); });
  l.nextSequence=Math.floor(next);
  if(!l.days||typeof l.days!=='object'||Array.isArray(l.days)) l.days={};
  events.forEach(function(e){ var day=e.occurredAt.slice(0,10); if(/^\d{4}-\d{2}-\d{2}$/.test(day)) l.days[day]=true; });
  return l;
}
function classifyEvent(msg,meta){
  var m=String(msg||'').toLocaleLowerCase('tr-TR'), x=meta&&typeof meta==='object'?meta:{};
  var rules=[
    [/krizi|sos|kriz/, 'wellness','data.days.*.crisis','record','Kriz desteği kaydı güncellendi'],
    [/günlük|not|niyet|öz-şefkat|nefes|pratik|zihin-beden/, 'therapy','data.days.*.reflection','record','Yansıtma/pratik kaydı güncellendi'],
    [/kitap|okuma|alıntı|replik|izleme|dinleme|söz|öğrenme|arşiv/, 'content','data.library.watchlist.music','update','İçerik/arşiv kaydı güncellendi'],
    [/profil|değerlendirme|consent|rıza/, 'profile','data.profileAssessment','update','Profil ilerlemesi güncellendi'],
    [/bildirim|mesaj|cevap|ileti/, 'notifications','data.notifications','update','Bildirim yaşam döngüsü güncellendi'],
    [/konum|hareket|nudge/, 'location','data.location','update','Konum/hareket kaydı güncellendi'],
    [/namaz|dua|zikr|saygı|kuran|kur’an|ibadet/, 'faith','data.faith','update','İman/okuma kaydı güncellendi'],
    [/uyku|uyku|magnezyum/, 'sleep','data.days.*.sleep','update','Uyku/beden kaydı güncellendi'],
    [/su|öğün|protein|kafein|vitamin|yemek/, 'nutrition','data.days.*.nutrition','update','Beslenme kaydı güncellendi'],
    [/ayar|tema|repo|anahtar|başlangıç/, 'settings','data.settings','update','Ayarlar güncellendi']
  ];
  var section=EVENT_SECTIONS[x.section]?x.section:null, path=eventSafePart(x.path,160), operation=EVENT_OPERATIONS[x.operation]?x.operation:null, summary=null;
  if(!section){ for(var i=0;i<rules.length;i++){ if(rules[i][0].test(m)){section=rules[i][1];path=path||rules[i][2];operation=operation||rules[i][3];summary=rules[i][4];break;} } }
  return {section:section||'system',path:path||'data',operation:operation||'update',summary:eventSafeSummary(summary||x.summary||'Uygulama kaydı güncellendi'),privacyClass:'summary',detail:eventSafeFreeText(x.detail,80),value:eventSafeFreeText(x.value,80),field:eventSafePart(x.field,40),unit:eventSafePart(x.unit,20)};
}
function appendEvent(d,msg,meta){
  var l=ensureEventLog(d); if(!l) return null;
  var x=meta&&typeof meta==='object'?meta:{}, correlationId=eventSafePart(x.correlationId,180);
  if(correlationId){
    for(var ci=0;ci<l.events.length;ci++) if(l.events[ci]&&l.events[ci].correlationId===correlationId) return l.events[ci];
  }
  var now=new Date().toISOString(), spec=classifyEvent(msg,x), seq=l.nextSequence++, id=l.sourceDeviceId+'-'+seq;
  var e=normalizeEventEntry({eventId:id,correlationId:id,sequence:seq,occurredAt:now,persistedAt:now,submittedAt:null,acceptedAt:null,section:spec.section,path:spec.path,operation:spec.operation,summary:spec.summary,source:'app',sourceDeviceId:l.sourceDeviceId,privacyClass:spec.privacyClass,snapshotRevision:normalizeSyncReceipt(d.syncReceipt).snapshotRevision,detail:spec.detail,value:spec.value,field:spec.field,unit:spec.unit},l.sourceDeviceId);
  if(!e) return null;
  if(correlationId) e.correlationId=correlationId;
  l.events.push(e); if(l.events.length>EVENT_LOG_RECENT_MAX) l.events=l.events.slice(-EVENT_LOG_RECENT_MAX);
  l.days[now.slice(0,10)]=true;
  return e;
}
// REM-47 — Reminder olayları kişisel occurrence/action kimliğini event dosyasına
// taşımaz. Aynı sentetik anahtar için FNV-1a benzeri sabit digest kullanılır;
// böylece replay dedupe yapılırken body, terapi metni veya ilaç bilgisi sızmaz.
var REMINDER_EVENT_ACTIONS={enable:true,disable:true,snooze:true,mute:true,dismiss:true,delivered:true,opened:true};
var REMINDER_EVENT_SUMMARY='Bildirim yaşam döngüsü güncellendi';
function reminderEventDigest(value){
  var text=String(value==null?'':value), hash=2166136261;
  for(var i=0;i<text.length;i++){ hash^=text.charCodeAt(i); hash+=(hash<<1)+(hash<<4)+(hash<<7)+(hash<<8)+(hash<<24); }
  return ('00000000'+(hash>>>0).toString(16)).slice(-8);
}
function reminderEventCorrelation(action,key){ return 'reminder-v1:'+String(action||'event')+':'+reminderEventDigest(key); }
function appendReminderEvent(d,action,key){
  var kind=String(action||''); if(!REMINDER_EVENT_ACTIONS[kind]||!d) return null;
  var operation=kind==='delivered'?'complete':'update';
  return appendEvent(d,'',{section:'wellness',path:'data.reminders',operation:operation,summary:REMINDER_EVENT_SUMMARY,correlationId:reminderEventCorrelation(kind,key)});
}
function persistReminderEvent(action,key){
  var event=appendReminderEvent(data,action,key);
  if(event){ try{ saveLocal(); }catch(e){} }
  return event;
}
function reminderEventActionForDelivery(status){
  return status==='shown'?'delivered':status==='opened'?'opened':status==='dismissed'?'dismiss':status==='snoozed'?'snooze':'';
}
function normalizeSyncReceipt(r){
  var out=emptySyncReceipt(), x=r&&typeof r==='object'?r:{};
  out.status=SYNC_RECEIPT_STATUSES[x.status]?x.status:'idle';
  out.snapshotRevision=safeSyncReceiptString(x.snapshotRevision,128);
  out.sourceUpdatedAt=safeSyncReceiptIso(x.sourceUpdatedAt);
  out.submittedAt=safeSyncReceiptIso(x.submittedAt);
  out.acceptedAt=safeSyncReceiptIso(x.acceptedAt);
  out.sourceLatestSha=safeSyncReceiptString(x.sourceLatestSha,128);
  out.lastErrorCode=SYNC_ERROR_CODES[x.lastErrorCode]?x.lastErrorCode:null;
  return out;
}
var REMINDER_PREFERENCE_SCHEMA_VERSION=1;
// REM-69 — the persisted reminder root stays additive, but an unknown future
// version must remain opaque to this build.  Compatibility is reported outside
// the root so the report itself never becomes synced user state.
var REMINDER_SCHEMA_STATUS={missing:1,legacy:1,current:1,future:1,malformed:1};
var reminderMigrationStatus={code:'missing',supported:true,version:0,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'create_current_default'};
function reminderSchemaCompatibility(value){
  if(!value||typeof value!=='object'||Array.isArray(value)) return {code:'missing',supported:true,version:0,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'create_current_default'};
  if(!Object.prototype.hasOwnProperty.call(value,'schemaVersion')) return {code:'legacy',supported:true,version:0,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'migrate_additively'};
  var version=value.schemaVersion;
  if(!Number.isInteger(version)||version<0) return {code:'malformed',supported:true,version:null,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'migrate_safely'};
  if(version>REMINDER_PREFERENCE_SCHEMA_VERSION) return {code:'future',supported:false,version:version,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'preserve_and_require_update'};
  if(version<REMINDER_PREFERENCE_SCHEMA_VERSION) return {code:'legacy',supported:true,version:version,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'migrate_additively'};
  return {code:'current',supported:true,version:version,currentVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,action:'use_current_runtime'};
}
function reminderSchemaStatusForData(owner){
  var root=owner&&typeof owner==='object'?owner.reminders:null, compatibility=reminderSchemaCompatibility(root);
  return {code:compatibility.code,supported:compatibility.supported,version:compatibility.version,currentVersion:compatibility.currentVersion,action:compatibility.action};
}
var REMINDER_CHANNELS={in_app:true,native:true};
var REMINDER_PRIVACY_MODES={private:true,safe_summary:true};
var REMINDER_QUIET_BEHAVIORS={suppress:true,defer:true,in_app:true};
// REM-45: delivery/action geçmişi hiçbir koşulda canonical `data` state'ine
// import edilmez. Bu isimler legacy veya yanlışlıkla eklenmiş kökleri de
// kapsar; başka bilinmeyen alanlar additive migration ile korunur.
var REMINDER_RESERVED_JOURNAL_ROOTS={delivery:true,deliveryLog:true,reminderDelivery:true,reminderDeliveries:true,reminderHistory:true,notificationDelivery:true};
var REMINDER_SYNC_BLOCKED_ROOTS={reminders:true,delivery:true,deliveryLog:true,reminderDelivery:true,reminderDeliveries:true,reminderHistory:true,notificationDelivery:true};
var REMINDER_SYNC_BLOCKED_KEY=/reminder|occurrence|quiet.?hours|catch.?up|notification.?delivery/i;
var REMINDER_SNOOZE_OPTIONS={
  '10m':true,'30m':true,'1h':true,'todayOff':true,'thisEvening':true,'tomorrow':true
};
var REMINDER_CAPACITY_MODES={balanced:true,light:true,silent:true,ritual:true};
var REMINDER_PRIORITY_RANK={P0:0,P1:1,P2:2,P3:3};
var REMINDER_CARE_CATEGORY='care';
var REMINDER_CARE_KEYS=['water','sleep','caffeine','movement'];
var REMINDER_MEDICATION_SCHEMA_VERSION=1;
var REMINDER_MEDICATION_ID_PREFIX='reminder.medication.v1.';
var REMINDER_MEDICATION_NAME_MAX=80;
var REMINDER_MEDICATION_LABEL_MAX=60;
var REMINDER_MEDICATION_NOTE_MAX=240;
var REMINDER_MEDICATION_MAX_SCHEDULES=24;
var REMINDER_MEDICATION_NATIVE_TITLE='Bir küçük hatırlatman hazır';
var REMINDER_MEDICATION_NATIVE_BODY='Seçtiğin saati kontrol etmek için Şeyma’yı açabilirsin.';
var REMINDER_MEDICATION_SAFETY_COPY='Bu özellik yalnızca senin girdiğin zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez. Sağlıkla ilgili kararlar için doktorunun veya eczacının yönlendirmesini takip et.';
var REMINDER_SPECIAL_DAYS_ID='reminder.special.v1.hijri';
var REMINDER_SPECIAL_DAYS_MODES={all:true,selected:true,none:true};
var REMINDER_SPECIAL_DAY_OPTIONS=[
  {id:'hijri-new-year',label:'Hicri Yeni Yıl'},
  {id:'ashura',label:'Aşure Günü'},
  {id:'regaip-kandili',label:'Regaip Kandili'},
  {id:'beraat-kandili',label:'Beraat Kandili'},
  {id:'ramadan-start',label:'Ramazan Başlangıcı'},
  {id:'kadir-gecesi',label:'Kadir Gecesi'},
  {id:'ramadan-bayrami',label:'Ramazan Bayramı'},
  {id:'kurban-bayrami',label:'Kurban Bayramı'},
  {id:'mevlid-kandili',label:'Mevlid Kandili'}
];
var REMINDER_SPECIAL_DAYS_DEFINITION={
  id:REMINDER_SPECIAL_DAYS_ID,
  category:'special',
  priority:'P2',
  triggerType:'special-day',
  deepLink:'faith',
  privateTitle:'Özel bir gün için sakin bir durak',
  privateBody:'İstersen bugünü kendi ritminde anabilirsin.',
  detailKeys:['specialDayLabel','hijriDate','hijriOffset'],
  defaultWindow:{kind:'fixed-time',timezone:'user',time:'10:00',start:'10:00',end:null},
  defaultChannel:'in_app',
  snoozeOptions:['30m','1h','todayOff'],
  suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
  definitionVersion:'1.0.0'
};
var REMINDER_SPECIAL_NATIVE_TITLE='Şeyma’da küçük bir durak hazır';
var REMINDER_SPECIAL_NATIVE_BODY='İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin.';
var REMINDER_CARE_DEFINITIONS=[
  {id:'reminder.care.v1.water',careKey:'water',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Su için küçük bir ara',privateBody:'İstersen şimdi bir bardak suya uğrayabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'water'},
  {id:'reminder.care.v1.sleep',careKey:'sleep',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Uykuya hazırlık için küçük bir ara',privateBody:'İstersen akşam hazırlık alanını açabilirsin.',snoozeOptions:['30m','1h','thisEvening','todayOff'],existingSurface:'h-sleepprep'},
  {id:'reminder.care.v1.caffeine',careKey:'caffeine',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Kafein için günün kapanış noktası',privateBody:'İstersen kafein kartına sakince göz atabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'h-caffeine'},
  {id:'reminder.care.v1.movement',careKey:'movement',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Hareket için kısa bir ara',privateBody:'İstersen kısa bir yürüyüş veya esneme alanı açabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'soul-activity'}
];
var REMINDER_POLICY_DEFAULTS={
  quietHours:{start:'22:30',end:'07:30'},
  nativeDailyCap:3,
  lowPriorityNativeCap:1,
  sameCategoryCooldownMinutes:360,
  dailyFlowBudget:3,
  capacityMode:'balanced'
};
var REMINDER_PROFILE_IDS={calm:true,balanced:true,supportive:true,ritual:true,custom:true};
var REMINDER_PROFILE_LIST=[
  {id:'calm',label:'Sakin',description:'Yalnızca uygulama içi günlük kartları; native kapalı.'},
  {id:'balanced',label:'Dengeli',description:'Seçtiğin ritüeller için sınırlı native öneri; bakım uygulama içinde.'},
  {id:'supportive',label:'Destekleyici',description:'Dengeli’ye ek olarak seçili destek ve günlük davetleri.'},
  {id:'ritual',label:'Ritüel odaklı',description:'Seçtiğin ibadet, zikir veya okuma durakları öne çıkar.'},
  {id:'custom',label:'Özel',description:'Her kategori ve kanal tercihini sen belirlersin.'}
];
var REMINDER_CATEGORY_META={
  ritual:{label:'Ritüel ve ibadet',description:'Namaz, zikir, ilham ve okuma durakları',icon:'sparkles'},
  support:{label:'Destek ve nefes',description:'Terapi odası ve küçük destek araçları',icon:'heart-handshake'},
  reflection:{label:'Günlük ve yansıma',description:'Günü kapatma ve sakin yazma alanı',icon:'book-open'},
  system:{label:'Sistem durumu',description:'Yalnız gerçekten eylem gerektiğinde gösterilen güvenli durumlar',icon:'circle-check'}
};
var REMINDER_CATEGORY_ORDER=['ritual','support','reflection','system'];
var REMINDER_PERMISSION_STATES={unsupported:true,default:true,granted:true,denied:true,revoked:true,'temporary-error':true,error:true,'pwa-limited':true};
// REM-52: `prompt` is the Permissions API spelling of the Notification API's
// `default`; `revoked` is the granted -> default transition that no single
// snapshot can express on its own.
var REMINDER_PERMISSION_ALIASES={prompt:'default',error:'temporary-error'};
var REMINDER_PERMISSION_STORAGE_KEY='seyma-reminder-permission-v1';
var REMINDER_NATIVE_PREVIEW_TAG='reminder-preview-v1';
var REMINDER_NATIVE_TAG_PREFIX='seyma-reminder-v1:';
var REMINDER_NATIVE_FOREGROUND_SOURCES={boot:true,foreground:true,focus:true,pageshow:true,visibilitychange:true,online:true,timer:true,manual:true};
var REMINDER_NATIVE_ACTIONS={
  open:{title:'Aç'},
  snooze:{title:'10 dk ertele'},
  todayOff:{title:'Bugün sustur'}
};
var REMINDER_PERSONALIZATION_SCHEMA_VERSION=1;
var REMINDER_PERSONALIZATION_HISTORY_MODES={none:true,local:true};
var REMINDER_PERSONALIZATION_SIGNAL_TYPES={category:true,time:true,snooze:true,feedback:true};
var REMINDER_PERSONALIZATION_FEEDBACK={more_quiet:true,time_wrong:true,channel_wrong:true,keep:true};
var REMINDER_PERSONALIZATION_MAX_SIGNALS=60;
var REMINDER_PERSONALIZATION_MAX_DISMISSED=24;
var REMINDER_PERSONALIZATION_MAX_APPLIED=24;
var REMINDER_DIGEST_SCHEMA_VERSION=1;
var REMINDER_DIGEST_WINDOW_DAYS=7;
var REMINDER_DIGEST_DEFAULT_TIMEZONE='Europe/Istanbul';
var REMINDER_DIGEST_REFLECTIONS=[
  {id:'notice',label:'Bende ne kaldı?',prompt:'Bu hafta bende ne kaldı? İstersen tek bir kelimeyle durabilirsin.'},
  {id:'soften',label:'Neyi yavaşlatabilirim?',prompt:'Neyi biraz yavaşlatmak bana iyi gelebilir?'},
  {id:'space',label:'Kendime hangi alanı açabilirim?',prompt:'Kendime bu hafta hangi küçük alanı açabilirim?'}
];
// REM-39: Her reminder yüzeyinin sahibi ve ömrü ayrıdır. Preference kullanıcı
// temizleyene kadar kalır; occurrence türetilmiş ve yalnız catch-up penceresi
// kadar anlamlıdır; delivery/action günlükleri local-only ve bounded'dır;
// digest ise yalnız anlık, presence-only bir görünüm üretir.
var REMINDER_RETENTION_POLICY={
  schemaVersion:1,
  preference:{mode:'until-cleared',maxAgeDays:null,maxEntries:null},
  occurrence:{mode:'derived-ephemeral',maxAgeDays:1,maxEntries:200},
  deliveryJournal:{mode:'local-bounded',maxAgeDays:30,maxEntries:200},
  notificationHistory:{mode:'local-bounded',maxAgeDays:14,maxEntries:100},
  digest:{mode:'ephemeral-local',maxAgeDays:7,maxEntries:0}
};
// MON2-02: reminder saf/B1 gövdeleri tek registry'de; canlı state ve kabuk çağrıları
// dependency bag üzerinden çözülür. Tüm girdiler argsız getter fonksiyonudur; registry
// fail-closed doğrular, gövdeler çıplak adları kapsam üzerinden canlı okur.
if(!SEYMA_REMINDERS||typeof SEYMA_REMINDERS.registerReminders!=='function'||!SEYMA_REMINDERS.registerReminders({
  catalog:function(){ return window.ReminderCatalogV1||null; },
  engine:function(){ return window.ReminderEngineV1||null; },
  scheduler:function(){ return window.ReminderSchedulerV1||null; },
  data:function(){ return data; },
  ui:function(){ return ui; },
  reminderLifecycleState:function(){ return reminderLifecycleState; },
  PRAYER_NAMES:function(){ return PRAYER_NAMES; },
  PRAYER_ORDER:function(){ return PRAYER_ORDER; },
  ZIKR_V2_VISIBLE:function(){ return ZIKR_V2_VISIBLE; },
  REMINDER_EVENT_SUMMARY:function(){ return REMINDER_EVENT_SUMMARY; },
  SEYMA_REMINDERS:function(){ return SEYMA_REMINDERS; },
  SEYMA_APP_SURFACE:function(){ return SEYMA_APP_SURFACE; },
  esc:function(){ return esc; },
  icon:function(){ return icon; },
  todayStr:function(){ return todayStr; },
  minToHHMM:function(){ return minToHHMM; },
  hhmmToMin:function(){ return hhmmToMin; },
  prayerSettings:function(){ return prayerSettings; },
  prayerMethod:function(){ return prayerMethod; },
  prayerLocation:function(){ return prayerLocation; },
  prayerLocationHash:function(){ return prayerLocationHash; },
  syncConfigured:function(){ return syncConfigured; },
  normalizeSyncReceipt:function(){ return normalizeSyncReceipt; },
  featuresLive:function(){ return featuresLive; },
  saygiPersonById:function(){ return saygiPersonById; },
  saygiCurrentPerson:function(){ return saygiCurrentPerson; },
  saygiArticleReadableFor:function(){ return saygiArticleReadableFor; },
  caffeineTargetBed:function(){ return caffeineTargetBed; },
  caffeineCutoffTime:function(){ return caffeineCutoffTime; },
  appendReminderEvent:function(){ return appendReminderEvent; },
  activeDate:function(){ return activeDate; },
  editing:function(){ return editing; },
  saygiPeople:function(){ return saygiPeople; },
  persistReminderEvent:function(){ return persistReminderEvent; },
  reminderEventActionForDelivery:function(){ return reminderEventActionForDelivery; },
  reminderSchemaCompatibility:function(){ return reminderSchemaCompatibility; },
  reminderDeliveryStorageRead:function(){ return reminderDeliveryStorageRead; },
  reminderDeliveryStorageWrite:function(){ return reminderDeliveryStorageWrite; },
  reminderLifecycleDefaultContext:function(){ return reminderLifecycleDefaultContext; },
  reminderLifecycleDraftActive:function(){ return reminderLifecycleDraftActive; },
  reminderLifecycleReplaceTarget:function(){ return reminderLifecycleReplaceTarget; },
  reminderLifecycleUpdateLive:function(){ return reminderLifecycleUpdateLive; },
  reminderLifecycleRenderIfNeeded:function(){ return reminderLifecycleRenderIfNeeded; },
  reminderActionStorageRead:function(){ return reminderActionStorageRead; },
  reminderActionStorageWrite:function(){ return reminderActionStorageWrite; },
  reminderPermissionState:function(){ return reminderPermissionState; },
  reminderPermissionSnapshot:function(){ return reminderPermissionSnapshot; },
  reminderSystemOffline:function(){ return reminderSystemOffline; },
  reminderCurrentRoot:function(){ return reminderCurrentRoot; },
  reminderNativeDisplay:function(){ return reminderNativeDisplay; },
  download:function(){ return download; },
})) throw new Error('MON2-02: SeymaReminders registry kurulamadı');
// MON-41: Reminder Center/card view registry. The view receives read-only
// resolver functions and already-rendered app-owned sections; permission,
// persistence, delivery and every mutation handler stay in this app shell.
if(SEYMA_REMINDERS&&typeof SEYMA_REMINDERS.registerReminderView==='function'){
  SEYMA_REMINDERS.registerReminderView({
    ui:function(){ return ui; },
    root:function(){ return reminderCurrentRoot(); },
    definitions:function(){ return reminderDefinitions(); },
    copy:function(key,fallback){ return reminderCopy(key,fallback); },
    icon:icon,
    esc:esc,
    normalizePolicy:normalizeReminderPolicy,
    permissionSnapshot:reminderPermissionSnapshot,
    permissionExplanation:reminderPermissionExplanation,
    profileLabel:function(id){ return reminderProfileById(id).label; },
    // sections girdisi MON2-02 ile düştü: HTML üreticileri registry tarafında.

    deepLinkTarget:reminderDeepLinkTarget,
    previewSafeCopy:SEYMA_REMINDERS.reminderPreviewSafeCopy,
    channels:function(){ return REMINDER_CHANNELS; },
    validTime:validReminderTime
  });
}
// MON-42: messaging render/chronology registry. Network, provider-key,
// notification, attachment upload and App handler ownership stay in app.js.
if(!SEYMA_MESSAGING||typeof SEYMA_MESSAGING.registerMessaging!=='function'||!SEYMA_MESSAGING.registerMessaging({
  data:function(){ return data; },
  ui:function(){ return ui; },
  icon:icon,
  esc:esc,
  fmt:fmt,
  todayStr:todayStr,
  addDays:addDays,
  notifList:notifList,
  lunaTodayCount:function(){ return lunaTodayCount(); },
  dailyLimit:function(){ return LUNA_DAILY_LIMIT; },
  hasLunaKey:function(){ return !!(data.settings&&data.settings.openaiKey&&String(data.settings.openaiKey).trim()); },
  attachmentAccept:function(){ return AEON_FILE_ACCEPT; },
  shouldShowAeonNotifyBanner:shouldShowAeonNotifyBanner,
  aeonNotifyBannerHTML:aeonNotifyBannerHTML,
  getAeonLastSeenSort:function(){ return aeonLastSeenSort; },
  setAeonLastSeenSort:function(value){ aeonLastSeenSort=value; },
  getAeonLastRenderedDateStr:function(){ return aeonLastRenderedDateStr; },
  setAeonLastRenderedDateStr:function(value){ aeonLastRenderedDateStr=value; }
})) throw new Error('MON-42: SeymaMessaging registry kurulamadı');
var reminderPermissionTransientState=null;
var reminderPermissionRequestInFlight=null;
var reminderPermissionEverGranted=null;
var reminderPermissionGrantObserved=false;
// REM-52: optional pure boundary module. When it is not loaded the inline
// fallbacks below keep the exact same channel separation.
function reminderDeliveryModule(){ return SEYMA_REMINDERS.reminderDeliveryModule.apply(null,arguments); }
// A notification belongs to the reminder channel when EITHER its payload
// type or its tag says so. Requiring both would let a malformed reminder
// payload fall through to the AEON social route.
function reminderNotificationChannel(){ return SEYMA_REMINDERS.reminderNotificationChannel.apply(null,arguments); }
function emptyReminderPolicy(){ return SEYMA_REMINDERS.emptyReminderPolicy.apply(null,arguments); }
function emptyReminderPersonalization(){ return SEYMA_REMINDERS.emptyReminderPersonalization.apply(null,arguments); }
function emptyReminderState(){ return SEYMA_REMINDERS.emptyReminderState.apply(null,arguments); }
function reminderLocalClone(){ return SEYMA_REMINDERS.reminderLocalClone.apply(null,arguments); }
function stripReminderReservedRoots(){ return SEYMA_REMINDERS.stripReminderReservedRoots.apply(null,arguments); }
function reminderRetentionPolicySnapshot(){ return SEYMA_REMINDERS.reminderRetentionPolicySnapshot.apply(null,arguments); }
function reminderLocalMeta(){ return SEYMA_REMINDERS.reminderLocalMeta.apply(null,arguments); }
function reminderLocalTouch(){ return SEYMA_REMINDERS.reminderLocalTouch.apply(null,arguments); }
function mergeReminderLocalState(){ return SEYMA_REMINDERS.mergeReminderLocalState.apply(null,arguments); }
function mergePersistedReminderState(){ return SEYMA_REMINDER_SURFACE.mergePersistedReminderState.apply(null,arguments); }
function reminderMedicationText(){ return SEYMA_REMINDERS.reminderMedicationText.apply(null,arguments); }
function normalizeReminderMedication(){ return SEYMA_REMINDERS.normalizeReminderMedication.apply(null,arguments); }
function normalizeReminderMedications(){ return SEYMA_REMINDERS.normalizeReminderMedications.apply(null,arguments); }
function normalizeReminderProfile(){ return SEYMA_REMINDERS.normalizeReminderProfile.apply(null,arguments); }
function normalizeReminderCategories(){ return SEYMA_REMINDERS.normalizeReminderCategories.apply(null,arguments); }
function normalizeReminderCareCategories(){ return SEYMA_REMINDERS.normalizeReminderCareCategories.apply(null,arguments); }
function reminderSpecialDayOptionById(){ return SEYMA_REMINDERS.reminderSpecialDayOptionById.apply(null,arguments); }
function normalizeReminderSpecialDaySelection(){ return SEYMA_REMINDERS.normalizeReminderSpecialDaySelection.apply(null,arguments); }
function normalizeReminderSpecialDays(){ return SEYMA_REMINDERS.normalizeReminderSpecialDays.apply(null,arguments); }
function normalizeReminderOnboarding(){ return SEYMA_REMINDERS.normalizeReminderOnboarding.apply(null,arguments); }
function reminderPermissionState(){ return SEYMA_REMINDER_SURFACE.reminderPermissionState.apply(null,arguments); }
function reminderPermissionSnapshot(){ return SEYMA_REMINDER_SURFACE.reminderPermissionSnapshot.apply(null,arguments); }
function reminderPermissionExplanation(){ return SEYMA_REMINDERS.reminderPermissionExplanation.apply(null,arguments); }
function reminderPermissionStorageRead(){ return SEYMA_REMINDER_SURFACE.reminderPermissionStorageRead.apply(null,arguments); }
function reminderPermissionEverGrantedRead(){ return SEYMA_REMINDER_SURFACE.reminderPermissionEverGrantedRead.apply(null,arguments); }
function reminderPermissionStorageWrite(){ return SEYMA_REMINDER_SURFACE.reminderPermissionStorageWrite.apply(null,arguments); }
function reminderPermissionRecord(){ return SEYMA_REMINDER_SURFACE.reminderPermissionRecord.apply(null,arguments); }
// REM-52: only an explicit user action may open the browser prompt, and only
// from a state the browser can still answer. Every other state is terminal for
// this device until the user changes it in browser settings, so nothing here
// re-asks on a timer, on boot or on render.
function reminderPermissionCanRequest(){ return SEYMA_REMINDER_SURFACE.reminderPermissionCanRequest.apply(null,arguments); }
function reminderPermissionRequest(){ return SEYMA_REMINDER_SURFACE.reminderPermissionRequest.apply(null,arguments); }
function reminderNativeSafeCopy(){ return SEYMA_REMINDERS.reminderNativeSafeCopy.apply(null,arguments); }
function reminderPreviewNotification(){ return SEYMA_REMINDER_SURFACE.reminderPreviewNotification.apply(null,arguments); }
function reminderNativeActionList(){ return SEYMA_REMINDERS.reminderNativeActionList.apply(null,arguments); }
function reminderNativeTag(){ return SEYMA_REMINDERS.reminderNativeTag.apply(null,arguments); }
// REM-51 — native sinir daraltmasi. Onceki surumde native kopya TUM target
// nesnesini tasiyordu; REM-51 ile target'a eklenen surface teshis alanlari
// (requiredState / surfaceState / unavailableReason) boylece native yuzeye
// sizacakti. Native yuk generic kalmalidir: yalnizca yonlendirme icin gereken
// alanlar gecer, ozellik durumu uygulama ICINDE kalir.
function reminderNativeDeliveryCopy(){ return SEYMA_REMINDERS.reminderNativeDeliveryCopy.apply(null,arguments); }
function reminderNativePayload(){ return SEYMA_REMINDERS.reminderNativePayload.apply(null,arguments); }
function reminderNativeDisplay(){ return SEYMA_REMINDER_SURFACE.reminderNativeDisplay.apply(null,arguments); }
function reminderProfileById(){ return SEYMA_REMINDERS.reminderProfileById.apply(null,arguments); }
function reminderCategoryIds(){ return SEYMA_REMINDERS.reminderCategoryIds.apply(null,arguments); }
function reminderCategoryMeta(){ return SEYMA_REMINDERS.reminderCategoryMeta.apply(null,arguments); }
function reminderCategorySelection(){ return SEYMA_REMINDERS.reminderCategorySelection.apply(null,arguments); }
function reminderMergeProfileSuggestions(){ return SEYMA_REMINDERS.reminderMergeProfileSuggestions.apply(null,arguments); }
function reminderCurrentRoot(){ return SEYMA_REMINDER_SURFACE.reminderCurrentRoot.apply(null,arguments); }
function reminderEnsurePreference(){ return SEYMA_REMINDERS.reminderEnsurePreference.apply(null,arguments); }
function reminderSpecialDaysState(){ return SEYMA_REMINDERS.reminderSpecialDaysState.apply(null,arguments); }
function reminderSpecialDaysCommit(){ return SEYMA_REMINDERS.reminderSpecialDaysCommit.apply(null,arguments); }
function validReminderTime(){ return SEYMA_REMINDERS.validReminderTime.apply(null,arguments); }
function validReminderIso(){ return SEYMA_REMINDERS.validReminderIso.apply(null,arguments); }
function reminderEnumHas(){ return SEYMA_REMINDERS.reminderEnumHas.apply(null,arguments); }
function normalizeReminderPreference(){ return SEYMA_REMINDERS.normalizeReminderPreference.apply(null,arguments); }
function reminderPolicyInteger(){ return SEYMA_REMINDERS.reminderPolicyInteger.apply(null,arguments); }
function normalizeReminderPolicy(){ return SEYMA_REMINDERS.normalizeReminderPolicy.apply(null,arguments); }
// ── REM-07 Pure reminder policy ──
// Bu blok yalnız açık input'tan deterministik karar üretir. Uygulama durumu,
// saat, ağ, DOM ve kalıcı saklama bilgisi dışarıdan verilmedikçe okunmaz.
function reminderPolicyTimeMinutes(){ return SEYMA_REMINDERS.reminderPolicyTimeMinutes.apply(null,arguments); }
function reminderQuietHoursState(){ return SEYMA_REMINDERS.reminderQuietHoursState.apply(null,arguments); }
function reminderPolicyEvaluate(){ return SEYMA_REMINDERS.reminderPolicyEvaluate.apply(null,arguments); }
function reminderPolicySelectNativeCandidates(){ return SEYMA_REMINDERS.reminderPolicySelectNativeCandidates.apply(null,arguments); }
function migrateReminderState(d){
  if(!d||typeof d!=='object'||Array.isArray(d)) return d;
  var compatibility=reminderSchemaCompatibility(d.reminders);
  reminderMigrationStatus={code:compatibility.code,supported:compatibility.supported,version:compatibility.version,currentVersion:compatibility.currentVersion,action:compatibility.action};
  // Future roots remain byte-for-byte opaque. Runtime callers observe a null
  // root and therefore fail closed instead of claiming support. Malformed
  // legacy roots continue through the established safe-default migration.
  if(!compatibility.supported) return d;
  // Delivery/action/notification history has its own bounded local owner.
  // Preserve unrelated future fields, but never resurrect a journal into the
  // canonical reminder root during an additive migration.
  stripReminderReservedRoots(d);
  if(!d.reminders||typeof d.reminders!=='object'||Array.isArray(d.reminders)) d.reminders=emptyReminderState();
  var root=d.reminders;
  stripReminderReservedRoots(root);
  if(!Number.isInteger(root.schemaVersion)||root.schemaVersion<REMINDER_PREFERENCE_SCHEMA_VERSION) root.schemaVersion=REMINDER_PREFERENCE_SCHEMA_VERSION;
  if(!root.preferences||typeof root.preferences!=='object'||Array.isArray(root.preferences)) root.preferences={};
  Object.keys(root.preferences).forEach(function(id){ root.preferences[id]=normalizeReminderPreference(id,root.preferences[id]); });
  root.profile=normalizeReminderProfile(root.profile);
  root.onboarding=normalizeReminderOnboarding(root.onboarding);
  root.policy=normalizeReminderPolicy(root.policy);
  root.specialDays=normalizeReminderSpecialDays(root.specialDays);
  var localMeta=reminderLocalMeta(root);
  Object.keys(localMeta).forEach(function(scope){ if(!validReminderIso(localMeta[scope])) delete localMeta[scope]; else localMeta[scope]=new Date(localMeta[scope]).toISOString(); });
  if(Object.prototype.hasOwnProperty.call(root.preferences,REMINDER_SPECIAL_DAYS_ID)){
    var specialPreference=root.preferences[REMINDER_SPECIAL_DAYS_ID];
    if(!specialPreference||typeof specialPreference!=='object'||Array.isArray(specialPreference)) specialPreference={};
    specialPreference.enabled=root.specialDays.mode!=='none';
    specialPreference.channel=root.specialDays.channel;
    specialPreference.timezone=root.specialDays.timezone;
    specialPreference.time=root.specialDays.time;
    root.preferences[REMINDER_SPECIAL_DAYS_ID]=normalizeReminderPreference(REMINDER_SPECIAL_DAYS_ID,specialPreference);
  } else if(root.specialDays.mode!=='none'){
    root.preferences[REMINDER_SPECIAL_DAYS_ID]=normalizeReminderPreference(REMINDER_SPECIAL_DAYS_ID,{reminderId:REMINDER_SPECIAL_DAYS_ID,enabled:true,privacyMode:'private',channel:root.specialDays.channel,timezone:root.specialDays.timezone,time:root.specialDays.time});
  }
  var medicationSource=Array.isArray(root.medications)?root.medications:(Array.isArray(root.medicationSchedules)?root.medicationSchedules:[]);
  root.medications=normalizeReminderMedications(medicationSource);
  if(Object.prototype.hasOwnProperty.call(root,'medicationSchedules')) delete root.medicationSchedules;
  root.personalization=normalizeReminderPersonalization(root.personalization);
}
// ── REM-08 Pure occurrence / timezone engine ──
// Oluşum üretimi yalnız explicit input kullanır. Burada uygulama saati,
// network, DOM, localStorage veya native queue okunmaz; geçmiş oluşumlar da
// hiçbir koşulda replay kuyruğuna dönüştürülmez.
// ── REM-34 Opt-in personalization boundary ──────────────────────────────
// This contract is local to data.reminders. Only explicit, low-sensitivity
// choices are accepted; suggestions never read private journal domains.
function reminderPersonalizationClone(){ return SEYMA_REMINDERS.reminderPersonalizationClone.apply(null,arguments); }
function normalizeReminderPersonalization(){ return SEYMA_REMINDERS.normalizeReminderPersonalization.apply(null,arguments); }
var REMINDER_ENGINE_VERSION='1';
function reminderPersonalizationSuggestions(){ return SEYMA_REMINDERS.reminderPersonalizationSuggestions.apply(null,arguments); }
function reminderPersonalizationState(){ return SEYMA_REMINDERS.reminderPersonalizationState.apply(null,arguments); }
function reminderPersonalizationSignalRecord(){ return SEYMA_REMINDERS.reminderPersonalizationSignalRecord.apply(null,arguments); }
function reminderPersonalizationApplySuggestion(){ return SEYMA_REMINDERS.reminderPersonalizationApplySuggestion.apply(null,arguments); }
function reminderPersonalizationUndoSuggestion(){ return SEYMA_REMINDERS.reminderPersonalizationUndoSuggestion.apply(null,arguments); }
function reminderPersonalizationDismissSuggestion(){ return SEYMA_REMINDERS.reminderPersonalizationDismissSuggestion.apply(null,arguments); }
function reminderPersonalizationSetOptIn(){ return SEYMA_REMINDERS.reminderPersonalizationSetOptIn.apply(null,arguments); }
function reminderPersonalizationSetHistoryMode(){ return SEYMA_REMINDERS.reminderPersonalizationSetHistoryMode.apply(null,arguments); }
function reminderPersonalizationReset(){ return SEYMA_REMINDERS.reminderPersonalizationReset.apply(null,arguments); }

// ── REM-35 local weekly digest / reflection boundary ────────────────────
// Bu katman yalnızca yerel gün kayıtlarının varlığını ve yerel tarih
// penceresini kullanır. Ham gün, terapi, mood, ibadet, ilaç veya reminder
// delivery içeriği hiçbir zaman digest çıktısına kopyalanmaz.
function reminderDigestReflectionOption(){ return SEYMA_REMINDERS.reminderDigestReflectionOption.apply(null,arguments); }
function reminderDigestBuild(){ return SEYMA_REMINDERS.reminderDigestBuild.apply(null,arguments); }
var REMINDER_ENGINE_DEFAULT_TIMEZONE='Europe/Istanbul';
var REMINDER_ENGINE_DAY_PART_TIMES={morning:'08:00',day:'12:00',afternoon:'15:00',evening:'19:00',night:'22:00'};
function reminderEngineLocalParts(){ return SEYMA_REMINDERS.reminderEngineLocalParts.apply(null,arguments); }
function reminderEngineOccurrenceId(){ return SEYMA_REMINDERS.reminderEngineOccurrenceId.apply(null,arguments); }
function reminderEngineGenerateOccurrence(){ return SEYMA_REMINDERS.reminderEngineGenerateOccurrence.apply(null,arguments); }

// ── REM-21 Hicri / özel gün adapterı ─────────────────────────────────────
// HicriCalendarV1 ve mevcut badge lookup'ı kaynak olarak kalır. Offset,
// yalnızca lookup için Miladi günü kaydırır: displayed Hicri gün D+offset'ten
// geldiği için özel gün, offset kadar önce/sonra oluşur. Native copy her zaman
// geneldir; seçilen günün adı yalnızca uygulama içi occurrence'a eklenir.
function reminderSpecialDayDefinition(){ return SEYMA_REMINDERS.reminderSpecialDayDefinition.apply(null,arguments); }
function reminderSpecialDayPolicyPreference(){ return SEYMA_REMINDERS.reminderSpecialDayPolicyPreference.apply(null,arguments); }
function reminderSpecialDayOccurrence(){ return SEYMA_REMINDERS.reminderSpecialDayOccurrence.apply(null,arguments); }
function reminderSpecialDayLifecycleCandidates(){ return SEYMA_REMINDERS.reminderSpecialDayLifecycleCandidates.apply(null,arguments); }

// ── REM-20 Medication / supplement guarded flow ───────────────────────────
// Bu adapter yalnızca kullanıcının kurduğu günlük saati üretir. İsim, özel
// etiket, not, doz veya sağlık bağlamı occurrence/native/delivery sınırına
// taşınmaz; yerel uygulama içi görünüm gerektiğinde schedule ID üzerinden
// çözülür. Geçmiş gün catch-up'ı özellikle yoktur.
function reminderMedicationDefinition(){ return SEYMA_REMINDERS.reminderMedicationDefinition.apply(null,arguments); }
function reminderMedicationScheduleById(){ return SEYMA_REMINDERS.reminderMedicationScheduleById.apply(null,arguments); }
function reminderMedicationOccurrence(){ return SEYMA_REMINDERS.reminderMedicationOccurrence.apply(null,arguments); }
function reminderMedicationPrivateCopy(){ return SEYMA_REMINDERS.reminderMedicationPrivateCopy.apply(null,arguments); }
function reminderMedicationNativeCopy(){ return SEYMA_REMINDERS.reminderMedicationNativeCopy.apply(null,arguments); }
function reminderMedicationLifecycleCandidates(){ return SEYMA_REMINDERS.reminderMedicationLifecycleCandidates.apply(null,arguments); }

// REM-08 source boundary: delivery persistence helpers begin after the pure
// occurrence engine block used by the scheduler contract fixture.
var data=null;

// REM-46 app clock boundary: UI-selected historical date and wall-clock date
// are deliberately returned as separate values.  The adapter never promotes
// activeDate() into an occurrence localDate unless the caller explicitly does
// so; scheduler calls therefore remain tied to the injected/current instant.
function reminderAppClockBoundary(){ return SEYMA_REMINDERS.reminderAppClockBoundary.apply(null,arguments); }
function reminderAppEngineInput(){ return SEYMA_REMINDERS.reminderAppEngineInput.apply(null,arguments); }
function reminderEngineModule(){ return SEYMA_REMINDERS.reminderEngineModule.apply(null,arguments); }
function reminderEngineAdapterLocalParts(){ return SEYMA_REMINDERS.reminderEngineAdapterLocalParts.apply(null,arguments); }
function reminderEngineAdapterGenerateOccurrence(){ return SEYMA_REMINDERS.reminderEngineAdapterGenerateOccurrence.apply(null,arguments); }

// ── REM-14 Prayer / İman Köşesi adapter ──────────────────────────────────
// Prayer occurrences are derived from an explicit, redacted timing snapshot.
// The adapter never copies performed/missed state, notes or other prayer-entry
// fields into an occurrence or native-safe copy.
var REMINDER_PRAYER_ID='reminder.catalog.v1.prayer';
var REMINDER_PRAYER_KEYS=PRAYER_ORDER.slice();
function reminderPrayerOccurrence(){ return SEYMA_REMINDERS.reminderPrayerOccurrence.apply(null,arguments); }
function reminderPrayerOccurrences(){ return SEYMA_REMINDERS.reminderPrayerOccurrences.apply(null,arguments); }

// ── REM-33: system capability / freshness contract ────────────────────────
// Bu katman yalnız allowlisted durum ve genel açıklama üretir. Token, raw
// hata, konum, vakit saati veya kullanıcı metni dışarıya dönmez.
var REMINDER_SYSTEM_STATUS_VERSION=1;
var REMINDER_SYSTEM_SYNC_STATES={disabled:true,idle:true,pending:true,synced:true,error:true,offline:true};
function reminderSystemOffline(){ return SEYMA_REMINDER_SURFACE.reminderSystemOffline.apply(null,arguments); }
function reminderSystemPrayerStatus(){ return SEYMA_REMINDERS.reminderSystemPrayerStatus.apply(null,arguments); }
function reminderSystemSyncStatus(){ return SEYMA_REMINDERS.reminderSystemSyncStatus.apply(null,arguments); }
function reminderSystemStatus(){ return SEYMA_REMINDERS.reminderSystemStatus.apply(null,arguments); }
// REM-68 — App -> sync -> projection -> panel zincirinin ayrık durum sözleşmesi.
// Bu adapter legacy kullanıcı status'unu değiştirmez; her katmanın kanıtını
// kendi sahibinde tutar. Bir katmanın green/accepted sonucu başka bir katmana
// otomatik taşınmaz. Dönen nesne yalnız sabit kod, güvenli reason ve evidence
// owner içerir; reminder body/category/schedule gibi ayrıntılar taşımaz.
function reminderCrossSurfaceStatus(){ return SEYMA_REMINDERS.reminderCrossSurfaceStatus.apply(null,arguments); }
function reminderCrossSurfaceTransition(){ return SEYMA_REMINDERS.reminderCrossSurfaceTransition.apply(null,arguments); }
function reminderSystemStatusCopy(){ return SEYMA_REMINDERS.reminderSystemStatusCopy.apply(null,arguments); }
function reminderSystemStatusHTML(){ return SEYMA_REMINDERS.reminderSystemStatusHTML.apply(null,arguments); }

// ── REM-15 Zikir / tefekkür adapter ───────────────────────────────────────
// Zikir reminderları yalnız kullanıcının reminder preference'ı üzerinden
// oluşur. Zikr root'u ve reflection kayıtları occurrence'a kopyalanmaz;
// özellikle reflection metni native veya device delivery journal sınırına
// hiç girmez.
var REMINDER_ZIKR_ID='reminder.catalog.v1.zikr';
var REMINDER_ZIKR_FREQUENCIES={weekly:true,'selected-window':true};
var REMINDER_ZIKR_MIN_INTERVAL_DAYS=7;
function reminderZikrFeatureEnabled(){ return SEYMA_REMINDERS.reminderZikrFeatureEnabled.apply(null,arguments); }
function reminderZikrDailyOccurrence(){ return SEYMA_REMINDERS.reminderZikrDailyOccurrence.apply(null,arguments); }
function reminderZikrJourneyOccurrence(){ return SEYMA_REMINDERS.reminderZikrJourneyOccurrence.apply(null,arguments); }
function reminderZikrReflectionOccurrence(){ return SEYMA_REMINDERS.reminderZikrReflectionOccurrence.apply(null,arguments); }
function reminderZikrOccurrences(){ return SEYMA_REMINDERS.reminderZikrOccurrences.apply(null,arguments); }
function reminderZikrLifecycleCandidates(){ return SEYMA_REMINDERS.reminderZikrLifecycleCandidates.apply(null,arguments); }

// ── REM-16 Terapi Odası support adapter ─────────────────────────────────
// This boundary is deliberately preference-only: therapy-day records, CBT
// notes, feelings, safe-share text and crisis text never participate in
// occurrence generation, native copy or the delivery journal.
var REMINDER_THERAPY_ID='reminder.catalog.v1.therapy';
var REMINDER_THERAPY_TOOL_IDS={firstStep:true,selfCompassion:true,breath:true,thought:true};
var REMINDER_THERAPY_TOOL_ALIASES={
  'first-step':'firstStep','first_step':'firstStep','firststep':'firstStep',
  'self-compassion':'selfCompassion','self_compassion':'selfCompassion','selfcare':'selfCompassion',
  breathing:'breath','breathwork':'breath',
  cbt:'thought','thought-record':'thought','thought_record':'thought','cognitive':'thought'
};
var REMINDER_THERAPY_FREQUENCIES={daily:true,weekly:true,'selected-window':true};
function reminderTherapyToolFromValue(){ return SEYMA_REMINDERS.reminderTherapyToolFromValue.apply(null,arguments); }
function reminderTherapyToolId(){ return SEYMA_REMINDERS.reminderTherapyToolId.apply(null,arguments); }
function reminderTherapyOccurrence(){ return SEYMA_REMINDERS.reminderTherapyOccurrence.apply(null,arguments); }
function reminderTherapyPrivateCopy(){ return SEYMA_REMINDERS.reminderTherapyPrivateCopy.apply(null,arguments); }
function reminderTherapyLifecycleCandidates(){ return SEYMA_REMINDERS.reminderTherapyLifecycleCandidates.apply(null,arguments); }

// ── REM-17 Saygı / Günün Öncüsü reading adapter ────────────────────────────
// Saygı hatırlatması yalnızca kullanıcının seçtiği pencere için, günde tek
// occurrence üretir. Kişi adı, makale başlığı ve article gövdesi bu sınırdan
// bilerek geçirilmez; native copy her zaman genel kalır.
var REMINDER_SAYGI_ID='reminder.catalog.v1.saygi';
var REMINDER_SAYGI_FREQUENCIES={daily:true};
function reminderSaygiArticleState(){ return SEYMA_REMINDERS.reminderSaygiArticleState.apply(null,arguments); }
function reminderSaygiOccurrence(){ return SEYMA_REMINDERS.reminderSaygiOccurrence.apply(null,arguments); }
function reminderSaygiPrivateCopy(){ return SEYMA_REMINDERS.reminderSaygiPrivateCopy.apply(null,arguments); }
function reminderSaygiLifecycleCandidates(){ return SEYMA_REMINDERS.reminderSaygiLifecycleCandidates.apply(null,arguments); }

// ── REM-09 Device delivery journal ────────────────────────────────────────
// Bu kayıt `data` nesnesinden, ÆON `data.notifications` kanalından ve sync/panel
// zincirinden bilinçli olarak ayrıdır. Yalnız occurrence kimliği, kanal, durum,
// güvenli zaman damgaları ve allowlist reason saklanır; native body veya kullanıcı
// içeriği bu sözleşmeye hiç alınmaz.
var REMINDER_DELIVERY_SCHEMA_VERSION=2;
var REMINDER_DELIVERY_KEY='seyma-reminder-delivery-v1';
// REM-45 owner contract: these are deliberately different storage/lifecycle
// boundaries. Only the preference map is part of local canonical app state;
// the other four owners are catalog, derived evaluation, or device-local log.
var REMINDER_STATE_OWNER_CONTRACT={
  schemaVersion:1,
  definition:{owner:'ReminderCatalogV1',storage:'code/catalog',persisted:false,privacyClass:'P0'},
  preference:{owner:'data.reminders.preferences',storage:'localStorage:seyma-reset-v1',persisted:true,sync:'blocked-before-sync',privacyClass:'P2'},
  occurrence:{owner:'foreground-reminder-scheduler',storage:'derived-ephemeral',persisted:false,privacyClass:'P1/P2'},
  deliveryJournal:{owner:'device-delivery-adapter',storage:'localStorage:seyma-reminder-delivery-v1',persisted:false,sync:'never',privacyClass:'P1/P2'},
  suppression:{owner:'reminder-policy-evaluator',storage:'evaluation-context',persisted:false,privacyClass:'P2/P3'},
  syncGate:{owner:'app.reminderSyncPayload',blockedRoots:Object.keys(REMINDER_SYNC_BLOCKED_ROOTS).sort()}
};
function reminderStateContract(){ return SEYMA_REMINDERS.reminderStateContract.apply(null,arguments); }
var REMINDER_DELIVERY_MAX_AGE_MS=REMINDER_RETENTION_POLICY.deliveryJournal.maxAgeDays*24*60*60*1000;
var REMINDER_DELIVERY_MAX_ENTRIES=REMINDER_RETENTION_POLICY.deliveryJournal.maxEntries;
var REMINDER_DELIVERY_STATUSES={scheduled:true,shown:true,opened:true,snoozed:true,dismissed:true,suppressed:true,failed:true};
var REMINDER_DELIVERY_STATUS_LIST=['scheduled','shown','opened','snoozed','dismissed','suppressed','failed'];
var REMINDER_DELIVERY_STATUS_RANK={scheduled:0,shown:1,opened:2,snoozed:3,dismissed:3,suppressed:3,failed:3};
var REMINDER_DELIVERY_CHANNELS={in_app:true,native:true};
var REMINDER_DELIVERY_REASONS={
  'quiet-hours':true,
  'daily-budget':true,
  'category-cooldown':true,
  'permission-denied':true,
  'not-visible':true,
  'today-muted':true,
  'stale-data':true,
  'already-completed':true,
  'duplicate':true,
  'capacity':true,
  'disabled':true,
  'invalid':true,
  'not-required':true,
  'channel-policy':true,
  'unsupported':true,
  'catchup-grouped':true,
  'catchup-expired':true,
  'storage-error':true,
  'native-error':true,
  'unknown':true
};
var REMINDER_DELIVERY_BLOCKING_STATUSES={shown:true,opened:true,snoozed:true,dismissed:true,suppressed:true};

function reminderDeliveryEmpty(){ return SEYMA_REMINDERS.reminderDeliveryEmpty.apply(null,arguments); }
function reminderDeliveryNow(){ return SEYMA_REMINDERS.reminderDeliveryNow.apply(null,arguments); }
function reminderDeliveryStatus(){ return SEYMA_REMINDERS.reminderDeliveryStatus.apply(null,arguments); }
function reminderDeliveryReason(){ return SEYMA_REMINDERS.reminderDeliveryReason.apply(null,arguments); }
function reminderDeliveryTombstones(){ return SEYMA_REMINDERS.reminderDeliveryTombstones.apply(null,arguments); }
function reminderDeliveryNormalize(){ return SEYMA_REMINDERS.reminderDeliveryNormalize.apply(null,arguments); }
function reminderDeliveryFind(){ return SEYMA_REMINDERS.reminderDeliveryFind.apply(null,arguments); }
function reminderDeliveryCanShowPure(){ return SEYMA_REMINDERS.reminderDeliveryCanShowPure.apply(null,arguments); }
function reminderDeliveryStorageRead(){ return SEYMA_REMINDER_SURFACE.reminderDeliveryStorageRead.apply(null,arguments); }
function reminderDeliveryStorageWrite(){ return SEYMA_REMINDER_SURFACE.reminderDeliveryStorageWrite.apply(null,arguments); }
function reminderDeliveryLoad(){ return SEYMA_REMINDERS.reminderDeliveryLoad.apply(null,arguments); }
function reminderDeliveryAction(){ return SEYMA_REMINDERS.reminderDeliveryAction.apply(null,arguments); }
function reminderDeliveryRecordAdapter(){ return SEYMA_REMINDERS.reminderDeliveryRecordAdapter.apply(null,arguments); }
function reminderDeliveryClear(){ return SEYMA_REMINDER_SURFACE.reminderDeliveryClear.apply(null,arguments); }

// ── REM-10 Foreground reminder scheduler ─────────────────────────────────
// Bu katman yalnız occurrence -> policy -> device journal zincirini yürütür.
// Native gönderim, ağ polling'i, data.notifications ve kullanıcı metni bu
// sözleşmenin dışındadır. Aynı occurrence'ın ikinci kez görünmesini asıl
// olarak delivery journal'ın tekil occurrence kaydı engeller.
var REMINDER_LIFECYCLE_INTERVAL_MS=30000;
var REMINDER_LIFECYCLE_VISIBILITY={visible:true,hidden:true};
var reminderLifecycleState={running:false,lastSource:'',lastEvaluatedAt:'',lastResult:null,recoveryPending:false,candidateSignature:'',candidateChanged:false,renderCount:0,noOpCount:0,renderErrorCount:0,lastRenderReason:'',renderPolicy:'',renderTarget:'',targetedUpdateCount:0,deferredRenderCount:0,renderReceipt:null,renderReceiptHistory:[]};
var REMINDER_SCHEDULER_BURST_MS=1000;
var REMINDER_SCHEDULER_TRIGGER_ORDER=['boot','foreground','focus','pageshow','online','hidden','visibilitychange','timer','offline','manual'];
var reminderSchedulerInstance=null;

function reminderLifecycleVisibility(){ return SEYMA_REMINDERS.reminderLifecycleVisibility.apply(null,arguments); }
// ── REM-11 Catch-up / grouping / conflict resolution ─────────────────────
// Catch-up is deliberately a separate pure layer. It returns one generic
// in-app summary and never carries native title/body, user text, therapy text,
// medication detail, or data.notifications records across the boundary.
var REMINDER_CATCHUP_MAX_AGE_MS=REMINDER_RETENTION_POLICY.occurrence.maxAgeDays*24*60*60*1000;
var REMINDER_CATCHUP_REASON='catchup-grouped';
var REMINDER_CATCHUP_EXPIRED_REASON='catchup-expired';
var REMINDER_CATCHUP_SUMMARY_VERSION=1;
function reminderCatchupPlan(){ return SEYMA_REMINDERS.reminderCatchupPlan.apply(null,arguments); }
function reminderCatchupPublic(){ return SEYMA_REMINDERS.reminderCatchupPublic.apply(null,arguments); }
function reminderEvaluateReminders(){ return SEYMA_REMINDERS.reminderEvaluateReminders.apply(null,arguments); }
function reminderLifecycleDefaultContext(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleDefaultContext.apply(null,arguments); }
// REM-19: mevcut su/uyku/kafein/hareket yüzeylerinin ortak reminder adapterı.
// Bu katalog dışı sentetik tanımlar yalnız güvenli başlık/hedef taşır; günlük
// kayıt, miktar, uyku süresi, kafein detayı veya pratik notu occurrence'a girmez.
function reminderCareDefinitions(){ return SEYMA_REMINDERS.reminderCareDefinitions.apply(null,arguments); }
function reminderCareNativeCategories(){ return SEYMA_REMINDERS.reminderCareNativeCategories.apply(null,arguments); }
function reminderCareLifecycleCandidates(){ return SEYMA_REMINDERS.reminderCareLifecycleCandidates.apply(null,arguments); }
function reminderCareNudgeSources(){ return SEYMA_REMINDERS.reminderCareNudgeSources.apply(null,arguments); }
// REM-18: aynı akşam birden fazla ritual/reflection adayını tek, optional
// occurrence'a indir. Bu adapter yalnız güvenli hedef kimlikleri taşır;
// journal text, mood, note, kişi adı, makale başlığı veya okuma bağlamı
// hiçbir zaman occurrence/native sınırına girmez.
var REMINDER_EVENING_ID='reminder.coalesced.evening.v1';
var REMINDER_EVENING_START_MINUTES=18*60;
var REMINDER_EVENING_SURFACES={
  zikr:{reminderId:REMINDER_ZIKR_ID,deepLink:'zikr',label:'Zikir',detail:'Kısa bir sakinlik alanı',category:'ritual'},
  saygi:{reminderId:REMINDER_SAYGI_ID,deepLink:'saygi',label:'İlham okuması',detail:'Bugünün ilham durağı',category:'ritual'},
  reading:{reminderId:'reminder.catalog.v1.reading',deepLink:'reading',label:'Kitaplık',detail:'Okuma yolculuğu',category:'ritual'},
  journal:{reminderId:'reminder.catalog.v1.journal',deepLink:'gunluk',label:'Günlük Işığı',detail:'Günü sakince kapatma',category:'reflection'}
};
function reminderEveningSurface(){ return SEYMA_REMINDERS.reminderEveningSurface.apply(null,arguments); }
function reminderEveningSafeGroup(){ return SEYMA_REMINDERS.reminderEveningSafeGroup.apply(null,arguments); }
function reminderEveningCoalesceCandidates(){ return SEYMA_REMINDERS.reminderEveningCoalesceCandidates.apply(null,arguments); }
// REM-31: sabah / gün içi / akşam / hafif gün ortak akış policy'si.
// Akış, tek tek kartların yerine aynı gün bağlamında bir primary davet ve
// güvenli alternatifler üretir. Bu katman yalnız allowlist edilmiş hedefleri,
// kategori kimliğini ve genel kopyayı taşır; note, mood, journal veya routine
// gövdesi akış sınırından geçmez.
var REMINDER_DAILY_FLOW_VERSION='1';
var REMINDER_DAILY_FLOW_WINDOWS={
  morning:{label:'Sabah açılışı',start:'00:00',end:'11:59'},
  day:{label:'Gün içi küçük odak',start:'12:00',end:'17:59'},
  evening:{label:'Akşam kapanışı',start:'18:00',end:'23:59'},
  light:{label:'Hafif gün',start:'00:00',end:'23:59'}
};
var REMINDER_DAILY_FLOW_LABELS={
  faith:'İman Köşesi',zikr:'Zikir',room:'Sakin destek',saygi:'İlham okuması',reading:'Kitaplık',gunluk:'Günlük Işığı',health:'Beden bakımı',settings:'Ayarlar'
};
var REMINDER_DAILY_FLOW_CARE_LABELS={water:'Su',sleep:'Uykuya hazırlık',caffeine:'Kafein',movement:'Hareket'};
function reminderDailyFlowPolicy(){ return SEYMA_REMINDERS.reminderDailyFlowPolicy.apply(null,arguments); }
function reminderDailyFlowGroup(){ return SEYMA_REMINDERS.reminderDailyFlowGroup.apply(null,arguments); }
function reminderDailyFlowCoalesceCandidates(){ return SEYMA_REMINDERS.reminderDailyFlowCoalesceCandidates.apply(null,arguments); }
function reminderLifecycleDraftActive(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleDraftActive.apply(null,arguments); }
function reminderLifecycleLiveHTML(){ return SEYMA_REMINDERS.reminderLifecycleLiveHTML.apply(null,arguments); }
function reminderLifecycleReplaceTarget(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleReplaceTarget.apply(null,arguments); }
function reminderLifecycleUpdateLive(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleUpdateLive.apply(null,arguments); }
function reminderLifecycleTargetedUpdate(){ return SEYMA_REMINDERS.reminderLifecycleTargetedUpdate.apply(null,arguments); }
function reminderLifecycleRecordReceipt(){ return SEYMA_REMINDERS.reminderLifecycleRecordReceipt.apply(null,arguments); }
function reminderLifecycleRenderPolicy(){ return SEYMA_REMINDERS.reminderLifecycleRenderPolicy.apply(null,arguments); }
function reminderLifecycleRenderIfNeeded(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleRenderIfNeeded.apply(null,arguments); }
function reminderRenderAction(){ return SEYMA_REMINDERS.reminderRenderAction.apply(null,arguments); }
function reminderLifecycleEvaluate(){ return SEYMA_REMINDERS.reminderLifecycleEvaluate.apply(null,arguments); }
function reminderSchedulerFallbackCreate(){ return SEYMA_REMINDERS.reminderSchedulerFallbackCreate.apply(null,arguments); }
function reminderSchedulerEnsure(){ return SEYMA_REMINDER_SURFACE.reminderSchedulerEnsure.apply(null,arguments); }
function reminderSchedulerDispatch(){ return SEYMA_REMINDER_SURFACE.reminderSchedulerDispatch.apply(null,arguments); }
function reminderSchedulerSnapshot(){ return SEYMA_REMINDER_SURFACE.reminderSchedulerSnapshot.apply(null,arguments); }
function reminderLifecycleTick(){ return SEYMA_REMINDERS.reminderLifecycleTick.apply(null,arguments); }
// MON-19: prayer registry, app.js'in canlı state/date/save resolver bag'i ile
// bağlanır. Registry gövdeleri kendi başına load-time fetch/GPS/localStorage
// çağrısı yapmaz; dış yan etkiler yalnız kullanıcı eyleminin çağrı yolunda açılır.
if(!window.SeymaPrayer||typeof window.SeymaPrayer.registerPrayer!=='function'||!window.SeymaPrayer.registerPrayer({
  data:function(){ return data; },
  getDay:getDay,
  dayIndexFor:dayIndexFor,
  todayStr:todayStr,
  addDays:addDays,
  pad:pad,
  esc:esc,
  save:save,
  storage:function(){ return localStorage; },
  fetch:function(){ return window.fetch; }
})) throw new Error('MON-19: SeymaPrayer registry kurulamadı');
// MON-12: migrate gövdesi state registry'sinde yaşar; tüm kapanış bağımlılıkları
// burada açıkça bağlanır. `data` rebind'i ve archive backfill adaptörü app.js'te
// kalır; registry yalnızca bu fonksiyonları çağırır.
if(!window.SeymaState||typeof window.SeymaState.registerMigrate!=='function'||!window.SeymaState.registerMigrate({
  migrateReminderState:migrateReminderState,
  normalizeSyncReceipt:normalizeSyncReceipt,
  ensureEventLog:ensureEventLog,
  emptyZikrRoot:emptyZikrRoot,
  migrateZikrV2:migrateZikrV2,
  ensureSaygiDay:ensureSaygiDay,
  emptySaygiRoot:emptySaygiRoot,
  ensureQuranJourney:ensureQuranJourney,ensureQuranLearn:ensureQuranLearn,
  emptyLibrary:emptyLibrary,
  normBook:normBook,
  emptyWatchlist:emptyWatchlist,
  normTitle:normTitle,
  emptyMusic:emptyMusic,
  normTrack:normTrack,
  emptySoulArchive:emptySoulArchive,
  normSoulItem:normSoulItem,
  backfillArchivesFromDays:backfillArchivesFromDays,
  todayStr:todayStr,
  syncDerivedHabits:syncDerivedHabits,
  ensureProfileAssessment:ensureProfileAssessment,
  dailyPhotoCopy:dailyPhotoCopy,
  ensureTherapyAllDays:ensureTherapyAllDays,
  ensurePrayerDay:ensurePrayerDay,
  caffeineDefaultBed:CAFFEINE_DEFAULT_BED
})) throw new Error('MON-12: SeymaState migrate registry kurulamadı');
// MON-13: getDay gövdesi state registry'sinde yaşar; empty/day bağımlılıkları
// açık bag ile bağlanır, mutable gün referansı app.js'e kopyalanmaz.
if(!window.SeymaState||typeof window.SeymaState.registerGetDay!=='function'||!window.SeymaState.registerGetDay({
  emptyHabits:emptyHabits,
  habits:HABITS,
  emptyMeals:emptyMeals,
  emptyMealItems:emptyMealItems,
  emptyWindDown:emptyWindDown,
  windDownSteps:WIND_DOWN_STEPS,
  emptyPrayerDay:emptyPrayerDay,
  emptyDiscomfort:emptyDiscomfort,
  emptyMovement:emptyMovement,
  emptyReading:emptyReading,
  emptyWatching:emptyWatching,
  emptyListening:emptyListening,
  emptyLearning:emptyLearning,
  emptyHealth:emptyHealth,
  emptyMagnesium:emptyMagnesium,
  emptyTherapy:emptyTherapy,
  ensureTherapyDay:ensureTherapyDay,
  ensurePrayerDay:ensurePrayerDay,
  caffeineLastTime:caffeineLastTime
})) throw new Error('MON-13: SeymaState getDay registry kurulamadı');
// MON-14: createDefaultData gövdesi state registry'sinde yaşar; tarih ve boş
// root üreticileri açık bag ile bağlanır. start/late-boot data= atamaları ve
// reset/import sahipliği app.js'te kalır.
if(!window.SeymaState||typeof window.SeymaState.registerCreateDefaultData!=='function'||!window.SeymaState.registerCreateDefaultData({
  todayStr:todayStr,
  nowIso:function(){ return new Date().toISOString(); },
  emptySyncReceipt:emptySyncReceipt,
  emptyEventLog:emptyEventLog,
  emptyReminderState:emptyReminderState,
  emptyLibrary:emptyLibrary,
  emptyWatchlist:emptyWatchlist,
  emptyMusic:emptyMusic
})) throw new Error('MON-14: SeymaState createDefaultData registry kurulamadı');
// MON-17: save gövdesi syncGlue registry'sinde yaşar; data/ui resolverları
// canlı closure bağını korur, storage ve SeySync çağrı anında çözülür.
if(!window.SeymaSave||typeof window.SeymaSave.registerSave!=='function'||!window.SeymaSave.registerSave({
  data:function(){ return data; },
  ui:function(){ return ui; },
  activeDate:activeDate,
  syncDerivedHabits:syncDerivedHabits,
  normalizeSyncReceipt:normalizeSyncReceipt,
  appendEvent:appendEvent,
  mergePersistedReminderState:mergePersistedReminderState,
  reminderSyncPayload:reminderSyncPayload,
  updateHeaderSave:updateHeaderSave,
  storage:function(){ return localStorage; },
  key:KEY,
  sync:function(){ return window.SeySync; }
})) throw new Error('MON-17: SeymaSave save registry kurulamadı');
try{ var raw=localStorage.getItem(KEY); data=raw?JSON.parse(raw):null; }catch(e){ data=null; }
if(data) data=migrate(data);
if(window.MotivationProgramV2 && data && featuresLive()) window.MotivationProgramV2.ensureMotivationRoot(data);
// FX-P-05 (Faz 0) · B1 kararı — CANLI GETTER'lar.
// `data` mutable bir bağlamadır (6+ kez yeniden atanır: 4412/4413/6692/9203/
// 18724/9173/9177). Tek seferlik düz atama bayat kalır; canlı getter
// her okumada closure'daki taze değeri döndürür. Mevcut fonksiyonların
// davranışını/imzasını değiştirmez — yalnızca `window` üzerinden okunabilir
// kılar. I2/I3/I4'ü ihlal etmez ("dokunulmaz" = "davranış değiştirmez").
Object.defineProperty(window, 'data', { get: function(){ return data; }, configurable: true });
Object.defineProperty(window, 'ui',   { get: function(){ return ui; },   configurable: true });
Object.defineProperty(window, 'dark', { get: function(){ return dark; }, configurable: true });
Object.defineProperty(window, 'migrate', { get: function(){ return migrate; }, configurable: true });
Object.defineProperty(window, 'getDay',  { get: function(){ return getDay; },  configurable: true });
Object.defineProperty(window, 'createDefaultData', { get: function(){ return createDefaultData; }, configurable: true });
Object.defineProperty(window, 'save', { get: function(){ return save; }, configurable: true });
function migrate(d){ return window.SeymaState.migrate(d); }
// ── Tema: üç durumlu tercih, tek durumlu çıktı (AD-31) ──
// `themePref` üç değer alır: 'system' (varsayılan) | 'light' | 'dark'.
// `dark` bunun ÇÖZÜLMÜŞ hâlidir. Uygulamadaki ~93 okuma yeri (inline stiller,
// onboarding paleti, render()'ın data-theme yazımı) tercihi değil bu boolean'ı
// okur — bu yüzden CSS'te ikinci bir koyu token bloğu GEREKMEZ:
// `#root[data-theme="dark"]` (app/styles.css) tek kaynak olarak kalır.
// Kalıcılık: 'system' = anahtarın YOKLUĞU, böylece hiç seçim yapmamış eski
// kayıtlar otomatik olarak sistemi takip eder; açık/koyu seçmiş olanlar korunur.
var themePref='system';
try{ var _tp=localStorage.getItem(TKEY); if(_tp==='dark'||_tp==='light') themePref=_tp; }catch(e){}
function systemPrefersDark(){ return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
function resolveDark(){ return themePref==='dark' ? true : themePref==='light' ? false : systemPrefersDark(); }
var dark=resolveDark();
// Cihaz teması uygulama açıkken değişirse yalnızca 'system' tercihinde yeniden boya.
try{
  if(window.matchMedia){
    var _mq=matchMedia('(prefers-color-scheme: dark)');
    var _onSchemeChange=function(){
      if(themePref!=='system') return;
      var next=resolveDark();
      if(next===dark) return;
      dark=next;
      try{ if(document.getElementById('root')) render(); }catch(e){}
    };
    if(_mq.addEventListener) _mq.addEventListener('change',_onSchemeChange);
    else if(_mq.addListener) _mq.addListener(_onSchemeChange);
  }
}catch(e){}

// ── Kilit ekranı: statik sadece hash, düz metin kaynak kodda yok ──
var AUTH_HASH='ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4';
function sha256(str){
  function rotr(n,x){ return (x>>>n)|(x<<(32-n)); }
  function sigma0(x){ return rotr(2,x)^rotr(13,x)^rotr(22,x); }
  function sigma1(x){ return rotr(6,x)^rotr(11,x)^rotr(25,x); }
  function gamma0(x){ return rotr(7,x)^rotr(18,x)^(x>>>3); }
  function gamma1(x){ return rotr(17,x)^rotr(19,x)^(x>>>10); }
  function ch(x,y,z){ return (x&y)^(~x&z); }
  function maj(x,y,z){ return (x&y)^(x&z)^(y&z); }
  var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var msg=str||'';
  var bytes=[];
  for(var i=0;i<msg.length;i++){
    var c=msg.charCodeAt(i);
    if(c<0x80) bytes.push(c);
    else if(c<0x800){ bytes.push(0xC0|(c>>>6), 0x80|(c&0x3F)); }
    else { bytes.push(0xE0|(c>>>12), 0x80|((c>>>6)&0x3F), 0x80|(c&0x3F)); }
  }
  var l=bytes.length;
  var padLen=64-((l+9)%64); if(padLen===64) padLen=0;
  bytes.push(0x80);
  for(var p=0;p<padLen;p++) bytes.push(0);
  var bitLenHi=(l>>>29), bitLenLo=(l*8)>>>0;
  for(var b=24;b>=0;b-=8) bytes.push((bitLenHi>>>b)&0xff);
  for(var b=24;b>=0;b-=8) bytes.push((bitLenLo>>>b)&0xff);
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var w=[];
  for(var chunk=0;chunk<bytes.length;chunk+=64){
    for(var t=0;t<16;t++){ w[t]=(bytes[chunk+t*4]<<24)|(bytes[chunk+t*4+1]<<16)|(bytes[chunk+t*4+2]<<8)|bytes[chunk+t*4+3]; }
    for(var t=16;t<64;t++){ w[t]=(gamma1(w[t-2])+w[t-7]+gamma0(w[t-15])+w[t-16])>>>0; }
    var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(var t=0;t<64;t++){
      var t1=(h+sigma1(e)+ch(e,f,g)+K[t]+w[t])>>>0;
      var t2=(sigma0(a)+maj(a,b,c))>>>0;
      h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
  }
  var out='';
  for(var i=0;i<8;i++){ for(var b=28;b>=0;b-=4) out+=((H[i]>>>b)&0xf).toString(16); }
  return out;
}

var ui={tab:'bugun', crisisKind:null, crisisOpts:[], crisisTriggers:[], crisisNote:'', crisisDone:false, crisisTrigOpen:false, crisisTriedOpen:false, dayDetail:null, emergency:false, resetStep:0, noteIndex:0, forceStart:false, authRemember:false, authError:false, authErrorMsg:'', authUnlocked:false, pendingAuth:null, pulse:null, keyEdit:false, saveState:'clean', saveActionPending:false, readingOpen:false, readingDraft:null, readingView:'today', bookEdit:null, logBookId:null, quoteDraft:null, watchOpen:false, watchDraft:null, watchView:'today', titleEdit:null, logItemId:null, replicaDraft:null, lunaDraft:'', aeonDraft:'', askKind:null, askQuestion:'', lunaError:null, aeonError:null, openaiKeyState:null, stepNudgeHidden:false, stepRemindHidden:false, waterNudgeHidden:false, bodyView:'front', aeonScrollBottom:false, locationConsent:false, editDate:null, editStartMs:0, weatherOpen:false, heatYear:null, locNudgeOpen:false, locNudgeShown:[], aeonShowAllHistory:false, aeonExpanded:{}, healthSetupOpen:false, aeonRecActive:false, aeonUploading:false, aeonAttachOpen:false, motivationMinimumOpen:false, motivationReflectionDraft:'', motivationCardOpen:false, learningOpen:false, learningDraft:null, soulArchiveOpen:false, soulPracticePicker:false, soulActivityOpen:false, soulActivityDraft:null, faithOpen:false, faithTab:'oz', faithHeatYear:null, zikrView:'counter', zikrPresetFilter:'', zikrTopic:'all', zikrFiltersOpen:false, zikrResetPending:false, zikrResetPresetId:'', zikrLastReset:null, zikrActionNote:'', zikrSettingsNote:'', zikrRemoveHatimId:'', zikrPresetDraft:null, zikrOpen:false, qiblaOpen:false, qiblaHeading:null, qiblaListening:false, saygiKey:null, saygiBrowseId:null, saygiArticle:null, saygiLoading:false, saygiError:null, saygiReadReady:false, saygiRequestId:0, saygiQuery:'', saygiKindFilter:'all', saygiReadFilter:'all', saygiGridOpen:false, roomTab:'path', roomTool:null, roomProfileFetchState:'idle', roomProfileError:null, roomBreathActive:false, roomBreathTimer:null, roomDecisionTimer:null, roomFirstTimer:null, cards:{}, cardsInit:false, reminderCenterOpen:false, reminderReturnFocusId:'', reminderTargetReturnFocusId:'', reminderPreviewId:'', reminderPreviewLegacyId:'', reminderTodayMuted:false, reminderInboxTodayMuted:false, reminderSetupCategories:[], reminderMedicationDraft:null, reminderMedicationEditingId:'', reminderMedicationError:'', reminderCenterNotice:'', reminderCenterUndo:null, reminderAllUndo:null, reminderHistoryUndo:null, reminderTestState:null, reminderDigestOpen:false, reminderDigestState:'idle', reminderDigestReflection:'', saygiPersonOpen:false, quranJourneyOpen:false, quranJourneyView:'library', quranDetailId:'', quranQuery:'', quranFilter:'all', quranFiltersOpen:false, quranListScroll:0, quranSubmittingId:'', quranNoteDraft:null, quranRemoteStatus:'idle', quranRemoteError:'', quranRemoteCheckedAt:null, quranRefreshing:false, quranVerseIdx:quranRandomVerseStart(),kaoOpen:false,kaoView:'home',kaoReturnFocusId:'',kaoQueue:[],kaoTasks:{},kaoTaskIndex:0,kaoTaskStartedAt:0,kaoUndo:null,kaoUndoTimer:null,kaoFeedback:'',kaoAudioFailed:false};
ui.saygiScaleIndex=(data&&data.reader&&data.reader.preferences)?Math.max(0,Math.min(4,Number(data.reader.preferences.scaleIndex)||0)):0; ui.saygiPosition=null; ui.dailyPhotoOpen=true; ui.dailyPhotoDate='';
// MON-35: persisted consent keeps the gate in its existing checking state, but
// does not initiate a permission probe or watcher during load. Verification and
// live location resume only from an explicit user path or a foreground return.
ui.locationGateState=(data&&data.settings&&data.settings.locationEnabled)?'checking':'required';
ui.locationGateError='';
ui.locationGateRequestInFlight=false;
// Yeniden açılışta bekleyen bir uzak senkron varsa hatırlatıcı geri gelsin.
try{
  var _bootSaveStatus=data&&data.syncReceipt&&data.syncReceipt.status;
  if(_bootSaveStatus&&_bootSaveStatus!=='idle'&&_bootSaveStatus!=='accepted') ui.saveState='dirty';
}catch(e){}
ui.zikrNoteOpen=true; ui.zikrNotePresetId=''; ui.zikrNoteDraft=null; ui.zikrNoteStatus='';
ui.qiblaAccuracy=null; ui.qiblaSensorSource=''; ui.qiblaSensorError=''; ui.qiblaLastAt='';
ui.quranRefreshing=false;
// QY-12: hangi sûrenin video oynatıcısı YÜKLÜ (iframe basılmış). Kalıcı
// DEĞİLDİR — her ekran girişinde kapak/izin katmanına döner (click-to-load
// mahremiyet ilkesi yalnız ilk açılışa özgü değildir, her ziyarete uygulanır).
ui.quranPlayerLoadedId='';
var toastTimer=null, noteTimer=null, pulseTimer=null;
var lastRenderTab=null;
var lastCrisisKind=null;   // Kriz modalı zaten aciksa etkilesim render'inda giris animasyonu tekrar oynamasin
var lastHeaderShown=false; // Sabit marka başlığı: giriş animasyonu yalnızca ilk görünümde oynasın
var lastOverlay=null;      // hangi hub overlay'i (reading/watching) bir onceki render'da aciykti
var lastOverlayView=null;  // o overlay'in aktif sekmesi — gorunum degismediyse scroll korunur
var lastRoomOpen=false;    // Terapi Odasi zaten aciksa etkilesim render'inda giris animasyonu tekrar oynamasin (parlama onlenir)
var lastJournalKind=null;  // Günlük Işığı modalı zaten aciksa etkilesim render'inda giris animasyonu tekrar oynamasin
var aeonLastSeenSort=null; // ÆON: son render'da görünen en yeni mesajın sort anahtarı — yalnızca YENİ mesaja giriş animasyonu oynatmak için
var aeonLastRenderedDateStr=null; // ÆON: son gösterilen mesajın gün-etiketi — hızlı ekleme (appendAeonOutgoing) sırasında yeni gün ayırıcı gerekip gerekmediğini anlamak için
var AEON_PAGE_SIZE=40; // ÆON: geçmiş çok uzadığında her tam render'da yalnızca son N öğeyi kur — "Daha eski mesajlar" ile tamamı açılabilir
var AEON_FILE_ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.zip,application/pdf';
var fieldTimers={}, fieldTimerFns={};
function debounceSave(k,fn,ms){ clearTimeout(fieldTimers[k]); fieldTimerFns[k]=fn; fieldTimers[k]=setTimeout(function(){ delete fieldTimerFns[k]; fn(); },ms||450); }
// Sekme kapanırken/arka plana alınırken bekleyen (henüz süresi dolmamış) debounce'lı
// alan kayıtlarını hemen uygular — aksi halde son 300-500ms içindeki tek bir düzenleme
// (niyet, sayfa no, ilaç notu vb.) hem localStorage'a hem seyma-data'ya hiç yazılmadan
// kaybolabilirdi. finalizeSession() (beforeunload/pagehide/sekme-gizlenme) çağırır.
function flushFieldTimers(){
  var keys=Object.keys(fieldTimerFns);
  for(var i=0;i<keys.length;i++){
    var k=keys[i], fn=fieldTimerFns[k];
    clearTimeout(fieldTimers[k]); delete fieldTimers[k]; delete fieldTimerFns[k];
    try{ fn(); }catch(e){}
  }
}

// ---------- helpers ----------
function esc(s){ return window.SeymaHelpers.esc.apply(null,arguments); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function normalizeToken(v){ return String(v||'').replace(/[^\x20-\x7E]/g,'').trim(); }
// MON-07: saf tarih gövdeleri dateUtils registry'sinin tek sahibidir.
// İmzalar ve dönüşler app.js çağrı noktaları için aynen korunur.
function pad(n){ return window.SeymaDateUtils.pad.apply(null,arguments); }
function fmt(d){ return window.SeymaDateUtils.fmt.apply(null,arguments); }
function todayStr(){ return window.SeymaDateUtils.todayStr.apply(null,arguments); }
function addDays(s,n){ return window.SeymaDateUtils.addDays.apply(null,arguments); }
function diffDays(a,b){ return window.SeymaDateUtils.diffDays.apply(null,arguments); }
function shortDate(s){ return window.SeymaDateUtils.shortDate.apply(null,arguments); }
function dayIndexFor(date){ return window.SeymaDateUtils.dayIndexFor.apply(null,arguments); }
// ---- geçmiş gün düzenleme: aktif tarih ayrımı ----
// activeDate() = düzenlenen gün varsa o, yoksa bugün. Yalnızca MANUEL day-record
// yazımları burayı kullanır; otomatik/canlı yazımlar (konum, oturum, SOS) todayStr()'de kalır.
function activeDate(){ return window.SeymaDateUtils.activeDate.apply(null,arguments); }
function editing(){ return !!ui.editDate; }
function curDay(){ return window.SeymaDateUtils.curDay.apply(null,arguments); }
function emptyHabits(){ var out={}; HABITS.forEach(function(h){ out[h.key]=false; }); return out; }
function countRec(rec){ return rec&&rec.habits?HABITS.reduce(function(a,h){return a+(rec.habits[h.key]?1:0);},0):0; }
function emptyMeals(){ return {breakfast:'',lunch:'',dinner:'',snack:''}; }
function emptyMealItems(){ return {breakfast:[],lunch:[],dinner:[],snack:[]}; }
function emptyWindDown(){ return {steps:{light:false,breath:false,dump:false,cool:false},lastMinutes:null,lastDoneAt:null,offloadNote:'',events:[],sessions:[]}; }

// ---------- besin tahmini (kaba; tıbbi/kesin değer değil) ----------
// per 100g => p: protein(g), c: kalori(kcal); piece: 1 adet ~gram; plate: 1 tabak ~gram
// Besin veritabanı — değerler 100 g başına: p=protein, cb=karbonhidrat, ft=yağ (g).
// Kalori Atwater ile hesaplanır (4·P + 4·C + 9·Y). piece=adet başına ~gram, plate=tabak başına ~gram.
// Sıra önemlidir (ilk anahtar-eşleşmesi kazanır): özel isimler genel isimlerden önce.
var FOOD_DB=SEYMA_HEALTH.FOOD_DB, FOOD_FALLBACK=SEYMA_HEALTH.FOOD_FALLBACK, MEAL_UNITS=SEYMA_HEALTH.MEAL_UNITS, DEFAULT_UNIT_GRAMS=SEYMA_HEALTH.DEFAULT_UNIT_GRAMS;
var PROTEIN_GOAL=SEYMA_HEALTH.PROTEIN_GOAL, CAL_GOAL=SEYMA_HEALTH.CAL_GOAL, WATER_GOAL=SEYMA_HEALTH.WATER_GOAL, VACATION_WATER_GOAL=SEYMA_HEALTH.VACATION_WATER_GOAL, STEP_TICK_MIN=SEYMA_HEALTH.STEP_TICK_MIN, SLEEP_TICK_MIN=SEYMA_HEALTH.SLEEP_TICK_MIN, STEP_LEN_M=SEYMA_HEALTH.STEP_LEN_M;
function foodLookup(){ return SEYMA_HEALTH.foodLookup.apply(null,arguments); }
function mealItemNutr(){ return SEYMA_HEALTH.mealItemNutr.apply(null,arguments); }
function mealNutr(){ return SEYMA_HEALTH.mealNutr.apply(null,arguments); }
function dayNutrition(){ return SEYMA_HEALTH.dayNutrition.apply(null,arguments); }
function unitLabel(){ return SEYMA_HEALTH.unitLabel.apply(null,arguments); }
function lastWeightKg(){ return SEYMA_HEALTH.lastWeightKg.apply(null,arguments); }
function activityFactor(){ return SEYMA_HEALTH.activityFactor.apply(null,arguments); }
function activityLabel(){ return SEYMA_HEALTH.activityLabel.apply(null,arguments); }
function calcTargets(){ return SEYMA_HEALTH.calcTargets.apply(null,arguments); }
function refreshTargets(){
  var t=calcTargets();
  var st=data.settings.targets;
  if(t){ ['bmr','tdee','calories','protein','carbs','fat','fiber','waterCups','steps','sleepHours','caffeineMaxMg','magnesiumMg','ironMg','omega3Mg','vitaminDIU'].forEach(function(k){ st[k]=t[k]; }); st.lastCalculatedAt=new Date().toISOString(); }
  return t;
}
function proteinGoal(){ return SEYMA_HEALTH.proteinGoal.apply(null,arguments); }
function calGoal(){ return SEYMA_HEALTH.calGoal.apply(null,arguments); }
function carbsGoal(){ return SEYMA_HEALTH.carbsGoal.apply(null,arguments); }
function fatGoal(){ return SEYMA_HEALTH.fatGoal.apply(null,arguments); }
function fiberGoal(){ return SEYMA_HEALTH.fiberGoal.apply(null,arguments); }
function waterGoalCups(){ return SEYMA_HEALTH.waterGoalCups.apply(null,arguments); }
function vacationSettings(){ return (data&&data.settings&&data.settings.vacation)||{enabled:false,startAt:'',endAt:'',preset:'active',reason:'',enabledAt:''}; }
function ensureVacationSettings(){ if(!data.settings) data.settings={}; if(!data.settings.vacation||typeof data.settings.vacation!=='object') data.settings.vacation={enabled:false,startAt:'',endAt:'',preset:'active',reason:'',enabledAt:''}; return data.settings.vacation; }
function vacationCardHidden(){ return !!(data&&data.settings&&data.settings.hideVacationCard); }
function isVacationDay(date){ var v=vacationSettings(); if(!v.enabled||!v.startAt||!v.endAt) return false; var d=(date||todayStr()); return d>=v.startAt&&d<=v.endAt; }
function stepsGoal(){ return SEYMA_HEALTH.stepsGoal.apply(null,arguments); }
function sleepGoalHours(){ return SEYMA_HEALTH.sleepGoalHours.apply(null,arguments); }
function caffeineMaxMg(){ return SEYMA_HEALTH.caffeineMaxMg.apply(null,arguments); }
function magnesiumGoalMg(){ return SEYMA_HEALTH.magnesiumGoalMg.apply(null,arguments); }
function ironGoalMg(){ return SEYMA_HEALTH.ironGoalMg.apply(null,arguments); }
function omega3GoalMg(){ return SEYMA_HEALTH.omega3GoalMg.apply(null,arguments); }
function vitaminDGoalIU(){ return SEYMA_HEALTH.vitaminDGoalIU.apply(null,arguments); }
function updateNutriLive(day){ var nu=dayNutrition(day); var pg=proteinGoal(),cg=calGoal(); var pv=document.getElementById('nutri-protein'); if(pv) pv.textContent=nu.protein+'g'; var cv=document.getElementById('nutri-cal'); if(cv) cv.textContent=nu.calories; var bar=document.getElementById('nutri-bar'); if(bar) bar.style.width=Math.min(100,Math.round(nu.protein/pg*100))+'%'; var lp=document.getElementById('nutri-lp'); if(lp) lp.textContent=nu.protein+'g'; var cb=document.getElementById('nutri-carb'); if(cb) cb.textContent=nu.carbs+'g'; var ft=document.getElementById('nutri-fat'); if(ft) ft.textContent=nu.fat+'g'; var sb=document.getElementById('nutri-subtitle'); if(sb) sb.textContent=nu.protein+'g protein · '+nu.carbs+'g karb · '+nu.fat+'g yağ'; var bc=document.getElementById('nutri-badgecal'); if(bc) bc.textContent=nu.calories; var mbar=document.getElementById('nutri-macrobar'); if(mbar) mbar.innerHTML=macroBarHTML(nu); var ni=document.getElementById('nutri-insight'); if(ni) ni.innerHTML=nutriInsightHTML(day,nu); }
// Öğün metnini ve gün makro özetini (day.nutri) birlikte günceller; panel bu özeti okur.
function syncMealText(day,key){ if(!day.meals) day.meals=emptyMeals(); var arr=(day.mealItems&&day.mealItems[key])||[]; day.meals[key]=arr.filter(function(it){return it&&it.name&&String(it.name).trim();}).map(function(it){ var u=it.unit==='gr'?'gr':(' '+unitLabel(it.unit)); var q=(it.qty===''||it.qty==null)?'':it.qty; return (q!==''?q+u+' ':'')+String(it.name).trim(); }).join(', '); day.nutri=dayNutrition(day); }
function medFreeStreak(){ return SEYMA_HEALTH.medFreeStreak.apply(null,arguments); }
function getDay(d,date,idx){ return window.SeymaState.getDay.apply(null,arguments); }
function emptyMovement(){ return {walkM:0,vehicleM:0,totalM:0,maxSpeed:0,samples:0,walkSec:0,vehicleSec:0,track:[]}; }
function emptyReading(){ return {entries:[]}; }
function emptyTherapy(){ return {firstStep:{text:'',startedAt:null,completedAt:null},selfCompassion:{prompt:'',note:'',completedAt:null},breath:{pattern:'4-7-8',seconds:0,completedAt:null},decision:{optionA:'',optionB:'',choice:'',note:'',completedAt:null},thoughts:[],dailyWin:{text:'',completedAt:null},share:{sentAt:null,note:''}}; }
function ensureTherapyDay(day){
  if(!day||typeof day!=='object') return emptyTherapy();
  if(!day.therapy||typeof day.therapy!=='object') day.therapy=emptyTherapy();
  var t=day.therapy;
  if(!t.firstStep||typeof t.firstStep!=='object') t.firstStep={text:'',startedAt:null,completedAt:null};
  if(typeof t.firstStep.text!=='string') t.firstStep.text='';
  if(typeof t.firstStep.startedAt!=='string'&&t.firstStep.startedAt!==null) t.firstStep.startedAt=null;
  if(typeof t.firstStep.completedAt!=='string'&&t.firstStep.completedAt!==null) t.firstStep.completedAt=null;
  if(!t.selfCompassion||typeof t.selfCompassion!=='object') t.selfCompassion={prompt:'',note:'',completedAt:null};
  if(typeof t.selfCompassion.prompt!=='string') t.selfCompassion.prompt='';
  if(typeof t.selfCompassion.note!=='string') t.selfCompassion.note='';
  if(typeof t.selfCompassion.completedAt!=='string'&&t.selfCompassion.completedAt!==null) t.selfCompassion.completedAt=null;
  if(!t.breath||typeof t.breath!=='object') t.breath={pattern:'4-7-8',seconds:0,completedAt:null};
  if(typeof t.breath.pattern!=='string') t.breath.pattern='4-7-8';
  if(typeof t.breath.seconds!=='number'||isNaN(t.breath.seconds)) t.breath.seconds=0;
  if(typeof t.breath.completedAt!=='string'&&t.breath.completedAt!==null) t.breath.completedAt=null;
  if(!t.decision||typeof t.decision!=='object') t.decision={optionA:'',optionB:'',choice:'',note:'',completedAt:null};
  ['optionA','optionB','choice','note'].forEach(function(k){ if(typeof t.decision[k]!=='string') t.decision[k]=''; });
  if(typeof t.decision.completedAt!=='string'&&t.decision.completedAt!==null) t.decision.completedAt=null;
  if(!Array.isArray(t.thoughts)) t.thoughts=[];
  t.thoughts=t.thoughts.filter(function(x){ return x&&typeof x==='object'; }).map(function(x){ return {situation:String(x.situation||''),thought:String(x.thought||''),evidenceFor:String(x.evidenceFor||''),evidenceAgainst:String(x.evidenceAgainst||''),altThought:String(x.altThought||''),createdAt:String(x.createdAt||new Date().toISOString())}; });
  if(!t.dailyWin||typeof t.dailyWin!=='object') t.dailyWin={text:'',completedAt:null};
  if(typeof t.dailyWin.text!=='string') t.dailyWin.text='';
  if(typeof t.dailyWin.completedAt!=='string'&&t.dailyWin.completedAt!==null) t.dailyWin.completedAt=null;
  if(!t.share||typeof t.share!=='object') t.share={sentAt:null,note:''};
  if(typeof t.share.sentAt!=='string'&&t.share.sentAt!==null) t.share.sentAt=null;
  if(typeof t.share.note!=='string') t.share.note='';
  return t;
}
function ensureTherapyAllDays(d){ if(d&&d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ if(d.days[k]&&typeof d.days[k]==='object') ensureTherapyDay(d.days[k]); }); }
// Sağlık uygulaması (iOS Health) senkronu — tarayıcı arka planda GPS izleyemediği için
// telefonun kendi adım sayacından tek yönlü, otomatik (Kısayollar) beslenen alan.
function emptyHealth(){ return SEYMA_HEALTH.emptyHealth.apply(null,arguments); }
function emptyMagnesium(){ return SEYMA_HEALTH.emptyMagnesium.apply(null,arguments); }
function dayMovement(){ return SEYMA_HEALTH.dayMovement.apply(null,arguments); }
function trackedSteps(){ return SEYMA_HEALTH.trackedSteps.apply(null,arguments); }
function effSteps(){ return SEYMA_HEALTH.effSteps.apply(null,arguments); }
// ── Veri-güdümlü tikler ──────────────────────────────────────────────────────
// Su / uyku / yürüyüş tikleri elle işaretlenmez; yalnızca ilgili veri eşiği
// tutunca kendiliğinden yeşillenir. habitProgress hem kapı (met) hem de premium
// ilerleme metni/çubuğu için gereken her şeyi döndürür. Renkler her tik için ayrı.
var DERIVED_HABITS={water:1,sleepReg:1,walked20:1,journaled:1,sweetManaged:1,foodManaged:1,coffeeManaged:1,mediaFed:1,caffeineOk:1};
var DERIVED_ACCENT={water:'#5EA9E6',sleepReg:'#9B7FC9',walked20:'#5BA85B',journaled:'#E0A93C',sweetManaged:'#E9899F',foodManaged:'#E0A55E',coffeeManaged:'#A9805B',mediaFed:'#C77D93',caffeineOk:'#8A5A2B'};
// Bugün okuma/izleme/dinleme/öğrenme hub'larından en az birine kayıt girildi mi? (mediaFed tiki)
function hasAnyHubEntry(rec){
  if(!rec) return false;
  var keys=['reading','watching','listening','learning'];
  for(var i=0;i<keys.length;i++){ var o=rec[keys[i]]; if(o&&Array.isArray(o.entries)&&o.entries.some(function(e){ return e&&((e.title&&String(e.title).trim())||(e.topic&&String(e.topic).trim())); })) return true; }
  if(Array.isArray(rec.soulActivities)&&rec.soulActivities.some(function(a){ return a&&a.type; })) return true;
  return false;
}
function habitProgress(){ return window.SeymaAppSurface.habitProgress.apply(null,arguments); }
// day.habits[key]'i veriyle senkronlar; yeni yeşillenen anahtarları döndürür (kutlama için).
function syncDerivedHabits(day,date){
  if(!day||!day.habits) return [];
  var d=date||activeDate()||todayStr();
  var newly=[];
  for(var k in DERIVED_HABITS){ var p=habitProgress(day,k,d); if(!p) continue; if(p.met&&!day.habits[k]) newly.push(k); day.habits[k]=p.met; }
  return newly;
}
function hexA(hex,a){ var s=String(hex).replace('#',''); if(s.length===3) s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2]; var n=parseInt(s,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
// Tek bir alışkanlık satırı için tutarlı HTML; hem HABITS hem lüteal Mg satırı için.
function habitRowHTML(o){ return SEYMA_RENDER.habitRowHTML.apply(null,arguments); }
// Türetilmiş tik'in (henüz tutmayan) kısa, kibar ilerleme metni.
function derivedProgText(key,prog){
  if(key==='water'){ var g=prog.goal||WATER_GOAL; return prog.cur<=0?'Su ekle · '+g+' bardakta otomatik yeşil':prog.cur+'/'+g+' bardak · dolunca otomatik yeşil'; }
  if(key==='sleepReg') return prog.cur==null?'Uyku gir · 7,5 saatte otomatik yeşil':String(prog.cur).replace('.',',')+' saat · 7,5 saatte otomatik yeşil';
  if(key==='walked20'){ var sg=(prog.goal||9000).toLocaleString('tr-TR'); return prog.cur<=0?'Adım gir · '+sg+' adımda otomatik yeşil':prog.cur.toLocaleString('tr-TR')+' / '+sg+' adım · otomatik yeşil'; }
  if(key==='journaled') return 'Yansıma kartına bir not yaz → kendiliğinden yeşillenir';
  if(key==='sweetManaged') return 'Tatlı krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='foodManaged') return 'Yemek/açlık krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='coffeeManaged') return 'Kahve/kafein krizinde “Krizi yönettim”e bas → kendiliğinden yeşillenir';
  if(key==='mediaFed') return 'Okudum / izledim / dinledim / öğrendim / kurs-pratik yaptım → yeşillenir';
  if(key==='caffeineOk'){ return prog.amountOk ? (prog.has ? 'Son kahve vaktinde, miktar temiz → otomatik yeşil' : 'Bugün kahve yok → otomatik yeşil') : 'Kafein limiti ('+prog.goal+' mg) aşıldı — azaltınca düzelir'; }
  return '';
}
// ---------- Kitaplık & İzleme (kalıcı arşiv) ----------
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function emptyWatching(){ return {entries:[]}; }
function emptyLibrary(){ return {books:[],goal:{dailyPages:20,yearlyBooks:null}}; }
function emptyWatchlist(){ return {items:[],goal:{dailyMinutes:40,yearlyTitles:null}}; }
function emptyListening(){ return {entries:[]}; }
function emptyLearning(){ return {entries:[]}; }
function emptyMusic(){ return {items:[],goal:{dailyMinutes:30,yearlyTitles:null}}; }
function emptySoulArchive(){ return {items:[]}; }
var BOOK_GENRES=['Roman','Klasik','Kişisel gelişim','Şiir','Öykü','Bilim','Tarih','Felsefe','Polisiye','Fantastik'];
var TITLE_GENRES=['Dram','Komedi','Aksiyon','Bilimkurgu','Gerilim','Romantik','Belgesel','Fantastik','Animasyon','Suç'];
function normBook(b){ if(!b||typeof b!=='object') return null; if(!b.id) b.id=uid('b'); b.title=String(b.title==null?'':b.title); b.author=String(b.author==null?'':b.author); b.genre=String(b.genre==null?'':b.genre); if(!b.emoji) b.emoji=''; b.totalPages=(b.totalPages==null||b.totalPages==='')?null:Math.max(0,Math.round(Number(b.totalPages)||0)); b.currentPage=Math.max(0,Math.round(Number(b.currentPage)||0)); if(['reading','finished','dropped'].indexOf(b.status)<0) b.status='reading'; b.rating=(b.rating==null||b.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(b.rating)||0))); if(typeof b.note!=='string') b.note=''; if(!Array.isArray(b.quotes)) b.quotes=[]; if(b.startedAt===undefined) b.startedAt=null; if(b.finishedAt===undefined) b.finishedAt=null; if(!b.createdAt) b.createdAt=new Date().toISOString(); return b; }
function normTitle(t){ if(!t||typeof t!=='object') return null; if(!t.id) t.id=uid('w'); t.title=String(t.title==null?'':t.title); if(t.kind!=='film'&&t.kind!=='dizi') t.kind='film'; t.genre=String(t.genre==null?'':t.genre); if(!t.emoji) t.emoji=''; t.totalEp=(t.totalEp==null||t.totalEp==='')?null:Math.max(0,Math.round(Number(t.totalEp)||0)); t.watchedEp=Math.max(0,Math.round(Number(t.watchedEp)||0)); if(['watching','finished','dropped'].indexOf(t.status)<0) t.status='watching'; t.rating=(t.rating==null||t.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(t.rating)||0))); if(typeof t.note!=='string') t.note=''; if(!Array.isArray(t.quotes)) t.quotes=[]; if(t.startedAt===undefined) t.startedAt=null; if(t.finishedAt===undefined) t.finishedAt=null; if(!t.createdAt) t.createdAt=new Date().toISOString(); return t; }
function ensureLibrary(){ if(!data.library||typeof data.library!=='object') data.library=emptyLibrary(); if(!Array.isArray(data.library.books)) data.library.books=[]; if(!data.library.goal||typeof data.library.goal!=='object') data.library.goal={dailyPages:20,yearlyBooks:null}; return data.library; }
function ensureWatchlist(){ if(!data.watchlist||typeof data.watchlist!=='object') data.watchlist=emptyWatchlist(); if(!Array.isArray(data.watchlist.items)) data.watchlist.items=[]; if(!data.watchlist.goal||typeof data.watchlist.goal!=='object') data.watchlist.goal={dailyMinutes:40,yearlyTitles:null}; return data.watchlist; }
function findBook(id){ var L=ensureLibrary(); for(var i=0;i<L.books.length;i++){ if(L.books[i]&&L.books[i].id===id) return L.books[i]; } return null; }
function findTitle(id){ var W=ensureWatchlist(); for(var i=0;i<W.items.length;i++){ if(W.items[i]&&W.items[i].id===id) return W.items[i]; } return null; }
function normTrack(x){ if(!x||typeof x!=='object') return null; if(!x.id) x.id=uid('m'); x.title=String(x.title==null?'':x.title); x.artist=String(x.artist==null?'':x.artist); if(['sarki','album','podcast'].indexOf(x.kind)<0) x.kind='sarki'; x.genre=String(x.genre==null?'':x.genre); if(!x.emoji) x.emoji=''; x.rating=(x.rating==null||x.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(x.rating)||0))); if(!Array.isArray(x.quotes)) x.quotes=[]; if(!x.createdAt) x.createdAt=new Date().toISOString(); return x; }
function ensureMusic(){ if(!data.music||typeof data.music!=='object') data.music=emptyMusic(); if(!Array.isArray(data.music.items)) data.music.items=[]; if(!data.music.goal||typeof data.music.goal!=='object') data.music.goal={dailyMinutes:30,yearlyTitles:null}; return data.music; }
function ensureSoulArchive(){ if(!data.soulArchive||typeof data.soulArchive!=='object') data.soulArchive=emptySoulArchive(); if(!Array.isArray(data.soulArchive.items)) data.soulArchive.items=[]; return data.soulArchive; }
function findTrack(id){ var M=ensureMusic(); for(var i=0;i<M.items.length;i++){ if(M.items[i]&&M.items[i].id===id) return M.items[i]; } return null; }
// ---- günlük kayıtları ↔ arşiv katalogları senkronizasyonu ----
function normalizeMatch(s){ return String(s==null?'':s).toLowerCase().trim().replace(/\s+/g,' ').replace(/[İ]/g,'i').replace(/[I]/g,'ı'); }
function findBookByEntry(title,author){ var L=ensureLibrary(); var nt=normalizeMatch(title), na=normalizeMatch(author); for(var i=0;i<L.books.length;i++){ var b=L.books[i]; if(!b) continue; if(normalizeMatch(b.title)===nt && normalizeMatch(b.author)===na) return b; } return null; }
function findTitleByEntry(title,kind){ var W=ensureWatchlist(); var nt=normalizeMatch(title), nk=(kind==='dizi'?'dizi':'film'); for(var i=0;i<W.items.length;i++){ var t=W.items[i]; if(!t) continue; if(normalizeMatch(t.title)===nt && t.kind===nk) return t; } return null; }
function findTrackByEntry(title,artist,kind){ var M=ensureMusic(); var nt=normalizeMatch(title), na=normalizeMatch(artist), nk=(['sarki','album','podcast'].indexOf(kind)>=0)?kind:'sarki'; for(var i=0;i<M.items.length;i++){ var x=M.items[i]; if(!x) continue; if(normalizeMatch(x.title)===nt && normalizeMatch(x.artist)===na && x.kind===nk) return x; } return null; }
function syncEntryToLibrary(entry){ if(!entry||!entry.title) return null; var L=ensureLibrary(); var b=null; if(entry.bookId){ b=findBook(entry.bookId); } if(!b){ b=findBookByEntry(entry.title,entry.author); } if(!b){ b=normBook({title:entry.title,author:String(entry.author||''),currentPage:0,totalPages:null,status:'reading',startedAt:entry.ts||new Date().toISOString()}); L.books.unshift(b); } entry.bookId=b.id; return b; }
function syncEntryToWatchlist(entry){ if(!entry||!entry.title) return null; var W=ensureWatchlist(); var t=null; if(entry.itemId){ t=findTitle(entry.itemId); } if(!t){ t=findTitleByEntry(entry.title,entry.kind); } if(!t){ var isDizi=entry.kind==='dizi'; t=normTitle({title:entry.title,kind:isDizi?'dizi':'film',watchedEp:0,totalEp:isDizi?null:1,status:'watching',startedAt:entry.ts||new Date().toISOString()}); W.items.unshift(t); } entry.itemId=t.id; return t; }
function syncEntryToMusic(entry){ if(!entry||!entry.title) return null; var M=ensureMusic(); var x=null; if(entry.itemId){ x=findTrack(entry.itemId); } if(!x){ x=findTrackByEntry(entry.title,entry.artist,entry.kind); } if(!x){ x=normTrack({title:entry.title,artist:String(entry.artist||''),kind:entry.kind,createdAt:entry.ts||new Date().toISOString()}); M.items.unshift(x); } entry.itemId=x.id; return x; }
function normSoulItem(o){ if(!o||typeof o!=='object') return null; if(!o.id) o.id=uid('sa'); o.type=String(o.type==null?'':o.type).trim(); var cat=soulActivityById(o.type); o.label=String(o.label==null?(cat?cat.label:o.type):o.label); o.icon=String(o.icon==null?(cat?cat.icon:'sparkles'):o.icon); o.sci=String(o.sci==null?(cat?cat.sci:''):o.sci); o.totalSessions=Math.max(0,Math.round(Number(o.totalSessions)||0)); o.totalMinutes=Math.max(0,Math.round(Number(o.totalMinutes)||0)); if(o.startedAt===undefined) o.startedAt=null; if(o.lastAt===undefined) o.lastAt=null; if(['active','paused'].indexOf(o.status)<0) o.status='active'; if(typeof o.note!=='string') o.note=''; return o; }
function findSoulItem(type){ var A=ensureSoulArchive(); for(var i=0;i<A.items.length;i++){ var x=A.items[i]; if(x&&x.type===type) return x; } return null; }
function syncEntryToSoulArchive(entry){ if(!entry||!entry.type) return null; var A=ensureSoulArchive(); var x=findSoulItem(entry.type); if(!x){ var act=soulActivityById(entry.type); x=normSoulItem({type:entry.type,label:act?act.label:ucfirst(entry.type),icon:act?act.icon:'sparkles',sci:act?act.sci:'',startedAt:entry.savedAt||entry.ts||new Date().toISOString()}); A.items.unshift(x); } x.totalSessions++; var m=Number(entry.duration); if(!isNaN(m)&&m>0) x.totalMinutes+=Math.max(0,Math.round(m)); x.lastAt=entry.savedAt||entry.ts||new Date().toISOString(); if(!x.startedAt) x.startedAt=x.lastAt; entry.archiveId=x.id; return x; }
function unsyncSoulEntry(entry){ if(!entry||!entry.type) return false; var A=ensureSoulArchive(); var x=findSoulItem(entry.type); if(!x) return false; x.totalSessions=Math.max(0,(Number(x.totalSessions)||0)-1); var m=Number(entry.duration); if(!isNaN(m)&&m>0) x.totalMinutes=Math.max(0,(Number(x.totalMinutes)||0)-Math.max(0,Math.round(m))); return true; }
function backfillArchivesFromDays(d){ var savedData=data; try{ data=d; if(!data.days||typeof data.days!=='object') return; Object.keys(data.days).forEach(function(date){ var day=data.days[date]; if(!day||typeof day!=='object') return; if(day.reading&&Array.isArray(day.reading.entries)) day.reading.entries.forEach(syncEntryToLibrary); if(day.watching&&Array.isArray(day.watching.entries)) day.watching.entries.forEach(syncEntryToWatchlist); if(day.listening&&Array.isArray(day.listening.entries)) day.listening.entries.forEach(syncEntryToMusic); if(Array.isArray(day.soulActivities)) day.soulActivities.forEach(syncEntryToSoulArchive); }); }finally{ data=savedData; } }
function segTabs(defs,active,fn,accent){ return window.SeymaHelpers.segTabs.apply(null,arguments); }
function progBar(pct,col){ return window.SeymaHelpers.progBar.apply(null,arguments); }
function starRow(rating,fn,id,size){ return window.SeymaHelpers.starRow.apply(null,arguments); }
function miniBars(rows,valKey,unit,col){ return window.SeymaHelpers.miniBars.apply(null,arguments); }
function statTile(label,val,sub){ return window.SeymaHelpers.statTile.apply(null,arguments); }
function spanEnd(){ var end=todayStr(); for(var d in data.days){ if(diffDays(d,end)<0) end=d; } return end; }
function allDays(){ var out=[],s=data.startDate; var n=Math.max(1,diffDays(s,spanEnd())+1); if(n>3000) n=3000; for(var i=0;i<n;i++){ var date=addDays(s,i); out.push({i:i+1,date:date,rec:data.days[date]||null}); } return out; }
function bestStreak(days){ var b=0,c=0; days.forEach(function(d){ if(countRec(d.rec)>=4){c++;b=Math.max(b,c);} else if(isVacationDay(d.date)){ /* seri dondur; sayaç artmaz, kırılmaz */ } else c=0; }); return b; }
function topMood(moods){ var k=null,m=0; for(var x in moods){ if(moods[x]>m){m=moods[x];k=x;} } var o=k?find(MOODS,'id',k):null; return o?o.label:'—'; }
function moodEmoji(id,size){ var o=find(MOODS,'id',id); return o?icon(o.icon,size||22):''; }
function find(arr,key,val){ return window.SeymaHelpers.find.apply(null,arguments); }
function currentStreak(){ var c=0,date=todayStr(); if(countRec(data.days[date])<4&&!isVacationDay(date)) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ if(countRec(data.days[date])>=4){ c++; date=addDays(date,-1); } else if(isVacationDay(date)){ date=addDays(date,-1); } else break; } return c; }
function daysTracked(){ var n=0; for(var d in data.days){ var r=data.days[d]; if(countRec(r)>0||(r&&r.mood)||(r&&r.note)||(r&&r.intention)||(r&&r.meals&&(r.meals.breakfast||r.meals.lunch||r.meals.dinner||r.meals.snack))) n++; } return n; }
function syncConfigured(){ var s=data.settings||{}; return !!(s.ghToken&&s.ghRepo); }
function savedToday(){ return data.lastSyncDate===todayStr(); }
// Header kaydet düğmesi: uygulama her değişikliği önce cihazda korur; bu durum
// uzak repoya henüz kabul edilmediyse kullanıcıya sakin ama net biçimde gösterilir.
// QY-22: Bu dugme artik "Kaydet" degil "Esitle". Neden: veri zaten HER
// degisiklikte cihaza yaziliyor -- "Kaydet" kullaniciya yapmadigi bir is
// vaadediyordu. Gercek eksik olan sey iki yonlu esitlemeydi: uzaktakini
// oku + birlestir + gonder. putLatestGuarded bunu zaten yapiyor, dugme de
// artik onu adiyla cagiriyor. Otosenkron takildiginda kullanicinin paneli
// canli uygulamayla elle esitleyebilecegi tek yer burasi.
function headerSyncSubtitle(){ return window.SeymaAppSurface.headerSyncSubtitle.apply(null,arguments); }
function headerSaveState(){ return window.SeymaAppSurface.headerSaveState.apply(null,arguments); }
function saveButtonHTML(){
  var s=headerSaveState();
  return '<button data-fx="confirm" id="sey-header-save" type="button" class="sey-header-save '+s.cls+'" onclick="App.saveNow()" aria-label="'+esc(s.aria)+'" title="'+esc(s.title)+'" aria-live="polite" aria-busy="'+(s.busy?'true':'false')+'"'+(s.disabled?' disabled':'')+' data-save-state="'+s.cls.slice(3)+'">'
    +icon(s.icon,17,'sey-header-save__icon')+'<span class="sey-header-save__label">'+esc(s.label)+'</span></button>';
}
function updateHeaderSave(){
  var el=document.getElementById('sey-header-save'); if(!el) return;
  var s=headerSaveState();
  el.className='sey-header-save '+s.cls;
  el.setAttribute('aria-label',s.aria); el.setAttribute('title',s.title); el.setAttribute('aria-live','polite'); el.setAttribute('aria-busy',s.busy?'true':'false'); el.setAttribute('data-save-state',s.cls.slice(3));
  el.disabled=!!s.disabled;
  el.innerHTML=icon(s.icon,17,'sey-header-save__icon')+'<span class="sey-header-save__label">'+esc(s.label)+'</span>';
}
// Estetik "Gizle" pill'i; gizlenen kart Bugün'de kaybolur, Ayarlar > "Gizlenen kartlar"dan geri gelir.
function hidePill(which){
  return '<button onclick="event.stopPropagation();App.hideBugunCard(\''+which+'\')" aria-label="Gizle" title="Gizle" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(150,110,120,0.12);color:var(--muted);font-size:var(--f-caption2);font-weight:800;letter-spacing:.2px;padding:6px 12px;border-radius:999px;line-height:1;">Gizle</button>';
}
function saveBanner(){
  if(!syncConfigured()){
    if(data.settings&&data.settings.hideRepoBanner) return '';
    return '<div id="sey-save-banner" class="surface" onclick="App.go(\'ayarlar\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();App.go(\'ayarlar\');}" style="cursor:pointer;border-radius:18px;padding:13px 15px;display:flex;align-items:center;gap:11px;border:1px solid color-mix(in srgb,var(--warn) 48%, var(--card-bd));box-shadow:0 8px 22px rgba(229,72,77,0.10),inset 0 1px 0 rgba(255,255,255,0.3);"><span style="width:34px;height:34px;border-radius:11px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--warn-ink);background:color-mix(in srgb,var(--warn) 14%, var(--icon));">'+icon('link-2',18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">Repoya bağlan</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">Verilerin kaydedilsin diye Ayarlar\'dan bir kez bağlan.</div></div>'+hidePill('repo')+'<span style="font-size:var(--f-title3);color:var(--warn-ink);font-weight:700;line-height:1;">›</span></div>';
  }
  if(ui.saveState==='error') return '<div id="sey-save-banner" style="background:rgba(229,72,77,0.14);border:1px solid rgba(229,72,77,0.45);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:9px;"><span style="color:var(--warn-ink);display:inline-flex;">'+icon('triangle-alert',17)+'</span><span style="font-size:var(--f-footnote);font-weight:600;color:var(--text2);">'+esc(syncFailureText())+'</span></div>'; if(savedToday()) return '<div id="sey-save-banner" style="background:rgba(143,191,138,0.16);border:1px solid rgba(143,191,138,0.4);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:9px;"><span style="color:#3F8A4F;display:inline-flex;">'+icon('circle-check',17)+'</span><span style="font-size:var(--f-footnote);font-weight:600;color:var(--text2);">Bugün repoya kaydedildi. Harika.</span></div>';
  return '<div id="sey-save-banner" style="background:linear-gradient(135deg,#E9899F,#C9B8FF);border-radius:18px;padding:14px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(220,130,150,0.4);"><span style="display:inline-flex;">'+icon('map-pin',20)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:#fff;">Bugünü kaydet</div><div style="font-size:var(--f-caption1);color:rgba(255,255,255,0.92);line-height:1.35;">Günlük kayıt önemli — tek dokunuşla repoya gönder.</div></div><button data-fx="confirm" onclick="App.saveToday()" style="border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#B05070;font-weight:800;font-size:var(--f-footnote);padding:9px 15px;border-radius:12px;flex-shrink:0;">Kaydet</button></div>';
}
function updateSaveBanner(){ var el=document.getElementById('sey-save-banner'); if(el){ var t=document.createElement('div'); t.innerHTML=saveBanner(); if(t.firstChild) el.replaceWith(t.firstChild); } }

// ---- Açılır/kapanır kart altyapısı: gereksiz tam render'lardan kaçınmak için
// yalnızca ilgili kartı yerinde günceller (updateSaveBanner deseni). ----
var CARD_BUILDERS={}; // key -> function(rec){ return html }
CARD_BUILDERS.location=locationCardHTML;
// Akıllı varsayılan: kullanıcı elle dokunmadıysa def'e göre aç/kapa; sonra kullanıcı kontrol eder.
function cardOpen(key, def){ if(ui.cards[key]===undefined) ui.cards[key]=false; return !!ui.cards[key]; }
function updateCardByKey(key){
  var el=document.querySelector('[data-cardkey="'+key+'"]');
  if(!el) return;
  var fn=CARD_BUILDERS[key]; if(!fn) return;
  var rec=data.days[activeDate()]||null;
  var t=document.createElement('div'); t.innerHTML=fn(rec);
  if(t.firstChild) el.replaceWith(t.firstChild);
}
// Ortak açılır/kapanır kart kabuğu (hava/terapi kartı deseni).
// title/subtitle/badge/body HTML olarak gelir; dinamik metni çağıran esc'ler.
function collapsibleCardHTML(o){ return window.SeymaHelpers.collapsibleCardHTML.apply(null,arguments); }
// Sağlık bölümü başlığında glance-edilen metrik rozeti (iOS-27: kapalıyken bile değer görünür).
function hBadge(txt,col){ col=col||'var(--muted)'; return '<span style="font-size:var(--f-caption2);font-weight:800;color:'+col+';background:color-mix(in srgb,'+col+' 13%, var(--card));border:1px solid color-mix(in srgb,'+col+' 28%, var(--card-bd));border-radius:999px;padding:3px 9px;white-space:nowrap;">'+txt+'</span>'; }
// ---- geçmiş gün düzenleme: tarih etiketi + kalıcı uyarı şeridi ----
function dateLabelTR(s){ return window.SeymaDateUtils.dateLabelTR.apply(null,arguments); }
function editBanner(){
  var d=ui.editDate; if(!d) return '';
  var idx=dayIndexFor(d);
  return '<div style="position:sticky;top:0;z-index:60;background:linear-gradient(135deg,#F6A93B,#EC6A5B);border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(236,120,80,0.4);">'
    +'<span style="line-height:1;display:inline-flex;">'+icon('calendar',20)+'</span>'
    +'<div style="flex:1;min-width:0;color:#fff;"><div style="font-size:var(--f-subhead);font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(idx>=1?'Gün '+idx+' · ':'')+esc(dateLabelTR(d))+'</div><div style="font-size:var(--f-caption1);line-height:1.35;opacity:0.95;">Geçmiş günü düzenliyorsun — girdiğin veriler bu güne yazılır.</div></div>'
    +'<button onclick="App.exitEdit()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#C24A2E;font-weight:800;font-size:var(--f-footnote);padding:9px 13px;border-radius:12px;white-space:nowrap;display:flex;align-items:center;gap:5px;">Bugüne dön '+icon('sun',13)+'</button>'
    +'</div>';
}
window.SeyOnSyncState=function(receipt){
  if(!data) return;
  data.syncReceipt=normalizeSyncReceipt(receipt);
  var st=data.syncReceipt.status;
  if((st==='saving'||st==='queued'||st==='retrying')&&(ui.saveState==='dirty'||ui.saveState==='saving'||ui.saveState==='error')) ui.saveState=ui.saveActionPending?'saving':'dirty';
  else if((st==='error'||st==='offline'||st==='permission'||st==='conflict'||st==='anti_clobber')&&(ui.saveState==='dirty'||ui.saveState==='saving'||ui.saveState==='error')) ui.saveState='error';
  mergePersistedReminderState(new Date().toISOString());
  try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){}
  updateSaveBanner(); updateHeaderSave(); if(ui.reminderCenterOpen) render();
};
window.SeyOnSynced=function(receipt){
  if(!data) return;
  data.lastSyncDate=todayStr();
  data.syncReceipt=normalizeSyncReceipt(receipt||data.syncReceipt);
  data.syncReceipt.status='accepted'; data.syncReceipt.lastErrorCode=null;
  if(data&&Array.isArray(data.notifications)) data.notifications.forEach(function(n){ if(n) n.synced=true; });
  if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(x){ if(x&&x.answer) x.answerSynced=true; });
  ui.keyEdit=false;
  // QY-22: elle eşitleme başarıya ulaştığında kullanıcı bunu GÖRSÜN; eskiden
  // durum sessizce 'clean'e dönüyor, dokunuşun bir şey yaptığı belli olmuyordu.
  if(ui.saveActionPending){
    ui.saveState='synced'; ui.saveActionPending=false;
    try{ clearTimeout(ui.syncedDecayTimer); ui.syncedDecayTimer=setTimeout(function(){ if(ui.saveState==='synced'){ ui.saveState='clean'; updateHeaderSave(); } },2600); }catch(e){}
    if(window.SeyAudio&&typeof window.SeyAudio.bell==='function'){ try{ window.SeyAudio.bell(); }catch(e){} }
    try{ toast('Panel ile eşitlendi'); }catch(e){}
  }
  else if(ui.saveState==='saving') ui.saveState='dirty';
  mergePersistedReminderState(new Date().toISOString());
  try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){}
  updateHeaderSave();
  updateSaveBanner(); if(ui.tab==='ayarlar') render();
};
function save(touchSource,eventSpec){ return window.SeymaSave.save.apply(null,arguments); }
function reminderSyncPayload(){ return SEYMA_REMINDERS.reminderSyncPayload.apply(null,arguments); }
// REM-53 — reminder privacy schema registry.
//
// Five surfaces carry reminder information and they are deliberately NOT the
// same schema. A field that is fine on one is a leak on another, so each one
// declares its own storage class, sync class and field rule:
//
//   localOnlyKey       device-local journals; never in `data`, never synced
//   canonicalPreference user choices in `data.reminders`; local canonical,
//                      additive (REM-45 preserves unknown fields) and for that
//                      exact reason removed from every sync payload
//   safeEventSummary   the only reminder trace that DOES sync: a fixed summary
//                      string plus a hashed correlation id, no identity
//   projectionSummary  aggregate counts for the observer / export surface
//   nativeCopy         what leaves the device to the OS notification centre
var REMINDER_PRIVACY_FORBIDDEN_FIELDS=[
  'privateDetail','privateLabel','privateBody','rawBody','body','detail','note','notes','userNote',
  'therapyNote','therapyDetail','medicationName','dose','doseText','mood','moodNote','journal',
  'journalEntry','prayerCompletion','completedPrayers','ghToken','openaiKey','syncUrl','auth','token',
  'lat','lng','coords','gps','location','locationHistory','nativeTitle','nativeBody'
];
var REMINDER_PRIVACY_SCHEMAS={
  schemaVersion:1,
  localOnlyKey:{
    id:'localOnlyKey',
    storage:'localStorage:seyma-reminder-delivery-v1 | seyma-reminder-actions-v1 | seyma-reminder-permission-v1',
    synced:false,
    inCanonicalData:false,
    fieldRule:'allowlist',
    allowedFields:['schemaVersion','generation','clearBoundaryAt','updatedAt','entries','tombstones','state','everGranted','occurrenceId','parentOccurrenceId','reminderId','channel','status','reason','action','actionId','option','timezone','recordedAt','actedAt','createdAt','scheduledAt','shownAt','openedAt','snoozedUntil','terminalAt'],
    forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
  },
  canonicalPreference:{
    id:'canonicalPreference',
    storage:'localStorage:seyma-reset-v1 -> data.reminders',
    synced:false,
    inCanonicalData:true,
    fieldRule:'additive-local-only',
    blockedSyncRoots:Object.keys(REMINDER_SYNC_BLOCKED_ROOTS).sort(),
    forbiddenFields:[]
  },
  safeEventSummary:{
    id:'safeEventSummary',
    storage:'data.eventLog',
    synced:true,
    inCanonicalData:true,
    fieldRule:'fixed-summary',
    allowedFields:['section','path','operation','summary','correlationId','privacyClass'],
    fixedSummary:REMINDER_EVENT_SUMMARY,
    correlationPrefix:'reminder-v1:',
    forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
  },
  projectionSummary:{
    id:'projectionSummary',
    storage:'derived: reminderRetentionSummary / observer projection',
    synced:false,
    inCanonicalData:false,
    fieldRule:'aggregate-only',
    forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
  },
  nativeCopy:{
    id:'nativeCopy',
    storage:'OS notification centre',
    synced:false,
    inCanonicalData:false,
    fieldRule:'allowlist',
    allowedFields:['title','body','tag','deepLink'],
    source:'catalog-private-copy',
    forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
  }
};
function reminderPrivacySchemas(){ return SEYMA_REMINDERS.reminderPrivacySchemas.apply(null,arguments); }
// Reports rather than throws: the caller (fixture or UI) decides what a
// violation means. `samples` are synthetic private strings that must not
// appear anywhere in the serialized value.
function reminderPrivacyReport(){ return SEYMA_REMINDERS.reminderPrivacyReport.apply(null,arguments); }
function commit(msg,meta){ save(undefined,{message:msg,meta:meta}); render(); if(msg) toast(msg); }
// Haptik geri bildirim (destekleyen cihazlarda); Ayarlar'dan kapatılabilir
function haptic(p){ return window.SeymaHelpers.haptic.apply(null,arguments); }

function interp(sweet,walk,evening){
  if(sweet>=5) return 'Tatlı kontrolünde ritim oluşuyor. Kavga değil, yönetim.';
  if(evening>=5) return 'Akşam atıştırması azaldıkça sabah daha hafif başlar.';
  if(walk>=4) return 'Yürüyüş günleri artmış. Bu Şeyma hanımın lehine delildir.';
  if(sweet+walk+evening>=3) return 'Zor günler var ama sistem devam ediyor. Olay bu.';
  return 'Bir haftada birkaç küçük hamle bile gayet iş yapar.';
}
function weekBlock(w,days){
  var slice=days.slice(w*7,w*7+7);
  var defs=[['sweetManaged','Tatlı kontrolü'],['eveningControl','Akşam kontrolü'],['walked20','Yürüyüş'],['protein','Protein'],['water','Su'],['vitaminD','D₃K₂ damla'],['sleepReg','Uyku düzeni'],['journaled','Günlük notu'],['freshAir','Açık hava'],['selfKind','Kendime iyi davrandım']];
  var cnt=function(k){ return slice.reduce(function(a,o){return a+(o.rec&&o.rec.habits[k]?1:0);},0); };
  var rows=defs.map(function(d){ return {label:d[1],val:cnt(d[0])+'/7'}; });
  var totalC=slice.reduce(function(a,o){return a+countRec(o.rec);},0);
  var moods={}; slice.forEach(function(o){ if(o.rec&&o.rec.mood) moods[o.rec.mood]=(moods[o.rec.mood]||0)+1; });
  return {title:'Gün '+(w*7+1)+'-'+(w*7+7),rows:rows,avg:(totalC/7).toFixed(1)+'/'+htToday(),best:bestStreak(slice)+' gün',mood:topMood(moods),interp:interp(cnt('sweetManaged'),cnt('walked20'),cnt('eveningControl'))};
}

// ---------- toast & confetti ----------
function toast(msg,ms){ return window.SeymaHelpers.toast.apply(null,arguments); }
function confetti(){ return window.SeymaHelpers.confetti.apply(null,arguments); }

// ---------- actions (exposed) ----------
var App={};
// MON-50: daily mood/habit handler gövdeleri appSurface registry'sindedir.
// App nesnesi, data rebind'leri, save/render sırası ve mevcut inline caller
// yüzeyi app.js'te kalır; bag yalnız canlı app-owned resolverları verir.
var SEYMA_APP_SURFACE=window.SeymaAppSurface||{};
if(!window.SeymaAppSurface||typeof window.SeymaAppSurface.registerAppSurface!=='function'||!window.SeymaAppSurface.registerAppSurface({
  data:function(){ return data; },
  ui:function(){ return ui; },
  app:function(){ return App; },
  activeDate:activeDate,
  todayStr:todayStr,
  dayIndexFor:dayIndexFor,
  getDay:getDay,
  derivedHabits:function(){ return DERIVED_HABITS; },
  countRec:countRec,
  habits:function(){ return HABITS; },
  find:find,
  haptic:haptic,
  commit:commit,
  editing:editing,
  htToday:htToday,
  confetti:confetti,
  habitProgress:habitProgress,
  waterGoalCups:waterGoalCups,
  sleepGoalHours:sleepGoalHours,
  stepsGoal:stepsGoal,
  effSteps:effSteps,
  isVacationDay:isVacationDay,
  derivedProgText:derivedProgText,
  maybeStreak:maybeStreak,
  toast:toast,
  updateCardByKey:updateCardByKey,
  render:render,
  emptyMagnesium:emptyMagnesium,
  pulseTimer:function(){ return pulseTimer; },
  setPulseTimer:function(value){ pulseTimer=value; },
  clearTimeout:clearTimeout,
  setTimeout:setTimeout,
  document:function(){ return document; },
  save:save
})) throw new Error('MON-50: SeymaAppSurface registry kurulamadı');
// MON2-07: alan yüzey bag'i (aeon/location/header/weather/photo/habit/hero/luna).
// Her üye bir DEĞER ÜRETİCİDİR (MON2-06 deseni): FIELD_SCOPE getter'ı üyeyi
// çağırıp sonucu değer olarak kullanır. Taşınan gövdeler DOM'a çıplak global
// yerine 'doc' takma adıyla erişir (K4).
if(!window.SeymaAppSurface||typeof window.SeymaAppSurface.registerFieldSurface!=='function'||!window.SeymaAppSurface.registerFieldSurface({
  App:function(){ return App; },
  HDR_PHASE_TR:function(){ return HDR_PHASE_TR; },
  MEALS:function(){ return MEALS; },
  MOODS:function(){ return MOODS; },
  activeDate:function(){ return activeDate; },
  addDays:function(){ return addDays; },
  aeonAudioEls:function(){ return aeonAudioEls; },
  aeonEnsureMediaLoaded:function(){ return aeonEnsureMediaLoaded; },
  aeonLoadVisibleMedia:function(){ return aeonLoadVisibleMedia; },
  aeonMediaCache:function(){ return aeonMediaCache; },
  aeonPaintFileCard:function(){ return aeonPaintFileCard; },
  aeonPaintVoicePlayer:function(){ return aeonPaintVoicePlayer; },
  aeonPickAudioMime:function(){ return aeonPickAudioMime; },
  aeonRec:function(){ return aeonRec; },
  aeonRecPaintBars:function(){ return aeonRecPaintBars; },
  aeonRecSample:function(){ return aeonRecSample; },
  aeonRecTimeStr:function(){ return aeonRecTimeStr; },
  aeonTextById:function(){ return aeonTextById; },
  caffeineDrinks:function(){ return caffeineDrinks; },
  caffeineLastTime:function(){ return caffeineLastTime; },
  caffeineLimit:function(){ return caffeineLimit; },
  caffeineTimingOk:function(){ return caffeineTimingOk; },
  caffeineTotalMg:function(){ return caffeineTotalMg; },
  calGoal:function(){ return calGoal; },
  countRec:function(){ return countRec; },
  createDefaultData:function(){ return createDefaultData; },
  currentStreak:function(){ return currentStreak; },
  dayNutrition:function(){ return dayNutrition; },
  effSteps:function(){ return effSteps; },
  el:function(){ return el; },
  esc:function(){ return esc; },
  find:function(){ return find; },
  habitCountOn:function(){ return habitCountOn; },
  habitProgress:function(){ return habitProgress; },
  hasAnyHubEntry:function(){ return hasAnyHubEntry; },
  headerActionHTML:function(){ return headerActionHTML; },
  headerSaveState:function(){ return headerSaveState; },
  headerSceneHTML:function(){ return headerSceneHTML; },
  headerSkyClass:function(){ return headerSkyClass; },
  headerSkyClassNow:function(){ return headerSkyClassNow; },
  headerSolarProgress:function(){ return headerSolarProgress; },
  headerSyncSubtitle:function(){ return headerSyncSubtitle; },
  heroScienceLine:function(){ return heroScienceLine; },
  heroStatTile:function(){ return heroStatTile; },
  htToday:function(){ return htToday; },
  humanFileSize:function(){ return humanFileSize; },
  icon:function(){ return icon; },
  isIOS:function(){ return isIOS; },
  isStandalonePWA:function(){ return isStandalonePWA; },
  isVacationDay:function(){ return isVacationDay; },
  locationGateErrorText:function(){ return locationGateErrorText; },
  locationGateFailure:function(){ return locationGateFailure; },
  locationGatePermanentFailure:function(){ return locationGatePermanentFailure; },
  locationGateResetNudge:function(){ return locationGateResetNudge; },
  lunaContext:function(){ return lunaContext; },
  lunaDayLine:function(){ return lunaDayLine; },
  medFreeStreak:function(){ return medFreeStreak; },
  onLocationFix:function(){ return onLocationFix; },
  proteinGoal:function(){ return proteinGoal; },
  psychSummaryLines:function(){ return psychSummaryLines; },
  render:function(){ return render; },
  save:function(){ return save; },
  sleepGoalHours:function(){ return sleepGoalHours; },
  stepsGoal:function(){ return stepsGoal; },
  stopLocationWatch:function(){ return stopLocationWatch; },
  todayStr:function(){ return todayStr; },
  waterGoalCups:function(){ return waterGoalCups; },
  wxHm:function(){ return wxHm; },
  wxMeta:function(){ return wxMeta; },
  doc:function(){ return document; }
})) throw new Error('MON2-07: SeymaAppSurface alan yüzey kaydı kurulamadı');
// MON2-01: reminder yüzey registry bag'i. MON2-03 gövde taşırken bu bag'i
// genişletir; mutable reminder değişkenleri (K3) app.js'te kalır ve get/set
// çifti olarak verilir. Registry yoksa fail-closed.
var SEYMA_REMINDER_SURFACE=window.SeymaReminderSurface||{};
if(!window.SeymaReminderSurface||typeof window.SeymaReminderSurface.registerReminderSurface!=='function'||!window.SeymaReminderSurface.registerReminderSurface({
  App:function(){ return App; },
  appendReminderEvent:function(){ return appendReminderEvent; },
  EVENT_LOG_SCHEMA_VERSION:function(){ return EVENT_LOG_SCHEMA_VERSION; },
  KEY:function(){ return KEY; },
  REMINDER_ACTION_KEY:function(){ return REMINDER_ACTION_KEY; },
  REMINDER_CARE_KEYS:function(){ return REMINDER_CARE_KEYS; },
  REMINDER_CHANNELS:function(){ return REMINDER_CHANNELS; },
  REMINDER_DELIVERY_BLOCKING_STATUSES:function(){ return REMINDER_DELIVERY_BLOCKING_STATUSES; },
  REMINDER_DELIVERY_KEY:function(){ return REMINDER_DELIVERY_KEY; },
  REMINDER_DELIVERY_SCHEMA_VERSION:function(){ return REMINDER_DELIVERY_SCHEMA_VERSION; },
  REMINDER_ENGINE_DEFAULT_TIMEZONE:function(){ return REMINDER_ENGINE_DEFAULT_TIMEZONE; },
  REMINDER_EVENT_ACTIONS:function(){ return REMINDER_EVENT_ACTIONS; },
  REMINDER_EVENT_SUMMARY:function(){ return REMINDER_EVENT_SUMMARY; },
  REMINDER_MEDICATION_LABEL_MAX:function(){ return REMINDER_MEDICATION_LABEL_MAX; },
  REMINDER_MEDICATION_MAX_SCHEDULES:function(){ return REMINDER_MEDICATION_MAX_SCHEDULES; },
  REMINDER_MEDICATION_NAME_MAX:function(){ return REMINDER_MEDICATION_NAME_MAX; },
  REMINDER_MEDICATION_NOTE_MAX:function(){ return REMINDER_MEDICATION_NOTE_MAX; },
  REMINDER_NATIVE_FOREGROUND_SOURCES:function(){ return REMINDER_NATIVE_FOREGROUND_SOURCES; },
  REMINDER_NATIVE_PREVIEW_TAG:function(){ return REMINDER_NATIVE_PREVIEW_TAG; },
  REMINDER_NATIVE_TAG_PREFIX:function(){ return REMINDER_NATIVE_TAG_PREFIX; },
  REMINDER_PERMISSION_ALIASES:function(){ return REMINDER_PERMISSION_ALIASES; },
  REMINDER_PERMISSION_STATES:function(){ return REMINDER_PERMISSION_STATES; },
  REMINDER_PERMISSION_STORAGE_KEY:function(){ return REMINDER_PERMISSION_STORAGE_KEY; },
  REMINDER_PROFILE_IDS:function(){ return REMINDER_PROFILE_IDS; },
  REMINDER_SCHEDULER_BURST_MS:function(){ return REMINDER_SCHEDULER_BURST_MS; },
  REMINDER_SPECIAL_DAYS_ID:function(){ return REMINDER_SPECIAL_DAYS_ID; },
  REMINDER_SPECIAL_DAYS_MODES:function(){ return REMINDER_SPECIAL_DAYS_MODES; },
  SEYMA_REMINDERS:function(){ return SEYMA_REMINDERS; },
  appendEvent:function(){ return appendEvent; },
  data:function(){ return data; },
  emptyReminderPersonalization:function(){ return emptyReminderPersonalization; },
  emptyReminderPolicy:function(){ return emptyReminderPolicy; },
  emptyReminderState:function(){ return emptyReminderState; },
  ensureEventLog:function(){ return ensureEventLog; },
  mergeReminderLocalState:function(){ return mergeReminderLocalState; },
  migrateReminderState:function(){ return migrateReminderState; },
  normalizeReminderCareCategories:function(){ return normalizeReminderCareCategories; },
  normalizeReminderCategories:function(){ return normalizeReminderCategories; },
  normalizeReminderMedication:function(){ return normalizeReminderMedication; },
  normalizeReminderPolicy:function(){ return normalizeReminderPolicy; },
  normalizeReminderPreference:function(){ return normalizeReminderPreference; },
  normalizeReminderProfile:function(){ return normalizeReminderProfile; },
  normalizeReminderSpecialDaySelection:function(){ return normalizeReminderSpecialDaySelection; },
  quranUnlockBodyScroll:function(){ return quranUnlockBodyScroll; },
  reminderActionDefinition:function(){ return reminderActionDefinition; },
  reminderActionFind:function(){ return reminderActionFind; },
  reminderActionLoad:function(){ return reminderActionLoad; },
  reminderActionNormalize:function(){ return reminderActionNormalize; },
  reminderActionNormalizeEntry:function(){ return reminderActionNormalizeEntry; },
  reminderActionOccurrence:function(){ return reminderActionOccurrence; },
  reminderActionSafeToken:function(){ return reminderActionSafeToken; },
  reminderAppClockBoundary:function(){ return reminderAppClockBoundary; },
  reminderCareNativeCategories:function(){ return reminderCareNativeCategories; },
  reminderCategoryIds:function(){ return reminderCategoryIds; },
  reminderCategorySelection:function(){ return reminderCategorySelection; },
  reminderCategoryState:function(){ return reminderCategoryState; },
  reminderCenterClone:function(){ return reminderCenterClone; },
  reminderConfirmAction:function(){ return reminderConfirmAction; },
  reminderCopy:function(){ return reminderCopy; },
  reminderDeepLinkTarget:function(){ return reminderDeepLinkTarget; },
  reminderDefinitions:function(){ return reminderDefinitions; },
  reminderDeliveryLoad:function(){ return reminderDeliveryLoad; },
  reminderDeliveryModule:function(){ return reminderDeliveryModule; },
  reminderDeliveryNormalize:function(){ return reminderDeliveryNormalize; },
  reminderDeliveryNow:function(){ return reminderDeliveryNow; },
  reminderDeliveryReason:function(){ return reminderDeliveryReason; },
  reminderDeliveryTombstones:function(){ return reminderDeliveryTombstones; },
  reminderDigestReflectionOption:function(){ return reminderDigestReflectionOption; },
  reminderEnsurePreference:function(){ return reminderEnsurePreference; },
  reminderEnumHas:function(){ return reminderEnumHas; },
  reminderEveningSurface:function(){ return reminderEveningSurface; },
  reminderEventCorrelation:function(){ return reminderEventCorrelation; },
  reminderLifecycleEvaluate:function(){ return reminderLifecycleEvaluate; },
  reminderLifecycleLiveHTML:function(){ return reminderLifecycleLiveHTML; },
  reminderLifecycleRecordReceipt:function(){ return reminderLifecycleRecordReceipt; },
  reminderLifecycleRenderPolicy:function(){ return reminderLifecycleRenderPolicy; },
  reminderLifecycleState:function(){ return reminderLifecycleState; },
  reminderLifecycleTargetedUpdate:function(){ return reminderLifecycleTargetedUpdate; },
  reminderLifecycleVisibility:function(){ return reminderLifecycleVisibility; },
  reminderLocalClone:function(){ return reminderLocalClone; },
  reminderLocalTouch:function(){ return reminderLocalTouch; },
  reminderMedicationClearHistory:function(){ return reminderMedicationClearHistory; },
  reminderMedicationCurrentList:function(){ return reminderMedicationCurrentList; },
  reminderMedicationDraftFromSchedule:function(){ return reminderMedicationDraftFromSchedule; },
  reminderMedicationDraftState:function(){ return reminderMedicationDraftState; },
  reminderMedicationOccurrence:function(){ return reminderMedicationOccurrence; },
  reminderMedicationScheduleById:function(){ return reminderMedicationScheduleById; },
  reminderMedicationText:function(){ return reminderMedicationText; },
  reminderMergeProfileSuggestions:function(){ return reminderMergeProfileSuggestions; },
  reminderMigrationStatus:function(){ return reminderMigrationStatus; },
  reminderNativeActionList:function(){ return reminderNativeActionList; },
  reminderNativeDeliveryCopy:function(){ return reminderNativeDeliveryCopy; },
  reminderNativePayload:function(){ return reminderNativePayload; },
  reminderNativeSafeCopy:function(){ return reminderNativeSafeCopy; },
  reminderPermissionEverGranted:function(){ return reminderPermissionEverGranted; },
  reminderPermissionGrantObserved:function(){ return reminderPermissionGrantObserved; },
  reminderPermissionRequestInFlight:function(){ return reminderPermissionRequestInFlight; },
  reminderPermissionTransientState:function(){ return reminderPermissionTransientState; },
  reminderPersonalizationSignalRecord:function(){ return reminderPersonalizationSignalRecord; },
  reminderPersonalizationSuggestions:function(){ return reminderPersonalizationSuggestions; },
  reminderRenderAction:function(){ return reminderRenderAction; },
  reminderSchedulerFallbackCreate:function(){ return reminderSchedulerFallbackCreate; },
  reminderSchedulerInstance:function(){ return reminderSchedulerInstance; },
  reminderSchemaStatusForData:function(){ return reminderSchemaStatusForData; },
  reminderServiceWorkerClickPayload:function(){ return reminderServiceWorkerClickPayload; },
  reminderSnoozePlan:function(){ return reminderSnoozePlan; },
  reminderSpecialDayOptionById:function(){ return reminderSpecialDayOptionById; },
  reminderSpecialDaysCommit:function(){ return reminderSpecialDaysCommit; },
  reminderSpecialDaysState:function(){ return reminderSpecialDaysState; },
  reminderTherapyToolFromValue:function(){ return reminderTherapyToolFromValue; },
  render:function(){ return render; },
  save:function(){ return save; },
  saveLocal:function(){ return saveLocal; },
  toast:function(){ return toast; },
  todayStr:function(){ return todayStr; },
  ui:function(){ return ui; },
  validReminderTime:function(){ return validReminderTime; },
  zikrUnlockBodyScroll:function(){ return zikrUnlockBodyScroll; },
  setPermissionTransient:function(){ return setPermissionTransient; },
  setPermissionInFlight:function(){ return setPermissionInFlight; },
  setPermissionEverGranted:function(){ return setPermissionEverGranted; },
  setPermissionGrantObserved:function(){ return setPermissionGrantObserved; },
  setSchedulerInstance:function(){ return setSchedulerInstance; }
})) throw new Error('MON2-01: SeymaReminderSurface registry kurulamadı');
function setPermissionTransient(v){ reminderPermissionTransientState=v; }
function setPermissionInFlight(v){ reminderPermissionRequestInFlight=v; }
function setPermissionEverGranted(v){ reminderPermissionEverGranted=v; }
function setPermissionGrantObserved(v){ reminderPermissionGrantObserved=v; }
function setSchedulerInstance(v){ reminderSchedulerInstance=v; }
// MON-54: boot/start/late-boot dependency bag. The data rebinds stay in this
// app.js owner; SeymaAppSurface receives only an explicit callback to perform
// the existing assignment at the same point in each path.
function ensureStartData(){ if(!data) data=migrate(createDefaultData()); return data; }
function ensureAuthData(){ if(!data) data=migrate(createDefaultData()); return data; }
var MON54_BOOT_DEPS={
  data:function(){ return data; },
  ui:function(){ return ui; },
  ensureStartData:ensureStartData,
  ensureAuthData:ensureAuthData,
  motivation:function(){ return window.MotivationProgramV2; },
  featuresLive:featuresLive,
  commit:commit,
  reminderSchedulerDispatch:reminderSchedulerDispatch,
  audio:function(){ return window.SeyAudio; },
  save:save,
  render:render,
  document:function(){ return document; },
  touch:function(){ return window.SeyTouch; },
  setTimeout:setTimeout,
  matchMedia:function(){ return window.matchMedia; },
  addDays:addDays,
  todayStr:todayStr,
  replayAnswerPopup:replayAnswerPopup,
  maybeVoiceGreeting:maybeVoiceGreeting,
  sha256:sha256,
  authHash:function(){ return AUTH_HASH; },
  toast:toast
};
if(!SEYMA_APP_SURFACE||typeof SEYMA_APP_SURFACE.registerBootCallbacks!=='function'||!SEYMA_APP_SURFACE.registerBootCallbacks(MON54_BOOT_DEPS)) throw new Error('MON-54: boot registry kurulamadı');
App.eventLog={schemaVersion:EVENT_LOG_SCHEMA_VERSION,ensure:ensureEventLog,normalize:normalizeEventEntry,classify:classifyEvent,append:appendEvent,appendReminder:appendReminderEvent};
App.reminderEventContract=function(){ return SEYMA_REMINDER_SURFACE.reminderEventContract.apply(null,arguments); };
App.reminderEventState=function(){ return SEYMA_REMINDER_SURFACE.reminderEventState.apply(null,arguments); };
// ── Profil Değerlendirmesi: puanlama motoru — doğrudan test için erişilebilir kılındı
// (Faz 07). Bunlar UI handler'ı DEĞİL, saf hesaplama fonksiyonları; app.js yalnızca
// window.App'i dışa açtığı için headless testlerin bunlara ulaşabilmesinin tek yolu bu.
App.scoreProfileItem=scoreProfileItem;
App.scoreProfileFacet=scoreProfileFacet;
App.scoreProfileConstruct=scoreProfileConstruct;
App.scoreRiasec=scoreRiasec;
App.scoreValues=scoreValues;
App.scoreAttachment=scoreAttachment;
App.scoreProfileAssessment=scoreProfileAssessment;
App.scoreProfileAssessmentQuality=scoreProfileAssessmentQuality;
App.profileAssessmentQualityCategory=profileAssessmentQualityCategory;
App.PROFILE_QUALITY_WEIGHTS=PROFILE_QUALITY_WEIGHTS;
App.buildProfileReport=buildProfileReport;
App.profileBand=profileBand;
App.profileAssessmentContradictionNotes=profileAssessmentContradictionNotes;
App.profileItemKeydown=function(e){ return window.SeymaProfile.profileItemKeydown.apply(null,arguments); };
App.profilePrevious=function(){ return window.SeymaProfile.profilePrevious.apply(null,arguments); };
App.dismissProfileCompletion=function(){ return window.SeymaProfile.dismissProfileCompletion.apply(null,arguments); };
App.profileBreakContinue=function(){ return window.SeymaProfile.profileBreakContinue.apply(null,arguments); };
App.profileAssessmentSOS=function(){ return window.SeymaProfile.profileAssessmentSOS.apply(null,arguments); };
App.profileAssessmentSOSClose=function(){ return window.SeymaProfile.profileAssessmentSOSClose.apply(null,arguments); };
App.profileAssessmentReachCreator=function(){ return window.SeymaProfile.profileAssessmentReachCreator.apply(null,arguments); };
App.profileAnswer=function(itemId,value){ return window.SeymaProfile.profileAnswer.apply(null,arguments); };

function createDefaultData(){ return window.SeymaState.createDefaultData.apply(null,arguments); }
App.start=function(){ return SEYMA_APP_SURFACE.start.apply(null,arguments); };
App.go=function(id,event){
  var tabChanged = ui.tab !== id;
  function commitGo(){
    // İY-B: İlham & İbadet hub'ına her GERÇEK girişte (başka sekmeden gelince —
    // aynı sekmedeyken tetiklenen alakasız re-render'larda DEĞİL) Kur'an
    // Yolculuğu kartının âyet vitrini bir sonrakine geçer.
    if(id==='saygi'&&ui.tab!=='saygi'&&typeof quranAdvanceVerseIndex==='function') quranAdvanceVerseIndex();
    if(id==='mesaj'&&ui.tab!=='mesaj') ui.aeonScrollBottom=true;
    ui.tab=id; render();
    var sc=document.querySelector('[data-scroll]'); if(sc&&id!=='mesaj') sc.scrollTop=0;
    tryLocNudge('tab');
    if(tabChanged && window.SeyFx && typeof window.SeyFx.enter==='function'){
      // TAM-DENETIM B-07: `.card` ve `.bento` seçicileri ÖLÜ — bu sınıflar
      // hiçbir sekmede üretilmiyor (7/7 sekmede ölçüm 0). Yalnız `.surface`
      // eşleşiyordu. Kademeli giriş zaten burada `animationDelay = i*40ms` ile
      // uygulanıyor (yani ana sekmelerde stagger EFEKTİ var, `.sey-stagger`
      // SINIFI yok — denetimdeki 0 ölçümü sınıfı sayıyordu, efekti değil).
      // Header sahnesi de sıraya katıldı: gökyüzü şeridi kartlarla birlikte gelir.
      // PREM-03: kademeli giriş artık tek sistemde — .sey-stagger + --i.
      // (Eskiden SeyFx.enter inline animationDelay yazıyordu; efekt aynıydı
      //  ama iki ayrı hareket sistemi vardı.)
      try{
        var _sf = document.querySelectorAll('#app .sey-hdr-scene, #app .surface');
        for(var _i=0; _i<_sf.length; _i++){
          _sf[_i].style.setProperty('--i', String(Math.min(_i, 8)));
          _sf[_i].classList.add('sey-stagger');
        }
      }catch(e){}
      window.SeyFx.enter('#app .sey-hdr-scene, #app .surface', 40);
    }
  }
  var appEl=document.getElementById('app');
  var animOk=tabChanged && appEl && window.SeyFx
    && typeof window.SeyFx.isPremiumFxEnabled==='function'
    && window.SeyFx.isPremiumFxEnabled();
  if(!animOk){ commitGo(); return; }

  // FX2-15: #app innerHTML ile yıkılmadan önce çıkış oynar. Hızlı bir ikinci
  // sekme isteği gelirse yalnız en son hedef commit edilir.
  if(App._goTimer!=null){
    clearTimeout(App._goTimer); App._goTimer=null;
    try{ appEl.classList.remove('sey-leaving'); }catch(e){}
  }
  var done=false, timer=null;
  function finish(){
    // Eski transitionend işleyicisi hızlı ikinci istekte DOM'da kısa süre
    // kalabilir; yalnız kendi güncel timer'ı olan istek commit edebilir.
    if(done || App._goTimer!==timer) return; done=true;
    clearTimeout(timer); App._goTimer=null;
    appEl.removeEventListener('transitionend',finish);
    commitGo();
    var el=document.getElementById('app');
    if(el){
      el.classList.remove('sey-leaving');
      el.classList.add('sey-entering');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        el.classList.remove('sey-entering');
      }); });
    }
  }
  appEl.classList.add('sey-leaving');
  appEl.addEventListener('transitionend',finish,{once:true});
  timer=setTimeout(finish,200);
  App._goTimer=timer;
};

// ── REM-05 Reminder Center: yalnız ephemeral shell durumu ──
// Bu yüzey preference, delivery logu, data.notifications veya native kanala
// yazmaz. Katalog yoksa/boşsa merkez yine güvenli bir empty state gösterebilir.
function reminderDefinitions(){ return SEYMA_REMINDERS.reminderDefinitions.apply(null,arguments); }
function reminderCopy(){ return SEYMA_REMINDERS.reminderCopy.apply(null,arguments); }
REMINDER_MEDICATION_NATIVE_TITLE=reminderCopy('native.medication.title','Bir küçük hatırlatman hazır');
REMINDER_MEDICATION_NATIVE_BODY=reminderCopy('native.medication.body','Seçtiğin saati kontrol etmek için Şeyma’yı açabilirsin.');
REMINDER_MEDICATION_SAFETY_COPY=reminderCopy('inApp.medication.safety','Bu özellik yalnızca senin girdiğin zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez.');
REMINDER_SPECIAL_NATIVE_TITLE=reminderCopy('native.generic.title','Şeyma’da küçük bir durak hazır');
REMINDER_SPECIAL_NATIVE_BODY=reminderCopy('native.generic.body','İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin.');
REMINDER_NATIVE_ACTIONS.open.title=reminderCopy('inApp.actions.open','Aç');
REMINDER_NATIVE_ACTIONS.snooze.title=reminderCopy('inApp.snooze.native10m','10 dk ertele');
REMINDER_NATIVE_ACTIONS.todayOff.title=reminderCopy('inApp.mute.today','Bugün sustur');
function reminderCenterHistoryHTML(){ return SEYMA_REMINDERS.reminderCenterHistoryHTML.apply(null,arguments); }
function reminderCenterRetentionHTML(){ return SEYMA_REMINDERS.reminderCenterRetentionHTML.apply(null,arguments); }
function reminderPersonalizationHTML(){ return SEYMA_REMINDERS.reminderPersonalizationHTML.apply(null,arguments); }
function reminderCenterPolicyHTML(){ return SEYMA_REMINDERS.reminderCenterPolicyHTML.apply(null,arguments); }
function reminderCenterNoticeHTML(){ return SEYMA_REMINDERS.reminderCenterNoticeHTML.apply(null,arguments); }
function reminderDigestLauncherHTML(){ return SEYMA_REMINDERS.reminderDigestLauncherHTML.apply(null,arguments); }
function reminderDigestHTML(){ return SEYMA_REMINDERS.reminderDigestHTML.apply(null,arguments); }
function reminderTestPreviewHTML(){ return SEYMA_REMINDERS.reminderTestPreviewHTML.apply(null,arguments); }
function reminderPermissionExplanationHTML(){ return SEYMA_REMINDERS.reminderPermissionExplanationHTML.apply(null,arguments); }
function reminderProfileSectionHTML(){ return SEYMA_REMINDERS.reminderProfileSectionHTML.apply(null,arguments); }
function reminderCategoryControlsHTML(){ return SEYMA_REMINDERS.reminderCategoryControlsHTML.apply(null,arguments); }
function reminderSpecialDaysSectionHTML(){ return SEYMA_REMINDERS.reminderSpecialDaysSectionHTML.apply(null,arguments); }
function reminderCareControlsHTML(){ return SEYMA_REMINDERS.reminderCareControlsHTML.apply(null,arguments); }
function reminderMedicationDraftState(){ return SEYMA_REMINDERS.reminderMedicationDraftState.apply(null,arguments); }
function reminderMedicationSectionHTML(){ return SEYMA_REMINDERS.reminderMedicationSectionHTML.apply(null,arguments); }

// ── REM-12 In-app reminder inbox ─────────────────────────────────────────
// This is a view-only projection. It reads the reminder catalog, the injected
// occurrence/context and the device-local delivery journal, but never writes
// data, data.notifications or reminder delivery state while rendering.
var REMINDER_INBOX_HIDDEN_STATUSES={opened:true,snoozed:true,dismissed:true};
var REMINDER_INBOX_REASON_LABELS={
  'quiet-hours':'Sessiz saatlere göre daha sakin tutuldu',
  'daily-budget':'Bugünün kapasitesi dolu; burada daha az gösteriliyor',
  'category-cooldown':'Aynı alandan kısa süre önce bir durak gösterildi',
  'permission-denied':'Native izin kapalı; uygulama içi kart korunuyor',
  'not-visible':'Uygulama görünür olduğunda yeniden bakılacak',
  'today-muted':'Bugün için sessize alındı',
  'stale-data':'Güvenilir veri bekleniyor; kart sakin tutuldu',
  'already-completed':'Bugün için tamamlandı',
  'catchup-grouped':'Geçmiş duraklar tek bir genel özette tutuldu',
  'catchup-expired':'Geçmiş duraklar yeniden kuyruğa alınmadı',
  'capacity':'Bugünün modu daha az durak gösteriyor',
  'disabled':'Bu durak kapalı',
  'invalid':'Durak ayrıntısı hazır değil',
  'unknown':'Bugün için daha sakin tutuldu'
};
function reminderPrayerPrivateCopy(){ return SEYMA_REMINDERS.reminderPrayerPrivateCopy.apply(null,arguments); }
function reminderInboxBuildItems(){ return SEYMA_REMINDERS.reminderInboxBuildItems.apply(null,arguments); }
var REMINDER_ACTION_SCHEMA_VERSION=1;
var REMINDER_ACTION_KEY='seyma-reminder-actions-v1';
var REMINDER_ACTION_MAX_AGE_MS=REMINDER_RETENTION_POLICY.notificationHistory.maxAgeDays*24*60*60*1000;
var REMINDER_ACTION_MAX_ENTRIES=REMINDER_RETENTION_POLICY.notificationHistory.maxEntries;
var REMINDER_ACTIONS={snooze:true,todayOff:true,disable:true,enable:true,open:true};
var REMINDER_ACTION_STATUSES={scheduled:true,suppressed:true,disabled:true,enabled:true,completed:true,reverted:true};
var REMINDER_ACTION_OPTION_LABELS={'10m':reminderCopy('inApp.snooze.10m','10 dakika'),'30m':reminderCopy('inApp.snooze.30m','30 dakika'),'1h':reminderCopy('inApp.snooze.1h','1 saat'),thisEvening:reminderCopy('inApp.snooze.thisEvening','Bu akşam'),tomorrow:reminderCopy('inApp.snooze.tomorrow','Yarın'),todayOff:reminderCopy('inApp.snooze.todayOff','Bugün bir daha gösterme')};
// REM-51 — App surface adapter sozlesmesi. Her reminder hedefi icin: hangi tab/
// overlay, hangi GERCEK App handler'i, hangi ozellik durumu gerekli ve geri
// donusun nereye gittigi TEK yerde yazilidir. Onceki surumde yalniz
// targetId/kind/handler vardi; requiredState ve backPath belge disindaydi.
var REMINDER_DEEP_LINK_TARGETS={
  faith:{targetId:'faith',kind:'overlay',handler:'openFaithCorner',requiredState:'prayer-data',backPath:'bugun'},
  zikr:{targetId:'zikr',kind:'overlay',handler:'openZikr',requiredState:'zikr-session',backPath:'bugun'},
  room:{targetId:'room',kind:'overlay',handler:'openRoom',requiredState:'therapy-tool',backPath:'bugun'},
  saygi:{targetId:'saygi',kind:'tab',handler:'go',requiredState:'saygi-content',backPath:'bugun'},
  reading:{targetId:'reading',kind:'overlay',handler:'openReading',requiredState:'reading-library',backPath:'bugun'},
  gunluk:{targetId:'gunluk',kind:'overlay',handler:'openJournalModal',requiredState:'none',backPath:'bugun'},
  health:{targetId:'saglik',kind:'tab',handler:'go',requiredState:'care-config',backPath:'bugun'},
  settings:{targetId:'ayarlar',kind:'tab',handler:'go',requiredState:'none',backPath:'bugun'}
};
// REM-51 gorev 2 — ozellik durumlari AYRI gosterilir, yol kapatilmaz.
// Ayrim kasitlidir: "vakit verisi eski" kullaniciyi Vakit kosesinden men etmez,
// ama uygulama taze veri varmis gibi de davranmaz. Yalniz bilinmeyen hedef /
// handler / feature flag fail-closed'dir (gorev 5).
var REMINDER_SURFACE_STATES={ready:1,degraded:1,unavailable:1};
function reminderSurfaceState(){ return SEYMA_REMINDERS.reminderSurfaceState.apply(null,arguments); }
// Gorev 1 — insan ve test tarafindan okunabilir tek tablo.
function reminderSurfaceTable(){ return SEYMA_REMINDERS.reminderSurfaceTable.apply(null,arguments); }
function reminderActionSafeToken(){ return SEYMA_REMINDERS.reminderActionSafeToken.apply(null,arguments); }
function reminderActionNormalizeEntry(){ return SEYMA_REMINDERS.reminderActionNormalizeEntry.apply(null,arguments); }
function reminderActionNormalize(){ return SEYMA_REMINDERS.reminderActionNormalize.apply(null,arguments); }
function reminderActionStorageRead(){ return SEYMA_REMINDER_SURFACE.reminderActionStorageRead.apply(null,arguments); }
function reminderActionStorageWrite(){ return SEYMA_REMINDER_SURFACE.reminderActionStorageWrite.apply(null,arguments); }
function reminderActionLoad(){ return SEYMA_REMINDERS.reminderActionLoad.apply(null,arguments); }
function reminderActionCommit(){ return SEYMA_REMINDER_SURFACE.reminderActionCommit.apply(null,arguments); }
function reminderRetentionSummary(){ return SEYMA_REMINDERS.reminderRetentionSummary.apply(null,arguments); }
function reminderExportSummary(){ return SEYMA_REMINDERS.reminderExportSummary.apply(null,arguments); }
function reminderActionDefinition(){ return SEYMA_REMINDERS.reminderActionDefinition.apply(null,arguments); }
function reminderSnoozePlan(){ return SEYMA_REMINDERS.reminderSnoozePlan.apply(null,arguments); }
function reminderDeepLinkTarget(){ return SEYMA_REMINDERS.reminderDeepLinkTarget.apply(null,arguments); }
function reminderActionOccurrence(){ return SEYMA_REMINDERS.reminderActionOccurrence.apply(null,arguments); }
function reminderActionFind(){ return SEYMA_REMINDERS.reminderActionFind.apply(null,arguments); }
function reminderInboxCardHTML(){ return SEYMA_REMINDERS.reminderInboxCardHTML.apply(null,arguments); }
// MON-41: signatures remain stable for app-owned callers and for the
// no-module safety fallback used by headless boundary fixtures.
function reminderWindowLabel(){ return SEYMA_REMINDERS.reminderWindowLabel.apply(null,arguments); }
function reminderChannelLabel(){ return SEYMA_REMINDERS.reminderChannelLabel.apply(null,arguments); }
function reminderCategoryState(){ return SEYMA_REMINDERS.reminderCategoryState.apply(null,arguments); }
function reminderCapacityModeLabel(){ return SEYMA_REMINDERS.reminderCapacityModeLabel.apply(null,arguments); }
function reminderCenterClone(){ return SEYMA_REMINDERS.reminderCenterClone.apply(null,arguments); }
function reminderCenterEnabledCount(){ return SEYMA_REMINDERS.reminderCenterEnabledCount.apply(null,arguments); }
function reminderPreviewSafeCopy(){ return SEYMA_REMINDERS.reminderPreviewSafeCopy.apply(null,arguments); }
function reminderCardHTML(){ return SEYMA_REMINDERS.reminderCardHTML.apply(null,arguments); }
function reminderCenterOverlayHTML(){ return SEYMA_REMINDERS.reminderCenterOverlayHTML.apply(null,arguments); }
var _reminderBodyLocked=false, _reminderBodyPrevOverflow='', _reminderBodyPrevOverscrollBehavior='';
function reminderLockBodyScroll(){ return SEYMA_REMINDER_SURFACE.reminderLockBodyScroll.apply(null,arguments); }
function reminderUnlockBodyScroll(){ return SEYMA_REMINDER_SURFACE.reminderUnlockBodyScroll.apply(null,arguments); }
function reminderActiveElementId(){ return SEYMA_REMINDER_SURFACE.reminderActiveElementId.apply(null,arguments); }
function reminderRestoreFocus(){ return SEYMA_REMINDER_SURFACE.reminderRestoreFocus.apply(null,arguments); }
App.openReminderCenter=function(){ return SEYMA_REMINDER_SURFACE.openReminderCenter.apply(null,arguments); };
App.closeReminderCenter=function(){ return SEYMA_REMINDER_SURFACE.closeReminderCenter.apply(null,arguments); };
// Tüm gerçek modallar tek bir klavye sözleşmesini kullanır. Arka plan yalnızca
// fare/dokunma ile kapatılabilir; odağın kendisi daima role=dialog içindedir.
// Bu seçici, yazı yazılan textarea/select alanlarını ve bağlantıları da kapsar.
var MODAL_FOCUS_SELECTOR='button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
function modalFocusableNodes(dialog){
  if(!dialog||!dialog.querySelectorAll) return [];
  var candidates=dialog.querySelectorAll(MODAL_FOCUS_SELECTOR), nodes=[];
  for(var i=0;i<candidates.length;i++){
    var node=candidates[i];
    if(!node||node.disabled||node.hidden) continue;
    try{ if(node.getAttribute&&node.getAttribute('aria-hidden')==='true') continue; }catch(e){}
    nodes.push(node);
  }
  return nodes;
}
function focusModalDialog(id){
  var focus=function(){
    try{ var dialog=document.getElementById(id); if(dialog&&dialog.focus) dialog.focus(); }catch(e){}
  };
  if(typeof setTimeout==='function') setTimeout(focus,0); else focus();
}
App.onModalKeydown=function(e,onClose){
  if(!e) return;
  if(e.key==='Escape'){
    if(e.preventDefault) e.preventDefault();
    if(e.stopPropagation) e.stopPropagation();
    if(typeof onClose==='function') onClose();
    return;
  }
  if(e.key!=='Tab'||!e.currentTarget) return;
  // İç içe bir düzenleme sayfası açıkken Tab olayı dış modalın dinleyicisine
  // taşınmasın; varsayılan sonraki-odak davranışı yine korunur.
  if(e.stopPropagation) e.stopPropagation();
  var nodes=modalFocusableNodes(e.currentTarget);
  if(!nodes.length) return;
  var first=nodes[0], last=nodes[nodes.length-1], active=document.activeElement;
  if(e.shiftKey&&active===first){ if(e.preventDefault)e.preventDefault(); if(last.focus)last.focus(); }
  else if(!e.shiftKey&&active===last){ if(e.preventDefault)e.preventDefault(); if(first.focus)first.focus(); }
};
App.onReminderKeydown=function(e){
  var isRoomDialog=!!(e&&e.currentTarget&&e.currentTarget.id==='sey-room-dialog');
  return App.onModalKeydown(e,isRoomDialog?App.closeRoom:App.closeReminderCenter);
};
App.openReminderDigest=function(){ return SEYMA_REMINDER_SURFACE.openReminderDigest.apply(null,arguments); };
App.selectReminderDigestReflection=function(){ return SEYMA_REMINDER_SURFACE.selectReminderDigestReflection.apply(null,arguments); };
App.dismissReminderDigest=function(){ return SEYMA_REMINDER_SURFACE.dismissReminderDigest.apply(null,arguments); };
// REM-52: the notification channel boundary as an inspectable surface. It
// reports which fields each channel owns, proves they are disjoint and states
// the real (foreground-only) capability instead of implying a background
// scheduler that a static Pages service worker cannot provide.
App.reminderNotificationChannel=reminderNotificationChannel;
App.reminderNotificationBoundary=function(){ return SEYMA_REMINDER_SURFACE.reminderNotificationBoundary.apply(null,arguments); };
App.reminderPermissionCanRequest=reminderPermissionCanRequest;
App.reminderPermissionState=reminderPermissionState;
App.reminderPermissionSnapshot=reminderPermissionSnapshot;
App.reminderPermissionExplanation=reminderPermissionExplanation;
App.reminderCopy=reminderCopy;
App.requestReminderPermission=function(source){ return reminderPermissionRequest({source:source||'explicit-user-action'}); };
App.reminderNativeSafeCopy=reminderNativeSafeCopy;
App.reminderNativeActions=reminderNativeActionList;
App.reminderNativeTag=reminderNativeTag;
App.reminderNativeDeliveryCopy=reminderNativeDeliveryCopy;
App.showNativeReminderNotification=reminderNativeDisplay;
App.reminderNativeDisplay=reminderNativeDisplay;
App.previewReminderNotification=function(input){ return reminderPreviewNotification(input); };
App.reminderPolicyDefaults=function(){ return emptyReminderPolicy(); };
App.reminderNormalizePolicy=normalizeReminderPolicy;
App.reminderIsWithinQuietHours=function(localTime,quietHours){ return reminderQuietHoursState(localTime,quietHours).quiet; };
App.reminderQuietHoursState=reminderQuietHoursState;
App.reminderPolicyEvaluate=reminderPolicyEvaluate;
App.reminderSelectNativeCandidates=reminderPolicySelectNativeCandidates;
  App.reminderClockBoundary=reminderAppClockBoundary;
  App.reminderEngineInput=function(input){ return reminderAppEngineInput(input); };
  App.reminderEngineLocalParts=reminderEngineAdapterLocalParts;
  App.reminderOccurrenceId=function(reminderId,localDate,scheduledAt,timezone,definitionVersion){ var engine=reminderEngineModule(); return engine&&typeof engine.occurrenceId==='function'?engine.occurrenceId(reminderId,localDate,scheduledAt,timezone,definitionVersion):reminderEngineOccurrenceId(reminderId,localDate,scheduledAt,timezone,definitionVersion); };
  App.reminderGenerateOccurrence=reminderEngineAdapterGenerateOccurrence;
App.reminderPrayerOccurrence=reminderPrayerOccurrence;
App.reminderPrayerOccurrences=reminderPrayerOccurrences;
App.generatePrayerReminderOccurrence=reminderPrayerOccurrence;
App.generatePrayerReminderOccurrences=reminderPrayerOccurrences;
App.reminderPrayerPrivateCopy=reminderPrayerPrivateCopy;
App.reminderPrayerStatus=reminderSystemPrayerStatus;
App.reminderSyncStatus=reminderSystemSyncStatus;
App.reminderSystemStatus=reminderSystemStatus;
App.reminderSystemStatusCopy=reminderSystemStatusCopy;
App.reminderCrossSurfaceStatus=reminderCrossSurfaceStatus;
App.reminderCrossSurfaceTransition=reminderCrossSurfaceTransition;
App.reminderZikrFeatureEnabled=reminderZikrFeatureEnabled;
App.reminderZikrOccurrence=reminderZikrDailyOccurrence;
App.reminderZikrDailyOccurrence=reminderZikrDailyOccurrence;
App.reminderZikrJourneyOccurrence=reminderZikrJourneyOccurrence;
App.reminderZikrReflectionOccurrence=reminderZikrReflectionOccurrence;
App.reminderZikrOccurrences=reminderZikrOccurrences;
App.reminderZikrLifecycleCandidates=reminderZikrLifecycleCandidates;
App.reminderTherapyOccurrence=reminderTherapyOccurrence;
App.reminderTherapyLifecycleCandidates=reminderTherapyLifecycleCandidates;
App.reminderTherapyPrivateCopy=reminderTherapyPrivateCopy;
App.reminderTherapyToolId=reminderTherapyToolId;
App.reminderSaygiOccurrence=reminderSaygiOccurrence;
App.reminderSaygiLifecycleCandidates=reminderSaygiLifecycleCandidates;
App.reminderSaygiPrivateCopy=reminderSaygiPrivateCopy;
App.reminderSaygiArticleState=reminderSaygiArticleState;
// REM-09: device-local delivery journal. These adapters never touch data,
// data.notifications or the ÆON shownNotificationIds list.
App.reminderDeliveryKey=REMINDER_DELIVERY_KEY;
App.REMINDER_DELIVERY_KEY=REMINDER_DELIVERY_KEY;
App.REMINDER_DELIVERY_STATUSES=REMINDER_DELIVERY_STATUS_LIST.slice();
App.REMINDER_DELIVERY_REASONS=Object.keys(REMINDER_DELIVERY_REASONS);
App.reminderDeliveryEmpty=reminderDeliveryEmpty;
App.reminderDeliveryStatuses=function(){ return REMINDER_DELIVERY_STATUS_LIST.slice(); };
App.reminderDeliveryReasons=function(){ return Object.keys(REMINDER_DELIVERY_REASONS); };
App.reminderDeliveryNormalize=function(raw,now){ return reminderDeliveryNormalize(raw,now); };
App.reminderDeliveryStatus=reminderDeliveryStatus;
App.reminderDeliveryReason=reminderDeliveryReason;
App.reminderDeliveryRecord=reminderDeliveryRecordAdapter;
App.reminderDeliveryTransition=reminderDeliveryRecordAdapter;
App.reminderDeliveryLoad=function(now){ return reminderDeliveryLoad(now,true); };
App.reminderDeliveryJournal=App.reminderDeliveryLoad;
App.reminderDeliveryFromStorage=App.reminderDeliveryLoad;
App.reminderDeliveryEntries=function(now){ return reminderDeliveryLoad(now,true).entries.slice(); };
App.reminderDeliveryGet=function(occurrenceId,now){ var id=occurrenceId&&typeof occurrenceId==='object'?(occurrenceId.occurrenceId||occurrenceId.id):occurrenceId; return reminderDeliveryFind(reminderDeliveryLoad(now,true),id); };
App.reminderDeliveryCanShow=function(occurrenceId,now){ var occurrence=occurrenceId&&typeof occurrenceId==='object'?occurrenceId:null, id=occurrence?(occurrence.occurrenceId||occurrence.id):occurrenceId; return reminderDeliveryCanShowPure(reminderDeliveryLoad(now,true),id,occurrence,now); };
App.reminderDeliveryShouldShow=App.reminderDeliveryCanShow;
App.reminderDeliveryCanDeliver=App.reminderDeliveryCanShow;
App.reminderDeliveryIsDuplicate=function(occurrenceId,now){ return !App.reminderDeliveryCanShow(occurrenceId,now); };
App.reminderDeliveryClaim=function(occurrence,options){ return reminderDeliveryAction('shown',occurrence,options); };
App.claimReminderDelivery=App.reminderDeliveryClaim;
App.reminderDeliveryWasDelivered=function(occurrenceId,now){ var entry=App.reminderDeliveryGet(occurrenceId,now); return !!(entry&&REMINDER_DELIVERY_BLOCKING_STATUSES[entry.status]); };
App.reminderDeliverySchedule=function(occurrence,options){ return reminderDeliveryAction('scheduled',occurrence,options); };
App.reminderDeliveryShow=function(occurrence,options){ return reminderDeliveryAction('shown',occurrence,options); };
App.reminderDeliveryOpen=function(occurrence,options){ return reminderDeliveryAction('opened',occurrence,options); };
App.reminderDeliverySnooze=function(occurrence,options){ return reminderDeliveryAction('snoozed',occurrence,options); };
App.reminderDeliveryDismiss=function(occurrence,options){ return reminderDeliveryAction('dismissed',occurrence,options); };
App.reminderDeliverySuppress=function(occurrence,options){ return reminderDeliveryAction('suppressed',occurrence,options); };
App.reminderDeliveryFail=function(occurrence,options){ return reminderDeliveryAction('failed',occurrence,options); };
App.reminderDeliveryRetain=function(now){ return reminderDeliveryLoad(now,true); };
App.reminderDeliveryRetainLog=App.reminderDeliveryRetain;
App.reminderDeliveryClear=function(now){ return reminderDeliveryClear.apply(null,arguments); };
App.reminderDeliveryReset=App.reminderDeliveryClear;
App.recordReminderDelivery=App.reminderDeliveryRecord;
App.loadReminderDelivery=App.reminderDeliveryLoad;
App.clearReminderDelivery=App.reminderDeliveryClear;
App.scheduleReminderDelivery=App.reminderDeliverySchedule;
App.showReminderDelivery=App.reminderDeliveryShow;
App.openReminderDelivery=App.reminderDeliveryOpen;
App.snoozeReminderDelivery=App.reminderDeliverySnooze;
App.dismissReminderDelivery=App.reminderDeliveryDismiss;
App.suppressReminderDelivery=App.reminderDeliverySuppress;
App.failReminderDelivery=App.reminderDeliveryFail;
App.generateReminderOccurrence=reminderEngineGenerateOccurrence;
App.isReminderWithinQuietHours=App.reminderIsWithinQuietHours;
App.evaluateReminderPolicy=App.reminderPolicyEvaluate;
App.selectReminderNativeCandidates=App.reminderSelectNativeCandidates;
App.reminderCatchup=function(input){ return reminderCatchupPublic(reminderCatchupPlan(input)); };
App.buildReminderCatchup=App.reminderCatchup;
App.resolveReminderCatchup=App.reminderCatchup;
App.reminderCatchupMaxAge=REMINDER_CATCHUP_MAX_AGE_MS;
App.reminderEveningId=REMINDER_EVENING_ID;
App.reminderEveningCoalesce=function(candidates,context){ return reminderEveningCoalesceCandidates(candidates,context); };
App.reminderEveningSafeGroup=function(group){ return reminderEveningSafeGroup(group); };
App.reminderDailyFlowPolicy=reminderDailyFlowPolicy;
App.reminderDailyFlowCoalesce=function(candidates,context){ return reminderDailyFlowCoalesceCandidates(candidates,context); };
App.reminderDailyFlowCandidates=App.reminderDailyFlowCoalesce;
App.reminderDailyFlowSafeGroup=function(candidates,context){ return reminderDailyFlowGroup(Array.isArray(candidates)?candidates:[],reminderDailyFlowPolicy({context:context||{}})); };
App.reminderDigest=reminderDigestBuild;
App.reminderDigestBuild=reminderDigestBuild;
App.reminderDigestReflections=function(){ return REMINDER_DIGEST_REFLECTIONS.map(function(option){ return {id:option.id,label:option.label,prompt:option.prompt}; }); };
// REM-10/23: pure evaluator + foreground lifecycle adapter. Delivery journal
// writes and native display are separate steps; neither calls save() or fetch().
App.reminderEvaluateReminders=reminderEvaluateReminders;
App.evaluateReminders=reminderLifecycleEvaluate;
App.evaluateRemindersPure=reminderEvaluateReminders;
App.reminderLifecycleEvaluate=reminderLifecycleEvaluate;
App.evaluateReminderLifecycle=reminderLifecycleEvaluate;
App.reminderLifecycleTick=reminderLifecycleTick;
App.reminderLifecycleInterval=REMINDER_LIFECYCLE_INTERVAL_MS;
App.reminderLifecycleState=function(){ return SEYMA_REMINDER_SURFACE.reminderLifecycleState.apply(null,arguments); };
App.reminderSchedulerTrigger=reminderSchedulerDispatch;
App.reminderSchedulerState=reminderSchedulerSnapshot;
App.reminderSchedulerReset=function(){ reminderSchedulerEnsure().reset(); return reminderSchedulerSnapshot(); };
App.reminderRenderPolicy=function(){ return SEYMA_REMINDER_SURFACE.reminderRenderPolicy.apply(null,arguments); };
App.reminderRenderReceipt=function(){ return reminderLifecycleState.renderReceipt?Object.assign({},reminderLifecycleState.renderReceipt):null; };
App.reminderRenderAction=reminderRenderAction;
App.reminderPolicyForState=function(){ var root=reminderCurrentRoot(); return root?normalizeReminderPolicy(root.policy):emptyReminderPolicy(); };
App.reminderPersonalizationNormalize=normalizeReminderPersonalization;
App.reminderPersonalizationEmpty=emptyReminderPersonalization;
App.reminderPersonalizationSuggestions=function(){ return SEYMA_REMINDER_SURFACE.reminderPersonalizationSuggestions.apply(null,arguments); };
App.reminderPersonalizationState=function(){ var root=reminderCurrentRoot(); return reminderPersonalizationClone(root?root.personalization:emptyReminderPersonalization()); };
App.reminderPersonalizationRecordSignal=function(signal,nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationSignalRecord(root,signal,nowIso); if(result.changed){ save(); render(); } return result; };
App.setReminderPersonalizationOptIn=function(flag,options){ var root=reminderCurrentRoot(), x=options&&typeof options==='object'?options:{}, result=reminderPersonalizationSetOptIn(root,flag,{historyMode:flag===true&&x.historyMode==='none'?'none':'local',nowIso:x.nowIso||new Date().toISOString()}); if(result.ok){ save(); render(); } return result; };
App.setReminderPersonalizationHistoryMode=function(mode,nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationSetHistoryMode(root,mode,nowIso||new Date().toISOString()); if(result.ok){ save(); render(); } return result; };
App.recordReminderPersonalizationFeedback=function(bucket,reminderId,nowIso){ var root=reminderCurrentRoot(), value=String(bucket||''), id=String(reminderId||''), signal={type:'feedback',source:'explicit-feedback',value:value}; if(id) signal.reminderId=id; var result=reminderPersonalizationSignalRecord(root,signal,nowIso||new Date().toISOString()); if(result.changed){ save(); render(); } return result; };
App.applyReminderPersonalizationSuggestion=function(id,nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationApplySuggestion({root:root,suggestionId:id,nowIso:nowIso||new Date().toISOString()}); if(result.changed){ save(); render(); } return result; };
App.undoReminderPersonalizationSuggestion=function(id,nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationUndoSuggestion({root:root,suggestionId:id,nowIso:nowIso||new Date().toISOString()}); if(result.changed){ save(); render(); } return result; };
App.dismissReminderPersonalizationSuggestion=function(id,nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationDismissSuggestion({root:root,suggestionId:id,nowIso:nowIso||new Date().toISOString()}); if(result.changed){ save(); render(); } return result; };
App.resetReminderPersonalization=function(nowIso){ var root=reminderCurrentRoot(), result=reminderPersonalizationReset(root,nowIso||new Date().toISOString()); if(result.changed){ save(); render(); } return result; };
App.reminderCareDefinitions=function(){ return reminderCareDefinitions(); };
App.reminderCareNativeCategories=function(value){ return reminderCareNativeCategories(value); };
App.reminderCareLifecycleCandidates=function(input){ return reminderCareLifecycleCandidates(input); };
App.reminderCareNudgeSources=function(){ return reminderCareNudgeSources(); };
App.reminderMedicationNormalize=function(value,options){ return normalizeReminderMedication(value,options); };
App.reminderMedicationOccurrence=reminderMedicationOccurrence;
App.reminderMedicationNativeCopy=reminderMedicationNativeCopy;
App.reminderMedicationPrivateCopy=reminderMedicationPrivateCopy;
App.reminderMedicationDefinition=reminderMedicationDefinition;
App.reminderMedicationLifecycleCandidates=reminderMedicationLifecycleCandidates;
App.reminderMedicationSafetyCopy=REMINDER_MEDICATION_SAFETY_COPY;
App.reminderMedicationRetention=function(now){ return reminderDeliveryLoad(now,true); };
App.reminderStateContract=reminderStateContract;
App.reminderSyncPayload=reminderSyncPayload;
App.reminderSchemaStatus=function(){ return SEYMA_REMINDER_SURFACE.reminderSchemaStatus.apply(null,arguments); };
App.reminderMedicationSchedules=function(){ return SEYMA_REMINDER_SURFACE.reminderMedicationSchedules.apply(null,arguments); };
function reminderMedicationCurrentList(){ return SEYMA_REMINDERS.reminderMedicationCurrentList.apply(null,arguments); }
function reminderMedicationDraftFromSchedule(){ return SEYMA_REMINDERS.reminderMedicationDraftFromSchedule.apply(null,arguments); }
function reminderMedicationClearHistory(){ return SEYMA_REMINDERS.reminderMedicationClearHistory.apply(null,arguments); }
App.setReminderMedicationDraftField=function(){ return SEYMA_REMINDER_SURFACE.setReminderMedicationDraftField.apply(null,arguments); };
App.saveReminderMedicationDraft=function(){ return SEYMA_REMINDER_SURFACE.saveReminderMedicationDraft.apply(null,arguments); };
App.editReminderMedication=function(){ return SEYMA_REMINDER_SURFACE.editReminderMedication.apply(null,arguments); };
App.cancelReminderMedicationEdit=function(){ ui.reminderMedicationEditingId=''; ui.reminderMedicationDraft=null; ui.reminderMedicationError=''; render(); };
App.deleteReminderMedication=function(){ return SEYMA_REMINDER_SURFACE.deleteReminderMedication.apply(null,arguments); };
App.muteReminderMedicationToday=function(){ return SEYMA_REMINDER_SURFACE.muteReminderMedicationToday.apply(null,arguments); };
App.clearReminderMedicationLocal=function(){ return SEYMA_REMINDER_SURFACE.clearReminderMedicationLocal.apply(null,arguments); };
function updateReminderPolicy(){ return SEYMA_REMINDER_SURFACE.updateReminderPolicy.apply(null,arguments); }
App.setReminderCapacityMode=function(mode){ mode=String(mode||''); if(!REMINDER_CAPACITY_MODES[mode]) return; updateReminderPolicy(function(policy){ policy.capacityMode=mode; }); };
App.setReminderQuietHours=function(start,end){ start=String(start||''); end=String(end||''); if(!validReminderTime(start)||!validReminderTime(end)) return; updateReminderPolicy(function(policy){ policy.quietHours.start=start; policy.quietHours.end=end; }); };
App.setReminderNativeDailyCap=function(cap){ cap=Number(cap); if(!Number.isInteger(cap)||cap<0||cap>24) return; updateReminderPolicy(function(policy){ policy.nativeDailyCap=cap; }); };
App.setReminderDailyFlowBudget=function(cap){ cap=Number(cap); if(!Number.isInteger(cap)||cap<0||cap>24) return; updateReminderPolicy(function(policy){ policy.dailyFlowBudget=cap; }); };
App.setReminderLowPriorityNativeCap=function(cap){ cap=Number(cap); if(!Number.isInteger(cap)||cap<0||cap>24) return; updateReminderPolicy(function(policy){ policy.lowPriorityNativeCap=cap; }); };
App.setReminderSameCategoryCooldown=function(minutes){ minutes=Number(minutes); if(!Number.isInteger(minutes)||minutes<0||minutes>1440) return; updateReminderPolicy(function(policy){ policy.sameCategoryCooldownMinutes=minutes; }); };
App.setReminderCareNativeCategories=function(){ return SEYMA_REMINDER_SURFACE.setReminderCareNativeCategories.apply(null,arguments); };
App.toggleReminderCareNative=function(){ return SEYMA_REMINDER_SURFACE.toggleReminderCareNative.apply(null,arguments); };
App.setReminderCareMovementOptIn=function(flag){ updateReminderPolicy(function(policy){ policy.careMovementOptIn=flag===true; }); };
App.setReminderProfile=function(){ return window.SeymaProfile.setReminderProfile.apply(null,arguments); };
App.toggleReminderSetupCategory=function(){ return SEYMA_REMINDER_SURFACE.toggleReminderSetupCategory.apply(null,arguments); };
App.confirmReminderSetup=function(){ return SEYMA_REMINDER_SURFACE.confirmReminderSetup.apply(null,arguments); };
App.setReminderCategoryEnabled=function(){ return SEYMA_REMINDER_SURFACE.setReminderCategoryEnabled.apply(null,arguments); };
function reminderSetEnabled(){ return SEYMA_REMINDER_SURFACE.reminderSetEnabled.apply(null,arguments); }
App.setReminderEnabled=function(reminderId,flag,options){ return reminderSetEnabled(reminderId,flag===true,options); };
App.reminderDisable=function(reminderId,options){ return reminderSetEnabled(reminderId,false,options); };
App.reminderEnable=function(reminderId,options){ return reminderSetEnabled(reminderId,true,options); };
App.setReminderCategoryChannel=function(){ return SEYMA_REMINDER_SURFACE.setReminderCategoryChannel.apply(null,arguments); };
App.reminderSpecialDayOptions=function(){ return REMINDER_SPECIAL_DAY_OPTIONS.map(function(option){ return {id:option.id,label:option.label}; }); };
App.reminderSpecialDaysPreference=function(){ var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root); return Object.assign({},state,{selectedDays:state.selectedDays.slice()}); };
App.reminderSpecialDayDefinition=function(){ return reminderSpecialDayDefinition(App.reminderSpecialDaysPreference()); };
App.reminderSpecialDayOccurrence=reminderSpecialDayOccurrence;
App.reminderSpecialDayLifecycleCandidates=function(input){ var x=input&&typeof input==='object'?Object.assign({},input):{}, root=reminderCurrentRoot(), context=x.context&&typeof x.context==='object'?x.context:{}; x.root=root; x.context=context; x.localDate=x.localDate||context.localDate; x.localTime=x.localTime||context.localTime; x.timezone=x.timezone||context.timezone; return reminderSpecialDayLifecycleCandidates(x); };
App.reminderSpecialDayPolicyPreference=function(state){ return reminderSpecialDayPolicyPreference(state||App.reminderSpecialDaysPreference()); };
App.setReminderSpecialDaysMode=function(){ return SEYMA_REMINDER_SURFACE.setReminderSpecialDaysMode.apply(null,arguments); };
App.toggleReminderSpecialDay=function(){ return SEYMA_REMINDER_SURFACE.toggleReminderSpecialDay.apply(null,arguments); };
App.setReminderSpecialDaysSelection=function(){ return SEYMA_REMINDER_SURFACE.setReminderSpecialDaysSelection.apply(null,arguments); };
App.setReminderTimeWindow=function(){ return SEYMA_REMINDER_SURFACE.setReminderTimeWindow.apply(null,arguments); };
App.setReminderSpecialDaysTime=function(){ return SEYMA_REMINDER_SURFACE.setReminderSpecialDaysTime.apply(null,arguments); };
App.setReminderSpecialDaysChannel=function(){ return SEYMA_REMINDER_SURFACE.setReminderSpecialDaysChannel.apply(null,arguments); };
App.previewReminder=function(){ return SEYMA_REMINDER_SURFACE.previewReminder.apply(null,arguments); };
App.previewReminderSafe=function(){ return SEYMA_REMINDER_SURFACE.previewReminderSafe.apply(null,arguments); };
App.testReminder=function(){ return SEYMA_REMINDER_SURFACE.testReminder.apply(null,arguments); };
App.clearReminderTest=function(){ ui.reminderTestState=null; render(); };
App.muteReminderToday=function(){ ui.reminderTodayMuted=!ui.reminderTodayMuted; render(); };
App.resetReminderCenter=function(){ return SEYMA_REMINDER_SURFACE.resetReminderCenter.apply(null,arguments); };
App.undoReminderCenterReset=function(){ return SEYMA_REMINDER_SURFACE.undoReminderCenterReset.apply(null,arguments); };
App.resetReminderPreferences=App.resetReminderCenter;
App.undoReminderReset=App.undoReminderCenterReset;
function reminderConfirmAction(){ return SEYMA_REMINDERS.reminderConfirmAction.apply(null,arguments); }
function reminderRemoveLocalKey(){ return SEYMA_REMINDER_SURFACE.reminderRemoveLocalKey.apply(null,arguments); }
App.clearReminderHistory=function(){ return SEYMA_REMINDER_SURFACE.clearReminderHistory.apply(null,arguments); };
App.undoReminderHistory=function(){ return SEYMA_REMINDER_SURFACE.undoReminderHistory.apply(null,arguments); };
App.clearReminderDeliveryHistory=App.clearReminderHistory;
App.reminderRetentionPolicy=reminderRetentionPolicySnapshot;
App.reminderPrivacySchemas=reminderPrivacySchemas;
App.reminderPrivacyReport=reminderPrivacyReport;
App.reminderCurrentSyncPayload=function(){ return reminderSyncPayload(data); };
App.reminderRetentionSummary=function(input){ return reminderRetentionSummary(input); };
App.reminderExportSummary=function(input){ return reminderExportSummary(input); };
App.exportReminderSummary=function(input){ return reminderExportSummary(input); };
App.disableAllReminders=function(){ return SEYMA_REMINDER_SURFACE.disableAllReminders.apply(null,arguments); };
App.reminderDisableAll=App.disableAllReminders;
App.undoDisableAllReminders=function(){ return SEYMA_REMINDER_SURFACE.undoDisableAllReminders.apply(null,arguments); };
App.undoReminderDisableAll=App.undoDisableAllReminders;
App.reminderFullReset=function(){ return SEYMA_REMINDER_SURFACE.reminderFullReset.apply(null,arguments); };
App.resetReminderData=App.reminderFullReset;
App.fullResetReminders=App.reminderFullReset;
App.reminderInboxItems=function(input){ return reminderInboxBuildItems(input); };
App.reminderInboxCardHTML=function(input){ return reminderInboxCardHTML(input); };
App.reminderInboxMuteToday=function(){ ui.reminderInboxTodayMuted=!ui.reminderInboxTodayMuted; reminderRenderAction('action-accepted',{target:'reminder-inbox'}); };
App.reminderActionState=function(now){ return reminderActionLoad(now,true); };
App.reminderActionKey=REMINDER_ACTION_KEY;
App.reminderSnoozePlan=reminderSnoozePlan;
App.reminderDeepLinkTarget=reminderDeepLinkTarget;
App.reminderSurfaceTable=reminderSurfaceTable;
App.reminderSurfaceState=reminderSurfaceState;
App.reminderDeepLinkTargets=function(){ return Object.keys(REMINDER_DEEP_LINK_TARGETS).map(function(key){ return {deepLink:key,targetId:REMINDER_DEEP_LINK_TARGETS[key].targetId,kind:REMINDER_DEEP_LINK_TARGETS[key].kind}; }); };
App.reminderInboxSnooze=function(){ return SEYMA_REMINDER_SURFACE.reminderInboxSnooze.apply(null,arguments); };
App.reminderInboxTodayOff=function(){ return SEYMA_REMINDER_SURFACE.reminderInboxTodayOff.apply(null,arguments); };
App.reminderInboxMuteOccurrence=App.reminderInboxTodayOff;
function reminderCloseForTarget(){ return SEYMA_REMINDER_SURFACE.reminderCloseForTarget.apply(null,arguments); }
App.showReminderUnavailable=function(){ return SEYMA_REMINDER_SURFACE.showReminderUnavailable.apply(null,arguments); };
App.openReminderTarget=function(){ return SEYMA_REMINDER_SURFACE.openReminderTarget.apply(null,arguments); };
function reminderServiceWorkerClickPayload(){ return SEYMA_REMINDERS.reminderServiceWorkerClickPayload.apply(null,arguments); }
App.handleReminderServiceWorkerClick=function(){ return SEYMA_REMINDER_SURFACE.handleReminderServiceWorkerClick.apply(null,arguments); };
App.handleReminderNativeClick=function(){ return SEYMA_REMINDER_SURFACE.handleReminderNativeClick.apply(null,arguments); };
App.reminderNativeClick=App.handleReminderNativeClick;
App.handleReminderClick=App.handleReminderNativeClick;
App.reminderInboxPrimary=function(){ return SEYMA_REMINDER_SURFACE.reminderInboxPrimary.apply(null,arguments); };
App.reminderInboxEveningTarget=function(){ return SEYMA_REMINDER_SURFACE.reminderInboxEveningTarget.apply(null,arguments); };
App.reminderInboxOverflow=function(){ return SEYMA_REMINDER_SURFACE.reminderInboxOverflow.apply(null,arguments); };
App.profileConsentOpen=function(){ return window.SeymaProfile.profileConsentOpen.apply(null,arguments); };
App.profileConsentToggle=function(key){ return window.SeymaProfile.profileConsentToggle.apply(null,arguments); };
App.profileConsentTogglePrivacyNote=function(){ return window.SeymaProfile.profileConsentTogglePrivacyNote.apply(null,arguments); };
App.profileAcceptConsent=function(){ return window.SeymaProfile.profileAcceptConsent.apply(null,arguments); };
App.refreshSaygi=function(){ var person=saygiModalPerson(); if(!person) return; saygiLoadArticle(person,true); render(); };
// ── IIP-10 · Öncü arama ve filtre (REQ-019 / REQ-020) ──
// Sorgu ve filtreler YALNIZ `ui` oturumluk durumunda tutulur: kalıcı depo,
// `data`, migrate() ve sync yolu değişmez. Arama hedef bölgesi varsa tam render
// yerine yalnız o bölge boyanır; böylece yazarken odak ve caret sabit kalır ve
// ilgisiz her tuşta bütün uygulama yeniden render edilmez (C07). Bölge yoksa
// güvenli tam render devreye girer.
// Tek bir dispatcher handler kullanılır (App.saygiLens): altı ayrı handler
// eklemek App.* yüzey sözleşmesini büyütürdü. Yeni bir arama alanı eklemek yeni
// bir App üyesi GEREKTİRMEZ — yalnız aşağıdaki eylem listesine bir dal eklenir.
var SAYGI_LENS_ACTIONS={query:1,key:1,clear:1,reset:1,kind:1,read:1,grid:1};
function saygiSearchRegionHTML(lens,todayId){ return window.SeymaSaygi.saygiFilteredResultsHTML(lens,todayId); }
function saygiPaintLens(){
  try{
    var region=document.getElementById('saygi-search-region');
    if(!region) return false;
    var lens=saygiLens(), person=saygiCurrentPerson();
    region.innerHTML=saygiSearchRegionHTML(lens,person&&person.id);
    var count=document.getElementById('saygi-result-count');
    if(count){ count.textContent=window.SeymaSaygi.saygiResultCountText(lens); count.setAttribute('data-tone',lens.results.length?'ok':'empty'); }
    var reset=document.getElementById('saygi-search-reset'); if(reset) reset.hidden=!lens.hasLens;
    var clear=document.getElementById('saygi-search-clear'); if(clear) clear.hidden=!ui.saygiQuery;
    var chips={ 'saygi-chip-kind-all':lens.kind==='all', 'saygi-chip-kind-Bilim':lens.kind==='Bilim', 'saygi-chip-kind-Sanat':lens.kind==='Sanat', 'saygi-chip-read-all':lens.read==='all', 'saygi-chip-read-read':lens.read==='read', 'saygi-chip-read-unread':lens.read==='unread' };
    for(var id in chips){ if(!Object.prototype.hasOwnProperty.call(chips,id)) continue; var chip=document.getElementById(id); if(!chip) continue; if(chips[id]) chip.classList.add('on'); else chip.classList.remove('on'); chip.setAttribute('aria-pressed',chips[id]?'true':'false'); }
    return true;
  }catch(e){ return false; }
}
// `action` bilinmeyen bir değerse hiçbir şey yapılmaz: bilinmeyen bir DOM
// niteliği oturumluk aramayı sessizce bozmaz.
App.saygiLens=function(action,value){
  var act=String(action||'');
  if(!SAYGI_LENS_ACTIONS[act]) return;
  if(act==='query') ui.saygiQuery=String(value==null?'':value).slice(0,80);
  else if(act==='key'){
    var e=value;
    if(!e||!e.key) return;
    if(e.key==='Escape'&&String(ui.saygiQuery||'').length){ if(e.preventDefault) e.preventDefault(); ui.saygiQuery=''; }
    else if(e.key==='Enter'){ var first=saygiLens().results[0]; if(!first) return; if(e.preventDefault) e.preventDefault(); App.openSaygiCollectionPerson(first.id); return; }
    else return;
  }
  else if(act==='clear') ui.saygiQuery='';
  else if(act==='reset'){ ui.saygiQuery=''; ui.saygiKindFilter='all'; ui.saygiReadFilter='all'; }
  else if(act==='kind') ui.saygiKindFilter=saygiFilter(value);
  else if(act==='read') ui.saygiReadFilter=saygiReadFilter(value);
  else if(act==='grid'){ ui.saygiGridOpen=!!value; return; }
  if(!saygiPaintLens()) render();
  if(act==='clear'||act==='reset'||act==='key'){
    try{ var el=document.getElementById('saygi-search-input'); if(el){ el.value=ui.saygiQuery; if(el.focus) el.focus(); } }catch(e){}
  }
};
// ── IIP-11 · Okuyucu etkileşimleri (REQ-021 / REQ-022) ──
// Tek dispatcher: yazı büyütme, bölüme atlama, konumu hatırlama/geri dönme,
// kapsayıcı tamamlama alternatifi ve RTL bilgisi. Tıpkı App.saygiLens gibi,
// yeni bir okuyucu denetimi eklemek yeni bir App üyesi GEREKTİRMEZ — yalnız
// aşağıdaki eylem listesine bir dal eklenir.
var SAYGI_READER_ACTIONS={scale:1,reset:1,goto:1,top:1,scroll:1,restore:1,program:1,'a11y-end':1};
function saygiReaderScrollBody(){ try{ return document.querySelector('.sg-person-ov-card [data-scroll]')||document.getElementById('sey-ov-body')||null; }catch(e){ return null; } }
function saygiReaderAnchorEl(anchorId){ try{ return anchorId?document.getElementById(anchorId):null; }catch(e){ return null; } }
// Aa değişiminde ilk görünür paragraf ankrajı korunur: kaydırma konumu orana
// çevrilir, ölçek uygulandıktan sonra aynı ankraja geri dönülür.
function saygiReaderCaptureAnchor(){
  var body=saygiReaderScrollBody(); if(!body) return null;
  var person=saygiModalPerson(), article=ui.saygiArticle, anchors=saygiBlockAnchors(article);
  var top=body.scrollTop, chosen='', ratio=0;
  for(var i=0;i<anchors.length;i++){
    var el=saygiReaderAnchorEl(saygiAnchorId(person,i));
    if(!el) continue;
    if(el.offsetTop<=top+2){ chosen=saygiAnchorId(person,i); ratio=(el.offsetTop-(top))/-Math.max(1,body.clientHeight); }
    else break;
  }
  if(!chosen&&anchors.length) chosen=saygiAnchorId(person,0);
  return chosen?{anchorId:chosen,ratio:Math.max(-1,Math.min(0,ratio))}:null;
}
function saygiReaderRestoreAnchor(anchorId){
  var el=saygiReaderAnchorEl(anchorId); if(!el||!el.scrollIntoView) return;
  try{ el.scrollIntoView({block:'start',behavior:'auto'}); }catch(e){ try{ el.scrollIntoView(); }catch(e2){} }
}
function saygiReaderRestoreSaved(){ var p=saygiPosition(),ref=window.SeymaSaygi.saygiContentRef(saygiModalPerson(),ui.saygiArticle); if(!p||!p.anchorId||!ref||String(p.contentId||'')!==String(ref.contentId||'')||String(p.revision||'')!==String(ref.revision||''))return; setTimeout(function(){if(saygiReaderAnchorEl(p.anchorId))saygiReaderRestoreAnchor(p.anchorId);},0); } function persistSaygiPreference(scale){ if(!data)return; if(!data.reader||typeof data.reader!=='object')data.reader={schemaVersion:1,preferences:{},positions:{}}; if(!data.reader.preferences||typeof data.reader.preferences!=='object')data.reader.preferences={}; var p=data.reader.preferences; p.scaleIndex=scale; p.revision=Math.max(0,Number(p.revision)||0)+1; p.updatedAt=new Date().toISOString(); p.deviceId=String(data.eventLog&&data.eventLog.sourceDeviceId||'').slice(0,96); save(false); }
App.saygiReader=function(action,value){
  var act=String(action||'');
  if(!SAYGI_READER_ACTIONS[act]) return;
  if(act==='scale'){
    var idx=saygiScaleIndex(), next=String(value)==='down'?(idx-1):(idx+1);
    next=Math.max(0,Math.min(4,next));
    var captured=saygiReaderCaptureAnchor();
    ui.saygiScaleIndex=next; persistSaygiPreference(next);
    if(!saygiPaintReader()) render();
    if(captured){ saygiRememberPosition(captured.anchorId,captured.ratio); saygiReaderRestoreAnchor(captured.anchorId); }
    try{ var lbl=document.getElementById('saygi-scale-value'); if(lbl) lbl.textContent=saygiScaleLabel(); var dn=document.getElementById('saygi-scale-down'), up=document.getElementById('saygi-scale-up'); if(dn) dn.disabled=(next<=0); if(up) up.disabled=(next>=4); }catch(e){}
    return;
  }
  if(act==='reset'){
    ui.saygiScaleIndex=0; saygiClearPosition(); persistSaygiPreference(0);
    if(!saygiPaintReader()) render();
    try{ var lbl2=document.getElementById('saygi-scale-value'); if(lbl2) lbl2.textContent=saygiScaleLabel(); }catch(e){}
    return;
  }
  if(act==='goto'){
    var id=String(value||''); if(!id) return; saygiReaderRestoreAnchor(id);
    return;
  }
  if(act==='top'){
    var body=saygiReaderScrollBody(); if(body) body.scrollTop=0;
    return;
  }
  if(act==='scroll'){ var capturedScroll=saygiReaderCaptureAnchor(); if(capturedScroll){saygiRememberPosition(capturedScroll.anchorId,capturedScroll.ratio);save(false);} return; }
  if(act==='restore'){ saygiReaderRestoreSaved(); return; } if(act==='bookmark'){ var bm=window.SeymaSaygi.saygiToggleBookmark(saygiModalPerson(),ui.saygiArticle); if(!bm)return; save(false); render(); focusModalDialog('sey-ov-card'); toast(bm.tombstone?'Yer imi kaldırıldı.':'Yer imi kaydedildi.'); return; } if(act==='program'){ var pa=String(value||''); if(pa==='archive'){ui.saygiProgramArchive=!ui.saygiProgramArchive;render();return;} var before=window.SeymaSaygi.iip21ProgramState(),beforeRev=before&&Number(before.revision)||0,beforeStatus=before&&before.status,after=window.SeymaSaygi.iip21ProgramApply(pa); if(!after)return; if(!before||Number(after.revision)!==beforeRev||after.status!==beforeStatus){save(false);render();toast(pa==='start'?'Yolculuk başladı.':pa.indexOf('day')===0?'Durak tamamlandı.':pa==='finish'?'Yolculuk tamamlandı.':pa==='pause'?'Yolculuk durduruldu.':pa==='resume'?'Yolculuk devam ediyor.':'');} return; }
  if(act==='a11y-end'){
    var body2=saygiReaderScrollBody();
    if(body2) body2.scrollTop=body2.scrollHeight;
    // Bu yol KAYIT OLUŞTURMAZ; yalnız konumu sona alır ve durumu bildirir.
    ui.saygiReadReady=true;
    try{
      var s=document.getElementById('saygi-a11y-status-modal')||document.getElementById('saygi-a11y-status');
      if(s) s.textContent='Bölüm sonundasın. Kaydı istediğin zaman "Okudum" ile atabilirsin.';
      var fab=document.getElementById('saygi-read-button-modal');
      if(fab) saygiUnlockReadButton(fab);
    }catch(e){}
    return;
  }
};
// Aa aracı + bölüm atlama yeniden boyanır; makale gövdesi yeniden kurulur ki
// --saygi-scale gerçekten uygulansın.
function saygiPaintReader(){
  try{
    var person=saygiModalPerson(); if(!person) return false;
    var host=document.getElementById('saygi-reader-region'); if(!host) return false;
    var article=ui.saygiArticle; if(!article||article.personId!==person.id) return false;
    var view=Object.create(article); view.suffix='-modal';
    host.innerHTML=saygiArticleBodyHTML(person,view,saygiHasRead(person),'saygi-article-modal',false);
    return true;
  }catch(e){ return false; }
}
// Açık okuma kaydına köprü. IIP-11 sırasında yanlışlıkla silinmişti:
// saygi.js markup'ı bunu İKİ yerde çağırıyor (okunmuş içerikte "Okudum" →
// "Ne okudum kaydını aç"), yüzey sayısı 719=719 kaldığı için hiçbir pin
// yakalamadı — bu yüzden açıkça geri konur ve fixture ile sabitlenir.
App.openSaygiReading=function(){ App.openReading(); };
App.openSaygiPreview=function(){
  var person=saygiCurrentPerson(); if(!person) return;
  var key=saygiDayKey(person);
  ui.saygiBrowseId=person.id;
  ui.saygiPersonOpen=true;
  if(ui.saygiKey!==key||!ui.saygiArticle||ui.saygiArticle.personId!==person.id){
    ui.saygiKey=key; ui.saygiPosition=null; ui.saygiArticle=null; ui.saygiError=null; ui.saygiLoading=false; ui.saygiReadReady=false; App.refreshSaygi(); focusModalDialog('sey-ov-card');
  }
  else { render(); focusModalDialog('sey-ov-card'); saygiReaderRestoreSaved(); }
};
App.openSaygiCollectionPerson=function(id){
  var person=saygiPersonById(id); if(!person) return;
  var key=saygiDayKey(person);
  ui.saygiBrowseId=person.id; ui.saygiPersonOpen=true; ui.saygiReadReady=false;
  if(ui.saygiKey!==key||!ui.saygiArticle){ ui.saygiKey=key; ui.saygiPosition=null; ui.saygiArticle=null; ui.saygiError=null; ui.saygiLoading=false; saygiLoadArticle(person,false); }
  render(); focusModalDialog('sey-ov-card'); saygiReaderRestoreSaved();
};
App.browseSaygiPerson=function(delta){
  var people=saygiPeople(), person=saygiModalPerson(); if(!people.length||!person) return;
  var idx=people.findIndex(function(x){ return x.id===person.id; }); if(idx<0) idx=0;
  App.openSaygiCollectionPerson(people[saygiPositiveMod(idx+(Number(delta)||0),people.length)].id);
};
App.closeSaygiPerson=function(){ var body=function(){ ui.saygiPersonOpen=false; ui.saygiBrowseId=null; ui.saygiRequestId=(ui.saygiRequestId||0)+1; ui.saygiReadReady=false; saygiDisconnectReadObserver(); render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.markSaygiRead=function(){
  var person=saygiModalPerson(), article=ui.saygiArticle;
  if(!person||!saygiArticleReadableFor(person,article)){ toast('Biyografi hazır olduğunda tekrar dene.'); return; }
  if(!ui.saygiReadReady&&!saygiHasRead(person)){ toast('Önce yazının sonuna kadar inelim; “Okudum” orada açılacak.'); return; }
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.reading||typeof day.reading!=='object') day.reading=emptyReading();
  if(!Array.isArray(day.reading.entries)) day.reading.entries=[];
  var existing=saygiReadingEntry(day,person), state=ensureSaygiDay(day);
  if(existing){
    state.personId=person.id; state.readingEntryId=existing.id; state.readAt=existing.ts||state.readAt||new Date().toISOString();
    syncDerivedHabits(day); save(); render(); toast('Bu biyografi bugünün “Ne okudum?” kaydında zaten var.'); return;
  }
  var entry={
    id:uid('saygi'), title:String(article.title||person.name).slice(0,120), author:'Wikipedia · Saygı', pages:0,
    minutes:saygiReadMinutes(article), note:('Saygı seçkisi · '+String(person.field||person.kind||'')).slice(0,240),
    source:'saygi', personId:person.id, saygiDate:todayStr(), sourceUrl:saygiSafeUrl(article.sourceUrl), sourceLabel:(article.lang==='tr'?'Türkçe Wikipedia':'English Wikipedia'), sourceImage:saygiSafeUrl(article.thumbnail,['upload.wikimedia.org']), ts:new Date().toISOString()
  };
  day.reading.entries.push(entry);
  state.personId=person.id; state.readingEntryId=entry.id; state.readAt=entry.ts; day.savedAt=entry.ts;
  try{ saygiMarkRead(person); }catch(e){}
  syncDerivedHabits(day); save(); haptic([10,24,10]); render();
  toast('Okudum kaydedildi · Zihnimi besledim tiki de seninle yeşerdi.',2800);
};
// AD-31: argüman alanı geriye dönük uyumlu genişledi — `false`/`true` eskisi gibi
// açık/koyu'yu SABİTLER, `'system'` cihaz temasını takip eder. Ad ve arity korunur (I2).
App.setTheme=function(d){
  themePref = (d==='system') ? 'system' : (d ? 'dark' : 'light');
  dark=resolveDark();
  // 'system' = anahtarın yokluğu (bkz. themePref başlatıcısı).
  try{ if(themePref==='system') localStorage.removeItem(TKEY); else localStorage.setItem(TKEY,themePref); }catch(e){}
  render();
};
App.toggleTheme=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } App.setTheme(!dark); };
App.toggleHabit=function(key){ return SEYMA_APP_SURFACE.toggleHabit.apply(null,arguments); };
App.toggleMgHabit=function(){ return SEYMA_APP_SURFACE.toggleMgHabit.apply(null,arguments); };
// Türetilmiş tik'e dokunulduğunda: eşik tutuyorsa sıcak onay, tutmuyorsa ne yapılacağını kibarca anlat.
App.explainDerivedHabit=function(key,day){ return SEYMA_APP_SURFACE.explainDerivedHabit.apply(null,arguments); };
function maybeStreak(){ var s=currentStreak(); var m={3:'3 gün oldu. Ritim kendini belli ediyor.',7:'7 gün. Bu artık tesadüf değil.',14:'14 gün. Tatlı lobisi toplantı yapıyor olabilir.',21:'21 gün! İlk büyük eşik.',30:'30 gün. Bir ay kesintisiz, bu ciddi iş.',50:'50 gün. Yarım yüz, tam disiplin.',100:'100 gün! Üç haneye geçtin.',200:'200 gün. Efsane modu.',365:'365 gün. Tam bir yıl.'}; var big={7:1,14:1,21:1,30:1,50:1,100:1,200:1,365:1,500:1,1000:1}; if(m[s]){ if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); if(window.SeyHaptics&&typeof window.SeyHaptics.streak==='function') window.SeyHaptics.streak(); if(big[s]) confetti(); if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ setTimeout(function(){ var el=document.querySelector('.sey-streak-area')||document.getElementById('app'); if(el) window.SeyFx.shimmer(el); },250); } setTimeout(function(){ toast(m[s],2800); },300); // FX-P-52: kilometre taşında kısa sesli tebrik — günde en fazla 1 kez.
  try{ if(data&&data.settings&&data.settings.voiceStreakDate!==todayStr()){ data.settings.voiceStreakDate=todayStr(); if(window.SeyAudio&&typeof window.SeyAudio.voice==='function') window.SeyAudio.voice('Harikasın! Serin büyüyor. Bu ritmi koru.', { lang:'tr-TR', rate:1 }); save(false); } }catch(e){} } }
App.setMood=function(id){ return SEYMA_APP_SURFACE.setMood.apply(null,arguments); };
App.onNote=function(el){ var v=el.value; clearTimeout(noteTimer); noteTimer=setTimeout(function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.note=v; var nw=syncDerivedHabits(day); save(false,{message:'Duygu notu güncellendi',meta:{section:'wellness',path:'data.days.*.note',operation:'update',summary:'Duygu notu güncellendi',detail:'Duygu notu',value:String(v||'').trim().slice(0,60),field:'note'}}); updateCardByKey('habits'); if(nw.indexOf('journaled')>=0){ haptic(14); toast('Duygu notu tiki kendiliğinden yeşillendi.'); } },500); };
App.onIntention=function(el){ var v=el.value; debounceSave('intention',function(){ var day=curDay(); day.intention=String(v||'').slice(0,140); day.savedAt=new Date().toISOString(); save(false,{message:'Günün niyeti güncellendi',meta:{section:'wellness',path:'data.days.*.intention',operation:'update',summary:'Günün niyeti güncellendi',detail:'Günün niyeti',value:day.intention,field:'intention'}}); },500); };
App.toggleHaptic=function(on){ if(!data.settings) data.settings={}; data.settings.haptics=!!on; if(on) haptic(18); save(); render(); };
// FX-P-57: sesli rehberlik ayar handler'ları — yalnız mevcut settings.* alanlarını
// yönetir; data şekli değişmez (I1). Konuşma hızı 0.75–1.5 aralığına kelepçelenir.
App.setVoiceGuidance=function(on){
  if(!data.settings) data.settings={};
  data.settings.voiceGuidance=!!on;
  // FX2-26: voiceLocalFallback varsayılan AÇIK — anahtar olmadan da ses çalışır
  // (yerel TTS). Anahtar yoksa nazikçe hatırlat: bulut (sinirsel) ses için anahtar
  // eklenebilir; yerel ses kapatılmışsa anahtar gerçekten gerekli. Tek seferlik.
  if(on && data.settings.voiceCloudTts && !(data.settings.openaiKey&&String(data.settings.openaiKey).trim())){
    toast(data.settings.voiceLocalFallback
      ? 'Sesli rehberlik açık — bulut sesi için Ayarlar → OpenAI anahtarı ekleyebilirsin'
      : 'Sesli rehberlik için Ayarlar → OpenAI anahtarı gerekli');
  }
  save(); render();
};
App.setVoiceLang=function(lang){ if(['tr-TR','en-US','ar-SA'].indexOf(lang)<0) return; if(!data.settings) data.settings={}; data.settings.voiceLang=lang; save(); render(); };
App.setVoiceRate=function(rate){ var v=Number(rate); if(isNaN(v)) return; v=Math.max(0.75,Math.min(1.5,v)); if(!data.settings) data.settings={}; data.settings.voiceRate=v; var lbl=document.getElementById('voice-rate-val'); if(lbl) lbl.textContent=(v===1?'1x':v+'x'); save(false); };
// FX-P-57: bulut TTS sinirsel ses seçimi. OpenAI gpt-4o-mini-tts'in desteklediği
// 13 ses; yalnız beyaz listeli değerleri kabul eder (I1: data şekli değişmez).
App.setVoiceCloudVoice=function(voice){
  var allowed=['alloy','ash','ballad','coral','echo','fable','juniper','marble','nova','onyx','sage','shimmer','verse'];
  if(allowed.indexOf(voice)<0) return;
  if(!data.settings) data.settings={};
  data.settings.voiceCloudVoice=voice;
  save(); render();
};
// FX-P-87: yerel TTS pitch (0.7–1.3) ve yerel ses adı. Mevcut setVoice* gövdeleri
// değişmeden YANINA additive eklendi (I2). Yerel ses yalnız voiceCloudTts kapalıyken
// devreye girdiği için kontroller kartta voiceCloudTts açıkken disabled görünür.
App.setVoicePitch=function(v){
  var x=parseFloat(v); if(isNaN(x)) return;
  if(!data.settings) data.settings={};
  data.settings.voicePitch=Math.min(1.3,Math.max(0.7,x));
  save(); render();
};
App.setVoiceVoiceName=function(v){
  if(typeof v!=='string') return;
  if(!data.settings) data.settings={};
  data.settings.voiceVoiceName=v||'';
  save(); render();
};
// FX-P-61: Premium FX boolean alanları için ortak toggle. Yalnız beyaz listeli
// settings.* anahtarlarını çevirir; data şekli değişmez (I1), App.* yüzeyine
// EKLEME (I2 uyumlu). Master switch kapatıldığında alt FX'ler gating'te otomatik
// sessizleşir (mediaFx/timeTheme), alanları tek tek sıfırlamaya gerek yok.
App.toggleSetting=function(key,value){
  var allowed={premiumAtmosphere:1,uiSounds:1,richHaptics:1,launchRitual:1,voiceGuidance:1,ambientSounds:1,voiceCloudTts:1};
  if(!allowed[key]||!data.settings) return;
  // `value` verilirse idempotent atama yapılır: segmentli Açık/Kapalı çiftinde her
  // iki düğme de aynı toggle'ı çağırdığı için "Kapalı"ya basmak anahtarı açabiliyordu.
  // Tek düğmeli alt satırlar `value` geçmez ve eskisi gibi çevirmeye devam eder.
  data.settings[key]=(value===undefined)?!data.settings[key]:!!value;
  if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function'&&data.settings.premiumAtmosphere) window.SeyHaptics.tap();
  // FX-P-53 bağlantısı: ambiyans toggle'ı çevrildiğinde motoru başlat/durdur.
  // `ambient.start()` kendi gating'ini (premiumAtmosphere + ambientSounds +
  // quiet-time + voiceBusy) uygular; burada yalnızca çağrı noktası sağlanır.
  if(key==='ambientSounds'){
    var amb=window.SeyAudio&&window.SeyAudio.ambient;
    if(amb){
      if(data.settings.ambientSounds) amb.start('rain');
      else amb.stop();
    }
  }
  // FX-P-55: launchRitual açıldığında splash'i anında göster (kullanıcıya
  // özelliğin canlı olduğunu hissettir); kapatıldığında gizle.
  if(key==='launchRitual'){
    var sp=document.getElementById('sey-splash');
    if(sp){
      if(data.settings.launchRitual){
        sp.style.display='flex';
        sp.style.opacity='1';
        setTimeout(hideSplash, 900);
      } else {
        sp.style.display='none';
      }
    }
  }
  save();
  render();
};
App.onMeal=function(key,el){ var v=el.value; debounceSave('meal-'+key,function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.meals[key]=v; day.savedAt=new Date().toISOString(); var mealLabels={kahvalti:'Kahvaltı',ara1:'Ara öğün',ogle:'Öğle yemeği',ara2:'Ara öğün',aksam:'Akşam yemeği',gece:'Gece atıştırması'}; save(false,{message:mealLabels[key]+' güncellendi',meta:{section:'nutrition',path:'data.days.*.meals.'+key,operation:'update',summary:mealLabels[key]+' güncellendi',detail:mealLabels[key]||key,value:v.slice(0,60),field:key}}); },500); };

// ---- öğün detay (tabak/gr/adet) ----
function mealItemEventMeta(key,day){ var mealLabels={kahvalti:'Kahvaltı',ara1:'Ara öğün',ogle:'Öğle yemeği',ara2:'Ara öğün',aksam:'Akşam yemeği',gece:'Gece atıştırması'}; var label=mealLabels[key]||key, text=String((day.meals&&day.meals[key])||'').trim(); return {section:'nutrition',path:'data.days.*.mealItems.'+key,operation:'update',summary:'Beslenme kaydı güncellendi',detail:label,value:text.slice(0,60),field:key}; }
App.addMealItem=function(key){ var day=curDay(); if(!day.mealItems[key]) day.mealItems[key]=[]; day.mealItems[key].push({name:'',qty:1,unit:'porsiyon'}); day.savedAt=new Date().toISOString(); commit(null,mealItemEventMeta(key,day)); setTimeout(function(){ var inp=document.querySelector('[data-meal="'+key+'"][data-idx="'+(day.mealItems[key].length-1)+'"]'); if(inp) inp.focus(); },40); };
App.removeMealItem=function(key,idx){ var day=curDay(); if(day.mealItems[key]&&day.mealItems[key][idx]!=null){ day.mealItems[key].splice(idx,1); syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(null,mealItemEventMeta(key,day)); } };
App.setMealItemName=function(key,idx,el){ var v=el.value; debounceSave('mi-'+key+'-'+idx,function(){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.name=v; syncMealText(day,key); day.savedAt=new Date().toISOString(); save(false,{message:'Beslenme kaydı güncellendi',meta:mealItemEventMeta(key,day)}); var sub=document.getElementById('meal-sub-'+key); if(sub){ var m=mealNutr(day,key); sub.textContent=Math.round(m.protein)+'g P · '+Math.round(m.calories)+' kcal'; } updateNutriLive(day); },350); };
App.setMealItemQty=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; var v=el.value===''?'':Number(el.value); it.qty=(v===''||isNaN(v))?'':v; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(null,mealItemEventMeta(key,day)); };
App.setMealItemUnit=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.unit=el.value; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(null,mealItemEventMeta(key,day)); };

// ---- su ----
App.waterAdd=function(n){ if (n>0 && window.SeyHaptics && typeof window.SeyHaptics.water === 'function') { window.SeyHaptics.water(); } var day=curDay(); var before=Number(day.water)||0; var v=before+n; day.water=Math.max(0,Math.min(20,v)); var nw=syncDerivedHabits(day); if(nw.indexOf('water')>=0){ var g=waterGoalCups(); haptic(16); toast('Su tamam — '+g+'/'+g+' bardak! Su tiki kendiliğinden yeşillendi.'); } day.savedAt=new Date().toISOString(); commit(null,{section:'nutrition',path:'data.days.*.water',operation:'update',summary:'Beslenme kaydı güncellendi',detail:'Su',value:String(day.water)+' bardak',field:'water'}); };

// ---- enerji / stres ----
App.setEnergy=function(v){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var day=curDay(); day.energy=(day.energy===v?null:v); day.savedAt=new Date().toISOString(); var labels={'1':'Düşük','2':'Az','3':'Orta','4':'Yüksek','5':'Zirve'}; haptic(10); save(false,{message:'Enerji seviyesi güncellendi',meta:{section:'wellness',path:'data.days.*.energy',operation:'update',summary:'Enerji seviyesi güncellendi',detail:'Enerji',value:labels[v]||v,field:'energy'}}); updateCardByKey('mood'); updateCardByKey('mental'); };
App.setStress=function(v){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var day=curDay(); day.stress=(day.stress===v?null:v); day.savedAt=new Date().toISOString(); var labels={'1':'Düşük','2':'Az','3':'Orta','4':'Yüksek','5':'Zirve'}; haptic(10); save(false,{message:'Stres seviyesi güncellendi',meta:{section:'wellness',path:'data.days.*.stress',operation:'update',summary:'Stres seviyesi güncellendi',detail:'Stres',value:labels[v]||v,field:'stress'}}); updateCardByKey('mood'); updateCardByKey('mental'); };

// ---- kafein ----
// ---- kafein (bilimsel takip: drinks dizisi) ----
App.addCaffeineDrink=function(typeId){ var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; var now=new Date(); var t=pad(now.getHours())+':'+pad(now.getMinutes()); day.caffeine.drinks.push({type:typeId,time:t,qty:1}); day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.caffeine.cups=day.caffeine.drinks.length; var nw=syncDerivedHabits(day); if(nw.indexOf('caffeineOk')>=0){ haptic(16); toast('Kafein tiki kendiliğinden yeşillendi — limit ve saat tamam.'); } else if(caffeineTotalMg(day)>caffeineLimit(activeDate())){ if(window.SeyAudio&&typeof window.SeyAudio.warning==='function') window.SeyAudio.warning(); } day.savedAt=new Date().toISOString(); commit(); };
App.removeCaffeineDrink=function(i){ var day=curDay(); if(!day.caffeine||!Array.isArray(day.caffeine.drinks)) return; if(day.caffeine.drinks[i]==null) return; day.caffeine.drinks.splice(i,1); day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.caffeine.cups=day.caffeine.drinks.length; day.savedAt=new Date().toISOString(); commit(); };
App.setCaffeineDrinkTime=function(i,el){ var day=curDay(); if(!day.caffeine||!Array.isArray(day.caffeine.drinks)) return; var d=day.caffeine.drinks[i]; if(!d) return; d.time=el.value||''; day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.savedAt=new Date().toISOString(); commit(); };
App.setCaffeineMode=function(m){ if(!data.settings) data.settings={}; data.settings.caffeineMode=(m==='sensitive'||m==='pregnant')?m:'standard'; data.savedAt=new Date().toISOString(); haptic(10); commit(); };
App.setTargetBed=function(el){ if(!data.settings) data.settings={}; var v=el.value||''; if(/^\d{2}:\d{2}$/.test(v)) data.settings.targetBed=v; data.savedAt=new Date().toISOString(); commit(); };
// legacy (eski veri/panel uyumu için hâlâ çağrılabilir)
App.setCaffeineTime=function(el){ var v=el.value; var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; if(day.caffeine.drinks.length){ var last=day.caffeine.drinks[day.caffeine.drinks.length-1]; last.time=v||null; } day.caffeine.last=v||null; day.savedAt=new Date().toISOString(); commit(); };
App.caffeineCups=function(n){ var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null,drinks:[]}; if(!Array.isArray(day.caffeine.drinks)) day.caffeine.drinks=[]; var v=(Number(day.caffeine.cups)||0)+n; v=Math.max(0,Math.min(15,v)); var cur=day.caffeine.drinks.length; if(v>cur){ for(var i=cur;i<v;i++){ day.caffeine.drinks.push({type:'turk',time:day.caffeine.last||'09:00',qty:1}); } } else if(v<cur){ day.caffeine.drinks.length=v; } day.caffeine.cups=v; day.caffeine.last=caffeineLastTime({caffeine:day.caffeine}); day.savedAt=new Date().toISOString(); commit(); };

// ---- health (sleep / walk) actions: number inputs save without re-render to keep focus ----
App.setSleepHours=function(el){ var raw=el.value; debounceSave('sleepH',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.sleep.hours=(v==null||isNaN(v))?null:v; var nw=syncDerivedHabits(day); if(nw.indexOf('sleepReg')>=0){ haptic(16); toast('Uyku tiki kendiliğinden yeşillendi. 7,5+ saat, tam dinlenme.'); } day.savedAt=new Date().toISOString(); save(false,{message:'Uyku süresi güncellendi',meta:{section:'sleep',path:'data.days.*.sleep.hours',operation:'update',summary:'Uyku/beden kaydı güncellendi',detail:'Uyku süresi',value:day.sleep.hours!=null?String(day.sleep.hours)+' saat':'',field:'sleepHours'}}); }); };
App.setSleepQuality=function(id){ var day=curDay(); day.sleep.quality=(day.sleep.quality===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMed=function(type){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.type=(day.sleep.med.type===type?null:type); if(day.sleep.med.type!=='herbal'&&day.sleep.med.type!=='rx') day.sleep.med.note=''; day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMedNote=function(el){ var v=el.value; debounceSave('sleepMedNote',function(){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.note=v; day.savedAt=new Date().toISOString(); save(); },300); };
App.openReading=function(options){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var preserve=options&&options.preserveDraft===true; ui.readingOpen=true; if(!preserve) ui.readingView='today'; if(!preserve) ui.logBookId=null; if(!preserve||!ui.readingDraft) ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; reminderLockBodyScroll(); render(); focusModalDialog('sey-ov-card'); };
App.closeReading=function(){ var body=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var targetFocusId=ui.reminderTargetReturnFocusId; reminderUnlockBodyScroll(); ui.readingOpen=false; ui.readingDraft=null; ui.bookEdit=null; ui.quoteDraft=null; ui.logBookId=null; ui.reminderTargetReturnFocusId=''; render(); if(targetFocusId) reminderRestoreFocus(targetFocusId,''); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.kaoOpen=function(view){ return window.SeymaQuranLearn.kaoOpen.apply(null,arguments); }; App.kaoClose=function(){ return window.SeymaQuranLearn.kaoClose.apply(null,arguments); }; App.kaoSetView=function(v){ return window.SeymaQuranLearn.kaoSetView.apply(null,arguments); }; App.kaoStart=function(){ return window.SeymaQuranLearn.kaoStart.apply(null,arguments); }; App.kaoAnswer=function(taskId,choiceId){ return window.SeymaQuranLearn.kaoAnswer.apply(null,arguments); }; App.kaoUndo=function(){ return window.SeymaQuranLearn.kaoUndo.apply(null,arguments); }; App.kaoPlay=function(clipId,style){ return window.SeymaQuranLearn.kaoPlay.apply(null,arguments); }; App.kaoOpenWord=function(lemmaId){ return window.SeymaQuranLearn.kaoOpenWord.apply(null,arguments); }; App.kaoWordLayer=function(n){ return window.SeymaQuranLearn.kaoWordLayer.apply(null,arguments); }; App.kaoFlag=function(cardId,kind){ return window.SeymaQuranLearn.kaoFlag.apply(null,arguments); }; App.kaoGate=function(action,value){ return window.SeymaQuranLearn.kaoGate.apply(null,arguments); }; App.kaoOpenSurah=function(sid){ return window.SeymaQuranLearn.kaoOpenSurah.apply(null,arguments); }; App.kaoRevealWord=function(i){ return window.SeymaQuranLearn.kaoRevealWord.apply(null,arguments); }; App.kaoMarkUnderstood=function(){ return window.SeymaQuranLearn.kaoMarkUnderstood.apply(null,arguments); }; App.kaoSetDailyNew=function(n){ return window.SeymaQuranLearn.kaoSetDailyNew.apply(null,arguments); }; App.kaoSetAudioStyle=function(style){ return window.SeymaQuranLearn.kaoSetAudioStyle.apply(null,arguments); }; App.kaoToggleHarakat=function(){ return window.SeymaQuranLearn.kaoToggleHarakat.apply(null,arguments); }; App.kaoToggleFade=function(){ return window.SeymaQuranLearn.kaoToggleFade.apply(null,arguments); }; App.kaoSetTranslit=function(layer){ return window.SeymaQuranLearn.kaoSetTranslit.apply(null,arguments); }; App.kaoSetReadability=function(key,value){ return window.SeymaQuranLearn.kaoSetReadability.apply(null,arguments); }; App.kaoReopenGate=function(){ return window.SeymaQuranLearn.kaoReopenGate.apply(null,arguments); }; App.kaoExportCsv=function(){ return window.SeymaQuranLearn.kaoExportCsv.apply(null,arguments); }; App.kaoOpenPhonics=function(letterId){ return window.SeymaQuranLearn.kaoOpenPhonics.apply(null,arguments); }; App.kaoPhonics=function(action,value){ return window.SeymaQuranLearn.kaoPhonics.apply(null,arguments); }; App.setReadingView=function(v){ ui.readingView=v; ui.bookEdit=null; ui.quoteDraft=null; render(); };
App.onReadingField=function(field,el){ if(!ui.readingDraft) ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.readingDraft[field]=el.value; };
App.pickLogBook=function(id){ var b=findBook(id); if(!b) return; ui.logBookId=(ui.logBookId===id?null:id); if(ui.logBookId){ if(!ui.readingDraft) ui.readingDraft={}; ui.readingDraft.title=b.title; ui.readingDraft.author=b.author; } render(); };
function bumpBookProgress(book,addPages){ if(!book) return false; if(addPages>0){ book.currentPage=Math.max(0,book.currentPage+addPages); if(book.totalPages&&book.totalPages>0) book.currentPage=Math.min(book.currentPage,book.totalPages); } if(!book.startedAt) book.startedAt=new Date().toISOString(); if(book.status==='reading'&&book.totalPages&&book.totalPages>0&&book.currentPage>=book.totalPages){ book.status='finished'; book.finishedAt=new Date().toISOString(); return true; } return false; }
App.addReading=function(){
  var d=ui.readingDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce kitabın adını yaz'); var ti=document.getElementById('reading-title'); if(ti) ti.focus(); return; }
  var pages=parseInt(d.pages,10); if(isNaN(pages)||pages<0) pages=0;
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var bookId=ui.logBookId||null; var justFinished=false;
  if(bookId){ var bk=findBook(bookId); if(bk){ justFinished=bumpBookProgress(bk,pages); } else bookId=null; }
  var entry={ id:uid('r'), title:title.slice(0,120), author:String(d.author||'').trim().slice(0,80), pages:pages, minutes:minutes, note:String(d.note||'').trim().slice(0,240), bookId:bookId, ts:new Date().toISOString() };
  if(!entry.bookId){ var linkedBook=syncEntryToLibrary(entry); if(linkedBook && pages>0){ justFinished=bumpBookProgress(linkedBook,pages); } }
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.reading||typeof day.reading!=='object') day.reading=emptyReading();
  if(!Array.isArray(day.reading.entries)) day.reading.entries=[];
  day.reading.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.logBookId=null;
  if(justFinished){ commit(); toast('Kitabı bitirdin!'); confetti(); } else commit('Okuma kaydedildi');
};
App.removeReading=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.reading&&Array.isArray(day.reading.entries)){ var i=day.reading.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.reading.entries[i]; if(e&&e.bookId&&e.pages>0){ var bk=findBook(e.bookId); if(bk){ bk.currentPage=Math.max(0,bk.currentPage-e.pages); if(bk.status==='finished'&&bk.totalPages&&bk.currentPage<bk.totalPages){ bk.status='reading'; bk.finishedAt=null; } } } day.reading.entries.splice(i,1); if(e&&e.source==='saygi'&&day.saygi&&day.saygi.readingEntryId===id) day.saygi=emptySaygi(); syncDerivedHabits(day); day.savedAt=new Date().toISOString(); commit('Okuma kaydı silindi'); } }
};
// ---- kitap CRUD ----
App.openBookEdit=function(id){ ensureLibrary(); ui.bookEdit = id ? clone(findBook(id)||{}) : {id:'',title:'',author:'',genre:'',emoji:'',totalPages:'',currentPage:0,status:'reading',rating:null,quotes:[]}; render(); focusModalDialog('sey-compact-modal'); };
App.closeBookEdit=function(){ ui.bookEdit=null; render(); };
App.onBookEditField=function(field,el){ if(!ui.bookEdit) return; ui.bookEdit[field]=el.value; };
App.pickBookEmoji=function(e){ if(!ui.bookEdit) return; ui.bookEdit.emoji=e; render(); };
App.pickBookGenre=function(g){ if(!ui.bookEdit) return; ui.bookEdit.genre=(ui.bookEdit.genre===g?'':g); render(); };
App.saveBook=function(){ if(!ui.bookEdit) return; var L=ensureLibrary(); var b=ui.bookEdit; var title=String(b.title||'').trim(); if(!title){ toast('Kitabın adını yaz'); return; } if(b.id){ var ex=findBook(b.id); if(ex){ ex.title=title.slice(0,120); ex.author=String(b.author||'').trim().slice(0,80); ex.genre=String(b.genre||''); ex.emoji=b.emoji||''; ex.totalPages=(b.totalPages===''||b.totalPages==null)?null:Math.max(0,Math.round(Number(b.totalPages)||0)); ex.status=b.status||'reading'; normBook(ex); if(ex.totalPages) ex.currentPage=Math.min(ex.currentPage,ex.totalPages); } } else { var nb=normBook({title:title,author:String(b.author||'').trim(),genre:String(b.genre||''),emoji:b.emoji||'',totalPages:b.totalPages,currentPage:0,status:b.status||'reading',startedAt:new Date().toISOString()}); L.books.unshift(nb); } ui.bookEdit=null; commit('Kitaplığa eklendi'); };
App.deleteBook=function(id){ var L=ensureLibrary(); var i=L.books.findIndex(function(b){ return b&&b.id===id; }); if(i>=0){ L.books.splice(i,1); } ui.bookEdit=null; commit('Kitap silindi'); };
App.setBookStatus=function(id,st){ var b=findBook(id); if(!b) return; b.status=st; if(st==='finished'){ if(!b.finishedAt) b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; } else { b.finishedAt=null; } commit(); };
App.rateBook=function(id,n){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var b=findBook(id); if(!b) return; b.rating=(b.rating===n?null:n); commit(); };
App.advanceBook=function(id,delta){ var b=findBook(id); if(!b) return; var fin=bumpBookProgress(b,delta>0?delta:0); if(delta<0){ b.currentPage=Math.max(0,b.currentPage+delta); if(b.status==='finished'&&b.totalPages&&b.currentPage<b.totalPages){ b.status='reading'; b.finishedAt=null; } } if(fin){ commit(); toast('Kitabı bitirdin!'); confetti(); } else commit(); };
App.setBookPage=function(id,el){ var b=findBook(id); if(!b) return; var raw=el.value; debounceSave('bookpage_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(b.totalPages) v=Math.min(v,b.totalPages); b.currentPage=v; if(b.status==='reading'&&b.totalPages&&v>=b.totalPages){ b.status='finished'; b.finishedAt=new Date().toISOString(); save(); render(); toast('Kitabı bitirdin!'); confetti(); return; } save(); render(); },500); };
App.finishBook=function(id){ var b=findBook(id); if(!b) return; b.status='finished'; b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; if(!b.startedAt) b.startedAt=new Date().toISOString(); commit(); toast('Kitabı bitirdin!'); confetti(); };
App.reopenBook=function(id){ var b=findBook(id); if(!b) return; b.status='reading'; b.finishedAt=null; commit(); };
App.setReadGoal=function(field,el){ var L=ensureLibrary(); var raw=el.value; debounceSave('readgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); L.goal[field]=v; save(); render(); },500); };
// ---- alıntılar ----
App.openQuoteAdd=function(bookId){ var L=ensureLibrary(); if(!bookId){ var reading=L.books.filter(function(b){return b.status!=='dropped';}); bookId=(reading[0]&&reading[0].id)||(L.books[0]&&L.books[0].id)||''; } ui.quoteDraft={bookId:bookId,text:'',page:''}; render(); focusModalDialog('sey-compact-modal'); };
App.closeQuoteAdd=function(){ ui.quoteDraft=null; render(); };
App.onQuoteField=function(field,el){ if(!ui.quoteDraft) return; ui.quoteDraft[field]=el.value; };
App.pickQuoteBook=function(id){ if(!ui.quoteDraft) return; ui.quoteDraft.bookId=id; render(); };
App.saveQuote=function(){ if(!ui.quoteDraft) return; var b=findBook(ui.quoteDraft.bookId); if(!b){ if(window.SeyAudio&&typeof window.SeyAudio.warning==='function') window.SeyAudio.warning(); toast('Önce bir kitap seç'); return; } var text=String(ui.quoteDraft.text||'').trim(); if(!text){ if(window.SeyAudio&&typeof window.SeyAudio.warning==='function') window.SeyAudio.warning(); toast('Alıntıyı yaz'); return; } var page=parseInt(ui.quoteDraft.page,10); if(isNaN(page)||page<0) page=null; if(!Array.isArray(b.quotes)) b.quotes=[]; b.quotes.push({id:uid('q'),text:text.slice(0,400),page:page,ts:new Date().toISOString()}); ui.quoteDraft=null; commit('Alıntı eklendi'); };
App.removeQuote=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var i=b.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ b.quotes.splice(i,1); commit('Alıntı silindi'); } };
App.copyQuote=function(text){ try{ navigator.clipboard.writeText(text); toast('Kopyalandı'); }catch(e){ toast('Kopyalanamadı'); } };
App.toggleHealthSetup=function(){ ui.healthSetupOpen=!ui.healthSetupOpen; render(); };
// Bearer jetonu ekrana hiç basılmadan (HTML'e gömülmeden), tıklanınca doğrudan panoya kopyalanır.
App.copyHealthStarter=function(){ App.copyQuote('{"date":"","steps":0,"walkM":0,"updatedAt":""}'); };
App.copyHealthUrl=function(){ var sg=data.settings||{}; var gid=(sg.healthGistId||'').trim(); if(!gid){ toast('Önce yukarıya Gist ID\'yi yapıştır'); return; } App.copyQuote('https://api.github.com/gists/'+gid); };
App.copyHealthAuth=function(){ var sg=data.settings||{}; if(!sg.ghToken){ toast('Önce Ayarlar\'dan repoya bağlan'); return; } App.copyQuote('Bearer '+sg.ghToken); };
App.copyHealthTemplate=function(){ App.copyQuote('{"date":"[Şimdiki Tarih]","steps":[Adım Sayısı],"walkM":[Mesafe],"updatedAt":"[Şimdiki Tarih]"}'); };
App.copyQuoteById=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var q=b.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+b.title+(q.page?', s.'+q.page:''); App.copyQuote(txt); };
App.copyReplicaById=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var q=t.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+t.title; App.copyQuote(txt); };

// ================= NE İZLEDİM =================
App.openWatching=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } ui.watchOpen=true; ui.watchView='today'; ui.logItemId=null; ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; render(); focusModalDialog('sey-ov-card'); };
App.closeWatching=function(){ var body=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } ui.watchOpen=false; ui.watchDraft=null; ui.titleEdit=null; ui.replicaDraft=null; ui.logItemId=null; render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.setWatchView=function(v){ ui.watchView=v; ui.titleEdit=null; ui.replicaDraft=null; render(); };
App.onWatchField=function(field,el){ if(!ui.watchDraft) ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; ui.watchDraft[field]=el.value; };
App.setWatchDraftKind=function(k){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.kind=k; render(); };
App.pickLogTitle=function(id){ var t=findTitle(id); if(!t) return; ui.logItemId=(ui.logItemId===id?null:id); if(ui.logItemId){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.title=t.title; ui.watchDraft.kind=t.kind; } render(); };
function bumpTitleProgress(item,addEps){ if(!item) return false; if(item.kind==='dizi'){ if(addEps>0){ item.watchedEp=Math.max(0,item.watchedEp+addEps); if(item.totalEp&&item.totalEp>0) item.watchedEp=Math.min(item.watchedEp,item.totalEp); } } else { item.watchedEp=1; } if(!item.startedAt) item.startedAt=new Date().toISOString(); if(item.status==='watching'){ if(item.kind==='film'){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } if(item.totalEp&&item.totalEp>0&&item.watchedEp>=item.totalEp){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } } return false; }
App.addWatching=function(){
  var d=ui.watchDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce yapımın adını yaz'); var ti=document.getElementById('watch-title'); if(ti) ti.focus(); return; }
  var kind=(d.kind==='dizi')?'dizi':'film';
  var episodes=parseInt(d.episodes,10); if(isNaN(episodes)||episodes<0) episodes=(kind==='dizi'?1:null);
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logItemId||null; var justFinished=false;
  if(itemId){ var it=findTitle(itemId); if(it){ justFinished=bumpTitleProgress(it,episodes||0); } else itemId=null; }
  var entry={ id:uid('we'), title:title.slice(0,120), kind:kind, episodes:episodes, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  if(!entry.itemId){ var linkedTitle=syncEntryToWatchlist(entry); if(linkedTitle){ justFinished=bumpTitleProgress(linkedTitle,kind==='dizi'?(episodes||0):1); } }
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.watching||typeof day.watching!=='object') day.watching=emptyWatching();
  if(!Array.isArray(day.watching.entries)) day.watching.entries=[];
  day.watching.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.watchDraft={title:'',kind:kind,episodes:'',minutes:'',note:''}; ui.logItemId=null;
  if(justFinished){ commit(); toast('Bitirdin!'); confetti(); } else commit('İzleme kaydedildi');
};
App.removeWatching=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.watching&&Array.isArray(day.watching.entries)){ var i=day.watching.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.watching.entries[i]; if(e&&e.itemId&&e.kind==='dizi'&&e.episodes>0){ var it=findTitle(e.itemId); if(it){ it.watchedEp=Math.max(0,it.watchedEp-e.episodes); if(it.status==='finished'&&it.totalEp&&it.watchedEp<it.totalEp){ it.status='watching'; it.finishedAt=null; } } } day.watching.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('İzleme kaydı silindi'); } }
};
// ---- yapım CRUD ----
App.openTitleEdit=function(id){ ensureWatchlist(); ui.titleEdit = id ? clone(findTitle(id)||{}) : {id:'',title:'',kind:'film',genre:'',emoji:'',totalEp:'',watchedEp:0,status:'watching',rating:null,quotes:[]}; render(); focusModalDialog('sey-compact-modal'); };
App.closeTitleEdit=function(){ ui.titleEdit=null; render(); };
App.onTitleEditField=function(field,el){ if(!ui.titleEdit) return; ui.titleEdit[field]=el.value; };
App.pickTitleEmoji=function(e){ if(!ui.titleEdit) return; ui.titleEdit.emoji=e; render(); };
App.setTitleEditKind=function(k){ if(!ui.titleEdit) return; ui.titleEdit.kind=k; render(); };
App.pickTitleGenre=function(g){ if(!ui.titleEdit) return; ui.titleEdit.genre=(ui.titleEdit.genre===g?'':g); render(); };
App.saveTitle=function(){ if(!ui.titleEdit) return; var W=ensureWatchlist(); var t=ui.titleEdit; var title=String(t.title||'').trim(); if(!title){ toast('Yapımın adını yaz'); return; } if(t.id){ var ex=findTitle(t.id); if(ex){ ex.title=title.slice(0,120); ex.kind=(t.kind==='dizi'?'dizi':'film'); ex.genre=String(t.genre||''); ex.emoji=t.emoji||''; ex.totalEp=(t.totalEp===''||t.totalEp==null)?null:Math.max(0,Math.round(Number(t.totalEp)||0)); ex.status=t.status||'watching'; normTitle(ex); if(ex.totalEp) ex.watchedEp=Math.min(ex.watchedEp,ex.totalEp); } } else { var nt=normTitle({title:title,kind:(t.kind==='dizi'?'dizi':'film'),genre:String(t.genre||''),emoji:t.emoji||'',totalEp:t.totalEp,watchedEp:0,status:t.status||'watching',startedAt:new Date().toISOString()}); W.items.unshift(nt); } ui.titleEdit=null; commit('Arşive eklendi'); };
App.deleteTitle=function(id){ var W=ensureWatchlist(); var i=W.items.findIndex(function(t){ return t&&t.id===id; }); if(i>=0){ W.items.splice(i,1); } ui.titleEdit=null; commit('Yapım silindi'); };
App.setTitleStatus=function(id,st){ var t=findTitle(id); if(!t) return; t.status=st; if(st==='finished'){ if(!t.finishedAt) t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; } else { t.finishedAt=null; } commit(); };
App.rateTitle=function(id,n){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var t=findTitle(id); if(!t) return; t.rating=(t.rating===n?null:n); commit(); };
App.advanceTitle=function(id,delta){ var t=findTitle(id); if(!t) return; var fin=false; if(delta>0){ fin=bumpTitleProgress(t,delta); } else { t.watchedEp=Math.max(0,t.watchedEp+delta); if(t.status==='finished'&&t.totalEp&&t.watchedEp<t.totalEp){ t.status='watching'; t.finishedAt=null; } } if(fin){ commit(); toast('Diziyi bitirdin!'); confetti(); } else commit(); };
App.setTitleEp=function(id,el){ var t=findTitle(id); if(!t) return; var raw=el.value; debounceSave('titleep_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(t.totalEp) v=Math.min(v,t.totalEp); t.watchedEp=v; if(t.status==='watching'&&t.totalEp&&v>=t.totalEp){ t.status='finished'; t.finishedAt=new Date().toISOString(); save(); render(); toast('Diziyi bitirdin!'); confetti(); return; } save(); render(); },500); };
App.finishTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='finished'; t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; else if(t.kind==='film') t.watchedEp=1; if(!t.startedAt) t.startedAt=new Date().toISOString(); commit(); toast('Bitirdin!'); confetti(); };
App.reopenTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='watching'; t.finishedAt=null; commit(); };
App.setWatchGoal=function(field,el){ var W=ensureWatchlist(); var raw=el.value; debounceSave('watchgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); W.goal[field]=v; save(); render(); },500); };
// ---- replikler ----
App.openReplicaAdd=function(itemId){ var W=ensureWatchlist(); if(!itemId){ var act=W.items.filter(function(t){return t.status!=='dropped';}); itemId=(act[0]&&act[0].id)||(W.items[0]&&W.items[0].id)||''; } ui.replicaDraft={itemId:itemId,text:''}; render(); focusModalDialog('sey-compact-modal'); };
App.closeReplicaAdd=function(){ ui.replicaDraft=null; render(); };
App.onReplicaField=function(field,el){ if(!ui.replicaDraft) return; ui.replicaDraft[field]=el.value; };
App.pickReplicaTitle=function(id){ if(!ui.replicaDraft) return; ui.replicaDraft.itemId=id; render(); };
App.saveReplica=function(){ if(!ui.replicaDraft) return; var t=findTitle(ui.replicaDraft.itemId); if(!t){ toast('Önce bir yapım seç'); return; } var text=String(ui.replicaDraft.text||'').trim(); if(!text){ toast('Repliği yaz'); return; } if(!Array.isArray(t.quotes)) t.quotes=[]; t.quotes.push({id:uid('wq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.replicaDraft=null; commit('Replik eklendi'); };
App.removeReplica=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var i=t.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ t.quotes.splice(i,1); commit('Replik silindi'); } };

// ================= NE DİNLEDİM =================
App.openListening=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } ui.listeningOpen=true; ui.listeningView='today'; ui.logTrackId=null; ui.trackEdit=null; ui.lyricDraft=null; if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; render(); focusModalDialog('sey-ov-card'); };
App.closeListening=function(){ var body=function(){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } ui.listeningOpen=false; ui.listeningDraft=null; ui.trackEdit=null; ui.lyricDraft=null; ui.logTrackId=null; render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.setListeningView=function(v){ ui.listeningView=v; ui.trackEdit=null; ui.lyricDraft=null; render(); };
App.onListeningField=function(field,el){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft[field]=el.value; };
App.setListenDraftKind=function(k){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; render(); };
App.pickLogTrack=function(id){ var x=findTrack(id); if(!x) return; if(ui.logTrackId===id){ ui.logTrackId=null; } else { ui.logTrackId=id; if(!ui.listeningDraft) ui.listeningDraft={}; ui.listeningDraft.title=x.title; ui.listeningDraft.artist=x.artist; ui.listeningDraft.kind=x.kind; } render(); };
App.addListening=function(){
  var d=ui.listeningDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce ne dinlediğini yaz'); var ti=document.getElementById('listening-title'); if(ti) ti.focus(); return; }
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logTrackId||null; if(itemId&&!findTrack(itemId)) itemId=null;
  var entry={ id:uid('l'), title:title.slice(0,120), artist:String(d.artist||'').trim().slice(0,80), kind:kind, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  if(!entry.itemId){ syncEntryToMusic(entry); }
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.listening||typeof day.listening!=='object') day.listening=emptyListening();
  if(!Array.isArray(day.listening.entries)) day.listening.entries=[];
  day.listening.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.listeningDraft={title:'',artist:'',kind:kind,minutes:'',note:''}; ui.logTrackId=null;
  commit('Dinleme kaydedildi');
};
App.removeListening=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day.listening&&Array.isArray(day.listening.entries)){ var i=day.listening.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ day.listening.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Dinleme kaydı silindi'); } } };
// ---- favori CRUD ----
App.openTrackEdit=function(id){ ensureMusic(); ui.trackEdit = id ? clone(findTrack(id)||{}) : {id:'',title:'',artist:'',kind:'sarki',genre:'',emoji:'',rating:null,quotes:[]}; render(); focusModalDialog('sey-compact-modal'); };
App.closeTrackEdit=function(){ ui.trackEdit=null; render(); };
App.onTrackEditField=function(field,el){ if(!ui.trackEdit) return; ui.trackEdit[field]=el.value; };
App.pickTrackEmoji=function(e){ if(!ui.trackEdit) return; ui.trackEdit.emoji=e; render(); };
App.setTrackEditKind=function(k){ if(!ui.trackEdit) return; ui.trackEdit.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; render(); };
App.pickTrackGenre=function(g){ if(!ui.trackEdit) return; ui.trackEdit.genre=(ui.trackEdit.genre===g?'':g); render(); };
App.saveTrack=function(){ if(!ui.trackEdit) return; var M=ensureMusic(); var x=ui.trackEdit; var title=String(x.title||'').trim(); if(!title){ toast('Adını yaz'); return; } if(x.id){ var ex=findTrack(x.id); if(ex){ ex.title=title.slice(0,120); ex.artist=String(x.artist||'').trim().slice(0,80); ex.kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki'; ex.genre=String(x.genre||''); ex.emoji=x.emoji||''; normTrack(ex); } } else { var nx=normTrack({title:title,artist:String(x.artist||'').trim(),kind:x.kind,genre:String(x.genre||''),emoji:x.emoji||''}); M.items.unshift(nx); } ui.trackEdit=null; commit('Favorilere eklendi'); };
App.deleteTrack=function(id){ var M=ensureMusic(); var i=M.items.findIndex(function(x){ return x&&x.id===id; }); if(i>=0){ M.items.splice(i,1); } ui.trackEdit=null; commit('Favori silindi'); };
App.rateTrack=function(id,n){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } var x=findTrack(id); if(!x) return; x.rating=(x.rating===n?null:n); commit(); };
App.setListenGoal=function(field,el){ var M=ensureMusic(); var raw=el.value; debounceSave('listengoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); M.goal[field]=v; save(); render(); },500); };
// ---- favori sözler ----
App.openLyricAdd=function(itemId){ var M=ensureMusic(); if(!itemId){ itemId=(M.items[0]&&M.items[0].id)||''; } ui.lyricDraft={itemId:itemId,text:''}; render(); focusModalDialog('sey-compact-modal'); };
App.closeLyricAdd=function(){ ui.lyricDraft=null; render(); };
App.onLyricField=function(field,el){ if(!ui.lyricDraft) return; ui.lyricDraft[field]=el.value; };
App.pickLyricTrack=function(id){ if(!ui.lyricDraft) return; ui.lyricDraft.itemId=id; render(); };
App.saveLyric=function(){ if(!ui.lyricDraft) return; var x=findTrack(ui.lyricDraft.itemId); if(!x){ toast('Önce bir favori seç'); return; } var text=String(ui.lyricDraft.text||'').trim(); if(!text){ toast('Sözü yaz'); return; } if(!Array.isArray(x.quotes)) x.quotes=[]; x.quotes.push({id:uid('lq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.lyricDraft=null; commit('Söz eklendi'); };
App.removeLyric=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var i=x.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ x.quotes.splice(i,1); commit('Söz silindi'); } };
App.copyLyricById=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var q=x.quotes.find(function(z){return z&&z.id===qid;}); if(!q) return; App.copyQuote('“'+q.text+'”\n— '+x.title+(x.artist?', '+x.artist:'')); };

// ================= İLHAM & İBADET: ZİKİRMATİK (Faz 35) =================
var _zikrWakeLock=null;
function zikrSyncWakeLock(){
  var want=!!(ui.zikrOpen&&ensureZikrRoot().settings.keepAwake);
  if(!want){
    if(_zikrWakeLock&&_zikrWakeLock.release){ try{ _zikrWakeLock.release(); }catch(e){} }
    _zikrWakeLock=null; return;
  }
  try{
    if(_zikrWakeLock||!navigator.wakeLock||!navigator.wakeLock.request) return;
    navigator.wakeLock.request('screen').then(function(lock){ _zikrWakeLock=lock; if(lock&&lock.addEventListener) lock.addEventListener('release',function(){ _zikrWakeLock=null; }); }).catch(function(){ _zikrWakeLock=null; });
  }catch(e){ _zikrWakeLock=null; }
}
var _zikrCompleteFlash=false;
var ZIKR_RING_RADIUS=108;
// ZP-03: saf matematik fonksiyonları doğrudan test edilebilir olsun diye App
// üzerinden de erişilebilir kılınır (App.scoreProfileAssessmentQuality'deki
// "pure functions exposed on App.* purely for direct testability" deseniyle
// aynı). Üretim davranışını değiştirmez; hiçbiri state/DOM'a dokunmaz.
App.zikrMath=zikrMath;
App.zikrBaseTarget=zikrBaseTarget;
App.zikrHatimTarget=zikrHatimTarget;
App.zikrInt=zikrInt;
App.zikrSessionState=zikrSessionState; // ZP-05: durum makinesi doğrudan test edilebilir
// ZP-09 madde 4: body scroll lock, Zikirmatik modal yaşam döngüsüne bağlı.
// #app zaten overflow:hidden ama iOS Safari'de position:fixed overlay'lerin
// arkasında yine de rubber-band scroll sızabiliyor; bu, önceki değeri
// koruyup açılışta kilitleyen/kapanışta geri yükleyen açık bir kilit.
var _zikrBodyLocked=false, _zikrBodyPrevOverflow='';
function zikrUnlockBodyScroll(){ return window.SeymaZikr.zikrUnlockBodyScroll.apply(null,arguments); }
App.openZikr=function(){ return window.SeymaZikr.openZikr.apply(null,arguments); };
App.closeZikr=function(){ return window.SeymaZikr.closeZikr.apply(null,arguments); };
App.setZikrView=function(v){ return window.SeymaZikr.setZikrView.apply(null,arguments); };
App.toggleZikrDetail=function(){ return window.SeymaZikr.toggleZikrDetail.apply(null,arguments); };
App.onZikrKeydown=function(e){ return window.SeymaZikr.onZikrKeydown.apply(null,arguments); };
App.zikrTap=function(){ return window.SeymaZikr.zikrTap.apply(null,arguments); };
App.zikrUndo=function(){ return window.SeymaZikr.zikrUndo.apply(null,arguments); };
App.setZikrPreset=function(id){ var z=ensureZikrRoot(), found=false; for(var i=0;i<z.presets.length;i++) if(z.presets[i].id===id){ found=true; break; } if(!found) return; zikrPauseSession(); z.settings.activePresetId=id; ui.zikrView='counter'; ui.zikrDetailOpen=false; ui.zikrResetPending=false; ui.zikrResetPresetId=''; ui.zikrLastReset=null; ui.zikrActionNote=''; ui.zikrManualOpen=false; ui.zikrManualDraft=null; ui.zikrManualPresetId=''; ui.zikrNotePresetId=''; ui.zikrNoteDraft=null; ui.zikrNoteStatus=''; save(); if(!zikrPaintView('counter')) render(); };

// ── ZP-10 · Manuel zikir: çekirdek uygulama/geri alma ──
// zikrTouchTick ile AYNI sayaç kanallarını kullanır (tek doğruluk kaynağı
// korunur), ama artış miktarı dokunuş sayısı değil kullanıcı girdisidir.
// Atomik: tek çağrıda journey+hatim+gün+streak güncellenir, sonra save().
App.zikrManualActive=zikrManualActive;
App.zikrManualApply=function(presetId,amount,date,note){ return zikrManualApply(presetId,amount,date,note); };
App.setZikrPresetFilter=function(el){ return window.SeymaZikr.setZikrPresetFilter.apply(null,arguments); };
App.clearZikrPresetFilter=function(){ return window.SeymaZikr.clearZikrPresetFilter.apply(null,arguments); };
App.setZikrLibFilter=function(mode){ return window.SeymaZikr.setZikrLibFilter.apply(null,arguments); };
App.setZikrTopic=function(topic){ return window.SeymaZikr.setZikrTopic.apply(null,arguments); };
App.toggleZikrFilters=function(){ return window.SeymaZikr.toggleZikrFilters.apply(null,arguments); };
App.toggleZikrNote=function(){ return window.SeymaZikr.toggleZikrNote.apply(null,arguments); };
App.onZikrNoteField=function(field,el){ return window.SeymaZikr.onZikrNoteField.apply(null,arguments); };
App.setZikrNoteMood=function(mood){ return window.SeymaZikr.setZikrNoteMood.apply(null,arguments); };
App.saveZikrNote=function(){ return window.SeymaZikr.saveZikrNote.apply(null,arguments); };
App.toggleZikrManual=function(){ return window.SeymaZikr.toggleZikrManual.apply(null,arguments); };
App.onZikrManualAmount=function(el){ return window.SeymaZikr.onZikrManualAmount.apply(null,arguments); };
App.onZikrManualNote=function(el){ return window.SeymaZikr.onZikrManualNote.apply(null,arguments); };
App.zikrManualStep=function(dir){ return window.SeymaZikr.zikrManualStep.apply(null,arguments); };
App.zikrManualChip=function(v){ return window.SeymaZikr.zikrManualChip.apply(null,arguments); };
App.saveZikrManual=function(){ return window.SeymaZikr.saveZikrManual.apply(null,arguments); };
App.undoZikrManual=function(entryId){ return window.SeymaZikr.undoZikrManual.apply(null,arguments); };
App.toggleZikrSetting=function(k){ return window.SeymaZikr.toggleZikrSetting.apply(null,arguments); };
App.toggleZikrPause=function(){
  var z=ensureZikrRoot(), p=zikrActivePreset(), s=z.activeSession, now=new Date().toISOString(), h=zikrActiveHatim(p,false);
  var same=!!(s&&s.presetId===p.id&&(p.kind!=='esma'||s.hatimId===(h&&h.id||'')));
  if(same&&s.pausedAt){ s.pausedAt=null; s.lastAt=now; }
  else if(same){ s.pausedAt=now; s.lastAt=now; }
  else z.activeSession={id:zikrUid('zs'),presetId:p.id,hatimId:h&&h.id||'',startedAt:now,lastAt:now,count:0,pausedAt:null};
  save();
  if(!zikrPaintPauseButton()) if(!zikrPaintView('counter',true)) render();
};
App.startNewZikrHatim=function(){
  var p=zikrActivePreset(); if(!p||p.kind!=='esma') return;
  var j=zikrJourney(p,true), current=zikrActiveHatim(p,false);
  if(current&&current.status!=='completed'&&current.count>0&&!confirm('Aktif hatmi arşivleyip yeni bir Ebced² Tam Hatim başlatmak istiyor musun?')) return;
  if(current&&current.status!=='completed'){ current.status='archived'; current.archivedAt=new Date().toISOString(); }
  var h=zikrNewHatim(p,0,'active'); j.hatims.push(h); j.activeHatimId=h.id; zikrPauseSession(); ui.zikrView='counter'; save(); if(!zikrPaintView('counter')) render(); toast('Yeni '+p.name+' Ebced² Tam Hatmi başladı.');
};
App.openZikrHatim=function(presetId,hatimId){ return window.SeymaZikr.openZikrHatim.apply(null,arguments); };
App.requestRemoveZikrHatim=function(presetId,hatimId){ return window.SeymaZikr.requestRemoveZikrHatim.apply(null,arguments); };
App.cancelRemoveZikrHatim=function(){ return window.SeymaZikr.cancelRemoveZikrHatim.apply(null,arguments); };
App.confirmRemoveZikrHatim=function(){ return window.SeymaZikr.confirmRemoveZikrHatim.apply(null,arguments); };
App.openZikrPresetAdd=function(){ return window.SeymaZikr.openZikrPresetAdd.apply(null,arguments); };
App.cancelZikrPresetAdd=function(){ return window.SeymaZikr.cancelZikrPresetAdd.apply(null,arguments); };
App.onZikrPresetField=function(f,el){ return window.SeymaZikr.onZikrPresetField.apply(null,arguments); };
App.saveZikrPreset=function(){ return window.SeymaZikr.saveZikrPreset.apply(null,arguments); };
App.deleteZikrPreset=function(id){ return window.SeymaZikr.deleteZikrPreset.apply(null,arguments); };
App.toggleZikrFavorite=function(id){ return window.SeymaZikr.toggleZikrFavorite.apply(null,arguments); };
App.zikrResetToday=function(){ return window.SeymaZikr.zikrResetToday.apply(null,arguments); };
App.cancelZikrReset=function(){ return window.SeymaZikr.cancelZikrReset.apply(null,arguments); };
App.confirmZikrResetToday=function(){ return window.SeymaZikr.confirmZikrResetToday.apply(null,arguments); };

App.setFaithTab=function(tab){ ui.faithTab=tab||'oz'; render(); };
App.faithHeatYear=function(delta){
  var nowY=new Date().getFullYear(), startY=+(data&&data.startDate?String(data.startDate).slice(0,4):nowY);
  var y=+(ui.faithHeatYear||nowY)+delta; ui.faithHeatYear=Math.max(startY,Math.min(nowY,y)); render();
};
App.openFaithHeatDay=function(date){ App.heatOpen(date); };

// ================= KURS & PRATİK (Zihin-Beden Beslenmesi) =================
App.openSoulActivity=function(type){
  ui.soulActivityOpen=true;
  ui.soulActivityDraft={type:type||'pilates',duration:'',note:''};
  render(); focusModalDialog('sey-ov-card');
};
// Yeni: Pratik butonu ilk dokunuşta alt seçim açar (Pilates/Ney/Binicilik)
App.openSoulPracticePicker=function(){
  ui.soulPracticePicker=true;
  render(); focusModalDialog('sey-ov-card');
};
App.closeSoulPracticePicker=function(){
  ui.soulPracticePicker=false;
  render();
};
App.pickSoulPractice=function(type){
  // Picker → aktivite geçişini tek render'da, animasyonsuz yap → flash yok.
  ui.soulPracticePicker=false;
  ui.soulActivityOpen=true;
  ui.soulActivityDraft={type:type||'pilates',duration:'',note:''};
  render(); focusModalDialog('sey-ov-card');
};
App.closeSoulActivity=function(){ var body=function(){ ui.soulActivityOpen=false; ui.soulActivityDraft=null; render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.onSoulField=function(field,el){ if(!ui.soulActivityDraft) ui.soulActivityDraft={type:'pilates',duration:'',note:''}; ui.soulActivityDraft[field]=el.value; };
App.setSoulType=function(type){ if(!ui.soulActivityDraft) ui.soulActivityDraft={type:'pilates',duration:'',note:''}; ui.soulActivityDraft.type=type; render(); };
App.saveSoulActivity=function(){
  var d=ui.soulActivityDraft||{};
  var type=String(d.type||'pilates').trim();
  var act=soulActivityById(type);
  if(!act){ toast('Lütfen bir aktivite türü seç'); return; }
  var durRaw=String(d.duration||'').trim();
  var duration=durRaw?Math.max(0,Math.round(Number(durRaw)||0)):null;
  var note=String(d.note||'').trim().slice(0,200);
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!Array.isArray(day.soulActivities)) day.soulActivities=[];
  var entry={id:uid('soul'),type:type,label:act.label,duration:duration,note:note,savedAt:new Date().toISOString()};
  day.soulActivities.push(entry);
  syncEntryToSoulArchive(entry);
  day.savedAt=new Date().toISOString();
  ui.soulActivityDraft={type:type,duration:'',note:''};
  commit('Zihin-beden pratiği kaydedildi — nefes, denge, ritim 🦩');
};
App.removeSoulActivity=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day&&Array.isArray(day.soulActivities)){ var i=day.soulActivities.findIndex(function(a){ return a&&a.id===id; }); if(i>=0){ var removed=day.soulActivities[i]; unsyncSoulEntry(removed); day.soulActivities.splice(i,1); day.savedAt=new Date().toISOString(); commit('Pratik kaydı silindi'); } } };

// ================= ZİHİN-BEDEN ARŞİVİ =================
App.openSoulArchive=function(){ ui.soulArchiveOpen=true; ui.soulArchiveFilter=null; render(); focusModalDialog('sey-ov-card'); };
App.closeSoulArchive=function(){ var body=function(){ ui.soulArchiveOpen=false; ui.soulArchiveFilter=null; render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.setSoulArchiveFilter=function(type){ ui.soulArchiveFilter=(ui.soulArchiveFilter===type?null:type); render(); };
App.removeSoulArchiveSession=function(id){ var found=false; if(!data.days||typeof data.days!=='object') return; Object.keys(data.days).forEach(function(date){ var rec=data.days[date]; if(!rec||!Array.isArray(rec.soulActivities)) return; var i=rec.soulActivities.findIndex(function(a){ return a&&a.id===id; }); if(i>=0){ var removed=rec.soulActivities[i]; unsyncSoulEntry(removed); rec.soulActivities.splice(i,1); rec.savedAt=new Date().toISOString(); found=true; } }); if(found){ commit('Pratik kaydı arşivden silindi'); } };

// ================= İMAN KÖŞESİ =================
App.openFaithCorner=function(){ ui.faithOpen=true; reminderLockBodyScroll(); render(); focusModalDialog('sey-ov-card'); if(prayerLocation()){ setTimeout(function(){ App.refreshPrayerTimes(); },80); } };
App.closeFaithCorner=function(){ var body=function(){ var targetFocusId=ui.reminderTargetReturnFocusId; reminderUnlockBodyScroll(); ui.faithOpen=false; ui.reminderTargetReturnFocusId=''; render(); if(!targetFocusId||!reminderRestoreFocus(targetFocusId,'')){ try{ var trigger=document.getElementById('faith-preview-card'); if(trigger&&trigger.focus) trigger.focus(); }catch(e){} } }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.setPrayerCity=function(name){
  var c=prayerCityByName(name);
  if(!c){ toast('Şehir bulunamadı'); return; }
  if(!data.settings) data.settings={}; if(!data.settings.prayer) data.settings.prayer={};
  data.settings.prayer.location={lat:c.lat,lon:c.lon,cityName:c.name,source:'manual',accuracy:null,capturedAt:new Date().toISOString()};
  save(); render();
  App.refreshPrayerTimes();
};
App.fetchPrayerLocationGPS=function(){
  if(!navigator||!navigator.geolocation){ toast('Cihaz konum servisi bulunamadı'); return; }
  toast('Konum alınıyor…');
  // Kapı akışıyla aynı iki düzeltme: (a) ham `err.message` (İngilizce) yerine OS
  // düzeyi ipucunu içeren ANLAŞILIR metin, (b) zaman aşımında tek seferlik düşük
  // hassasiyet denemesi. Öncesinde ikisi de yoktu; izin verilse de hata görünüyordu.
  function prayerGpsFail(err){ var c=err&&Number(err.code);
    if(c===3&&!ui.prayerGpsLowTried){ ui.prayerGpsLowTried=true; try{ navigator.geolocation.getCurrentPosition(prayerGpsOk,prayerGpsFail,{enableHighAccuracy:false,timeout:25000,maximumAge:600000}); return; }catch(e2){} }
    toast(locationGateErrorText(c===1||c===2||c===3?c:0,c===1?'permission-denied':c===2?'position-unavailable':c===3?'timeout':'request-error'),6500); }
  function prayerGpsOk(pos){ var lat=pos&&pos.coords&&pos.coords.latitude, lon=pos&&pos.coords&&pos.coords.longitude;
    if(lat==null||lon==null){ toast('Konum alınamadı. Yeniden deneyebilirsin.'); return; }
    if(!data.settings) data.settings={}; if(!data.settings.prayer) data.settings.prayer={};
    data.settings.prayer.location={lat:lat,lon:lon,cityName:'GPS Konum',source:'gps',accuracy:Math.round(Number(pos.coords.accuracy)||0)||null,capturedAt:new Date().toISOString()};
    ui.prayerGpsLowTried=false; save(); render(); App.refreshPrayerTimes(); }
  ui.prayerGpsLowTried=false;
  navigator.geolocation.getCurrentPosition(prayerGpsOk,prayerGpsFail,{enableHighAccuracy:true,timeout:15000,maximumAge:120000});
};
App.setPrayerMethod=function(method){
  if(!data.settings) data.settings={}; if(!data.settings.prayer) data.settings.prayer={};
  data.settings.prayer.method=PRAYER_METHODS.hasOwnProperty(method)?method:'diyanet';
  save(); render(); App.refreshPrayerTimes();
};
App.adjustHijriOffset=function(delta){
  var s=prayerSettings(), next=Math.max(-2,Math.min(2,(Number(s.hijriOffset)||0)+(Number(delta)||0)));
  s.hijriOffset=next; save(); render();
  toast('Hicri tarih ayarı '+(next===0?'varsayılana döndü':(next>0?'+'+next:next)+' gün'));
};
App.refreshPrayerTimes=function(force){
  var d=todayStr();
  fetchPrayerTimes(d, !!force).then(function(times){ applyPrayerTimesToDay(d,times); }).catch(function(err){
    var day=getDay(data,d,dayIndexFor(d)); var p=(day&&day.prayer)||{};
    p.fetchError=String(err&&err.message||'Vakitler alınamadı'); if(day) day.savedAt=new Date().toISOString(); save();
    if(!force) return;
    toast('Vakitler yenilenemedi: '+p.fetchError);
  });
};
App.togglePrayer=function(type,field){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var p=ensurePrayerDay(day); var e=p[type]; if(!e) return;
  if(field==='performed'||field==='inCongregation'||field==='late'||field==='madeUp') e[field]=!e[field];
  if(field==='performed'&&!e.performed){ e.inCongregation=false; e.late=false; e.madeUp=false; }
  e.savedAt=new Date().toISOString(); day.savedAt=new Date().toISOString(); save(); render();
};
App.setPrayerNote=function(type,el){ debounceSave('prayerNote'+type,function(){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var p=ensurePrayerDay(day); var e=p[type]; if(!e) return; e.note=String(el.value||'').slice(0,160); e.savedAt=new Date().toISOString(); day.savedAt=new Date().toISOString(); save(); }); };
App.changeNafile=function(type,delta){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var p=ensurePrayerDay(day); var e=p[type]; if(!e) return;
  e.nafile=Math.max(0, (Number(e.nafile)||0)+Number(delta));
  e.savedAt=new Date().toISOString(); day.savedAt=new Date().toISOString(); save(); render();
};

// ================= NE ÖĞRENDİM =================
App.openLearning=function(){ ui.learningOpen=true; ui.learningDraft={topic:'',source:'',note:''}; render(); focusModalDialog('sey-ov-card'); };
App.closeLearning=function(){ var body=function(){ ui.learningOpen=false; ui.learningDraft=null; render(); }; if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-ov-card','sey-ov-back',body); else body(); };
App.onLearningField=function(field,el){ if(!ui.learningDraft) ui.learningDraft={topic:'',source:'',note:''}; ui.learningDraft[field]=el.value; };
App.addLearning=function(){
  var d=ui.learningDraft||{};
  var topic=String(d.topic||'').trim();
  if(!topic){ toast('Önce ne öğrendiğini yaz'); var ti=document.getElementById('learning-topic'); if(ti) ti.focus(); return; }
  var entry={ id:uid('ln'), topic:topic.slice(0,140), source:String(d.source||'').trim().slice(0,120), note:String(d.note||'').trim().slice(0,300), ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.learning||typeof day.learning!=='object') day.learning=emptyLearning();
  if(!Array.isArray(day.learning.entries)) day.learning.entries=[];
  day.learning.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.learningDraft={topic:'',source:'',note:''};
  commit('Öğrenme kaydedildi');
};
App.removeLearning=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day.learning&&Array.isArray(day.learning.entries)){ var i=day.learning.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ day.learning.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Öğrenme kaydı silindi'); } } };

// ================= ŞÜKRAN / 3 GÜZEL ŞEY =================
App.onGratitude=function(i,el){ var v=el.value; i=Number(i)||0; debounceSave('grat'+i,function(){ var day=curDay(); if(!Array.isArray(day.gratitude)) day.gratitude=[]; day.gratitude[i]=String(v||'').slice(0,160); day.savedAt=new Date().toISOString(); save(); },500); };


App.setWalkSteps=function(el){ var raw=el.value; debounceSave('walkS',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.steps=(v==null||isNaN(v))?null:Math.round(v); var nw=syncDerivedHabits(day); if(nw.indexOf('walked20')>=0){ haptic(16); toast('Yürüyüş tiki kendiliğinden yeşillendi. '+stepsGoal(activeDate()).toLocaleString('tr-TR')+'+ adım, harika!'); } day.savedAt=new Date().toISOString(); save(); }); };
App.hideStepNudge=function(){ ui.stepNudgeHidden=true; render(); };
// Kalıcı kart gizleme/geri getirme (settings'te tutulur; Ayarlar > Gizlenen kartlar'dan geri gelir).
App.hideBugunCard=function(which){ if(!data.settings) data.settings={}; if(which==='location'){ data.settings.hideLocationCard=true; toast('Konum & Hareket gizlendi · Ayarlar’dan geri getirebilirsin'); } else if(which==='repo'){ data.settings.hideRepoBanner=true; toast('Repoya bağlan gizlendi · Ayarlar’dan geri getirebilirsin'); } else if(which==='vacation'){ data.settings.hideVacationCard=true; toast('Tatil Modu gizlendi · Ayarlar’dan geri getirebilirsin'); } haptic(10); save(); render(); };
App.showBugunCard=function(which){ if(!data.settings) data.settings={}; if(which==='location') data.settings.hideLocationCard=false; else if(which==='repo') data.settings.hideRepoBanner=false; else if(which==='vacation') data.settings.hideVacationCard=false; haptic(10); save(); render(); };
App.hideStepRemind=function(){ ui.stepRemindHidden=true; render(); };
App.hideWaterNudge=function(){ ui.waterNudgeHidden=true; render(); };
App.setWalkMinutes=function(el){ var raw=el.value; debounceSave('walkM',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.minutes=(v==null||isNaN(v))?null:Math.round(v); day.savedAt=new Date().toISOString(); save(); }); };

// ---- Apple Health import ----
App.importHealthClick=function(){ var f=document.getElementById('sey-health-file'); if(f) f.click(); };
App.importHealthFile=function(el){ var file=el.files&&el.files[0]; el.value=''; if(!file) return; var st=document.getElementById('sey-health-status'); var name=(file.name||'').toLowerCase();
  if(name.indexOf('.zip')>=0){ if(st) st.textContent='Zip doğrudan açılamıyor; lütfen zip içindeki export.xml dosyasını seç.'; return; }
  if(st) st.textContent='Okunuyor…';
  var r=new FileReader();
  r.onload=function(){ try{ parseHealthXML(String(r.result)); }catch(e){ if(st) st.textContent='Dosya okunamadı.'; } };
  r.onerror=function(){ if(st) st.textContent='Dosya okunamadı.'; };
  r.readAsText(file);
};
function parseHealthXML(xml){
  var st=document.getElementById('sey-health-status'); var today=todayStr();
  var steps=0,sleepMs=0,found=false; var recRe=/<Record\b[^>]*>/g, rm;
  while((rm=recRe.exec(xml))){ var tag=rm[0];
    var type=(tag.match(/type="([^"]+)"/)||[])[1]; if(!type) continue;
    if(type.indexOf('StepCount')<0 && type.indexOf('SleepAnalysis')<0) continue;
    var sd=(tag.match(/startDate="([^"]+)"/)||[])[1]; var ed=(tag.match(/endDate="([^"]+)"/)||[])[1]; var val=(tag.match(/value="([^"]*)"/)||[])[1];
    if(!sd||sd.slice(0,10)!==today) continue; found=true;
    if(type.indexOf('StepCount')>=0){ steps+=Number(val)||0; }
    else if(type.indexOf('SleepAnalysis')>=0 && /Asleep/i.test(val||'')){ var t1=Date.parse(sd),t2=Date.parse(ed); if(t1&&t2&&t2>t1) sleepMs+=(t2-t1); }
  }
  var d=getDay(data,today,dayIndexFor(today)); var msgs=[];
  if(steps>0){ d.walk.steps=Math.round(steps); msgs.push(Math.round(steps)+' adım'); }
  if(sleepMs>0){ var hrs=Math.round(sleepMs/3600000*10)/10; d.sleep.hours=hrs; msgs.push(hrs+' sa uyku'); }
  var nwH=syncDerivedHabits(d); if(nwH.indexOf('walked20')>=0) msgs.push('yürüyüş tiki'); if(nwH.indexOf('sleepReg')>=0) msgs.push('uyku tiki');
  if(steps>0||sleepMs>0){ d.savedAt=new Date().toISOString(); save(); render(); }
  if(st) st.textContent=(steps>0||sleepMs>0)?('İçe aktarıldı: '+msgs.join(' · ')):(found?'Bugün için adım/uyku verisi bulunamadı.':'Bugüne ait kayıt yok. Dosya güncel mi?');
}

// ---- cycle actions ----
App.logPeriodToday=function(){ var t=todayStr(); if(data.cycle.periods.some(function(p){return p.start===t;})){ toast('Bugün zaten kayıtlı'); return; } data.cycle.periods.push({start:t,end:null}); recalcCycle(); commit('Regl başlangıcı eklendi'); };
App.setPeriodField=function(idx,which,el){ var p=data.cycle.periods[idx]; if(!p) return; p[which]=el.value||null; recalcCycle(); commit(); };
App.removePeriod=function(idx){ if(data.cycle.periods[idx]){ data.cycle.periods.splice(idx,1); recalcCycle(); commit('Kayıt silindi'); } };
App.setFlow=function(id){ var day=curDay(); day.flow=(day.flow===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.toggleSymptom=function(id){ var day=curDay(); var i=day.symptoms.indexOf(id); if(i>=0) day.symptoms.splice(i,1); else day.symptoms.push(id); day.savedAt=new Date().toISOString(); commit(); };
App.setBodyView=function(v){ ui.bodyView=(v==='back'?'back':'front'); render(); };
App.cycleDiscomfort=function(id){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); var reg=day.discomfort.regions||(day.discomfort.regions={}); var cur=(reg[id]&&reg[id].level)||0; var nx=(cur+1)%4; if(nx===0) delete reg[id]; else reg[id]={level:nx}; day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortNote=function(el){ var v=el.value; debounceSave('dzNote',function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); day.discomfort.note=v; day.savedAt=new Date().toISOString(); save(); },400); };
App.addDiscomfortMed=function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; day.discomfort.meds.push({name:'',dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.quickDiscomfortMed=function(i){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; var nm=(DMEDS[i]||'').split(' (')[0]; day.discomfort.meds.push({name:nm,dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortMed=function(idx,field,el){ var v=el.value; debounceSave('dzMed-'+idx+'-'+field,function(){ var day=curDay(); var m=day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]; if(!m) return; m[field]=v; day.savedAt=new Date().toISOString(); save(); },350); };
App.removeDiscomfortMed=function(idx){ var day=curDay(); if(day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]!=null){ day.discomfort.meds.splice(idx,1); day.savedAt=new Date().toISOString(); commit(); } };
function recalcCycle(){ var st=cycleStats(); data.cycle.avgCycle=st.avgCycle; data.cycle.avgPeriod=st.avgPeriod; }
// ── Kriz odaları (modal): Tatlı · Yemek · Kahve ──
App.openCrisis=function(kind){ if(!crisisFor(kind)) return; if(isVacationDay(todayStr())) return; haptic([16,40,16]); var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.cravingSOSCount=(day.cravingSOSCount||0)+1; day.savedAt=new Date().toISOString(); save(); ui.crisisKind=kind; ui.crisisOpts=[]; ui.crisisTriggers=[]; ui.crisisNote=''; ui.crisisDone=false; ui.crisisTrigOpen=false; ui.crisisTriedOpen=false; lastCrisisKind=null; render(); focusModalDialog('sey-crisis-card'); };
App.closeCrisis=function(){ ui.crisisKind=null; render(); };
App.toggleCrisisDropdown=function(which){ if(which==='trig') ui.crisisTrigOpen=!ui.crisisTrigOpen; else ui.crisisTriedOpen=!ui.crisisTriedOpen; render(); };
App.toggleCrisisOpt=function(o){ var i=ui.crisisOpts.indexOf(o); if(i>=0) ui.crisisOpts.splice(i,1); else ui.crisisOpts.push(o); render(); App.completeCrisis(); };
App.toggleCrisisTrigger=function(id){ var i=ui.crisisTriggers.indexOf(id); if(i>=0) ui.crisisTriggers.splice(i,1); else ui.crisisTriggers.push(id); render(); App.completeCrisis(); };
App.onCrisisNote=function(el){ ui.crisisNote=String(el.value||'').slice(0,200); debounceSave('crisisNote',App.completeCrisis,700); };
App.completeCrisis=function(){ var C=crisisFor(ui.crisisKind); if(!C) return; var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); var firstDone=!day[C.doneField]; day[C.doneField]=true; day.cravingOptionsUsed=ui.crisisOpts.slice(); var nowIso=new Date().toISOString(); day.cravingTriggers=ui.crisisTriggers.map(function(tg){ return {trigger:tg,ts:nowIso,kind:C.key}; }); var tn=String(ui.crisisNote||'').trim().slice(0,200); if(tn) day.cravingTriggerNote=tn; syncDerivedHabits(day); day.savedAt=nowIso; ui.crisisDone=true; if(firstDone) commit('Krizi yönettin'); else save(); };
App.resetCrisis=function(){ ui.crisisOpts=[]; ui.crisisTriggers=[]; ui.crisisNote=''; ui.crisisDone=false; ui.crisisTrigOpen=false; ui.crisisTriedOpen=false; render(); };

// ── Günlük Işığı modal handler'ları ──
App.openJournalModal=function(options){ var preserve=options&&options.preserveDraft===true; haptic([12,28,12]); ui.journalOpen=true; ui.journalMode=ui.journalMode||'free'; var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); if(!preserve||ui.journalText===undefined){ if(day.journal&&String(day.journal.text||'').trim()){ ui.journalText=day.journal.text; ui.journalMode=day.journal.mode||'free'; ui.journalPromptUsed=day.journal.promptUsed||''; } else { var p=journalPhasePrompt(ui.journalMode); ui.journalText=''; ui.journalPromptUsed=p; } } lastJournalKind=null; reminderLockBodyScroll(); render(); setTimeout(function(){ var t=document.getElementById('sey-journal-text'); if(t) t.focus(); },60); };
App.closeJournalModal=function(){ var targetFocusId=ui.reminderTargetReturnFocusId; reminderUnlockBodyScroll(); ui.journalOpen=false; ui.journalText=''; ui.journalPromptUsed=''; lastJournalKind=null; ui.reminderTargetReturnFocusId=''; render(); if(targetFocusId) reminderRestoreFocus(targetFocusId,''); };
App.setJournalMode=function(mode){ ui.journalMode=mode||'free'; ui.journalPromptUsed=journalPhasePrompt(mode); if(ui.journalText===undefined) ui.journalText=''; updateJournalUI(); setTimeout(function(){ var t=document.getElementById('sey-journal-text'); if(t) t.focus(); },40); };
App.onJournalText=function(el){ ui.journalText=String(el.value||''); updateJournalCounts(); };
App.useJournalPrompt=function(){ ui.journalPromptUsed=journalPhasePrompt(ui.journalMode||'free'); updateJournalPromptLine(); setTimeout(function(){ var t=document.getElementById('sey-journal-text'); if(t) t.focus(); },40); };
App.saveJournal=function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); var j=day.journal; var text=String(ui.journalText||'').trim(); var goal=data.settings.journalGoal||{words:30,chars:140}; var words=text?text.split(/\s+/).filter(function(w){return w.length>0;}).length:0; var chars=text.length; j.text=text; j.mode=ui.journalMode||'free'; j.promptUsed=String(ui.journalPromptUsed||'').trim(); j.wordCount=words; j.charCount=chars; j.metGoal=(words>=goal.words||chars>=goal.chars); j.streakAtSave=journalStreak(); j.savedAt=new Date().toISOString(); var newly=syncDerivedHabits(day); save(false,{message:'Günlük Işığı güncellendi',meta:{section:'therapy',path:'data.days.*.journal',operation:'update',summary:'Yansıtma/pratik kaydı güncellendi',detail:'Günlük Işığı',value:text.slice(0,60),field:'journal'}}); updateCardByKey('reflection'); updateCardByKey('habits'); ui.journalOpen=false; ui.journalText=''; ui.journalPromptUsed=''; lastJournalKind=null; render(); if(newly.indexOf('journaled')>=0){ haptic(14); toast('Günlük Işığı tiki yeşillendi ✨'); } else { toast('Günlük Işığı kaydedildi ✨',1800); } };

// ── Tatil Modu handler'ları
App.toggleVacationCard=function(){ haptic(10); App.toggleCard('vacation'); };
App.setVacationEnabled=function(flag){ var v=ensureVacationSettings(); var was=v.enabled; var on=flag===true||flag==='true'||flag===1; v.enabled=on; if(on){ v.preset='active'; v.enabledAt=new Date().toISOString(); if(!v.startAt||!v.endAt){ var t=todayStr(); v.startAt=t; v.endAt=addDays(t,7); } } save(); render(); };
App.setVacationStart=function(val){ var v=ensureVacationSettings(); v.startAt=String(val||''); if(v.endAt&&v.startAt&&v.endAt<v.startAt){ v.endAt=v.startAt; } save(); render(); };
App.setVacationEnd=function(val){ var v=ensureVacationSettings(); v.endAt=String(val||''); if(v.startAt&&v.endAt&&v.endAt<v.startAt){ v.startAt=v.endAt; } save(); render(); };
App.setVacationPreset=function(preset){ var v=ensureVacationSettings(); var was=v.enabled; v.preset=String(preset||'active'); if(!v.enabled){ v.enabled=true; v.enabledAt=new Date().toISOString(); if(!v.startAt||!v.endAt){ var t=todayStr(); v.startAt=t; v.endAt=addDays(t,7); } } save(); render(); };
App.setVacationReason=function(reason){ var v=ensureVacationSettings(); v.reason=String(reason||'').trim(); save(); updateCardByKey('vacation'); };

App.openEmergency=function(){ ui.emergency=true; render(); focusModalDialog('sey-emergency-dialog'); };
App.closeEmergency=function(){ ui.emergency=false; render(); };
App.continueEmergency=function(){ ui.emergency=false; render(); toast('İşte bu. Reset dediğin bazen sadece bir sonraki doğru hamledir.',3000); };
App.emergencyNote=function(){ ui.emergency=false; ui.tab='bugun'; render(); setTimeout(function(){ var ta=document.querySelector('textarea'); if(ta) ta.focus(); },150); };

App.openDate=function(date){
  var rec=data.days[date]||null; var idx=dayIndexFor(date);
  var habits=HABITS.map(function(h){ return {label:h.title,mark:(rec&&rec.habits[h.key])?('<span style="color:#3F8A4F;display:inline-flex;">'+icon('circle-check',16)+'</span>'):('<span style="color:var(--faint);display:inline-flex;">'+icon('circle',16)+'</span>')}; });
  var cnt=countRec(rec); var ht=habitCountOn(date); var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34); var status='Zor gün'; if(cnt>=ht)status='Kraliçe günü'; else if(cnt>=strong)status='Güzel gün'; else if(cnt>=medium)status='İdare eder';
  var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  var sl=rec&&rec.sleep?rec.sleep:{}, wk=rec&&rec.walk?rec.walk:{};
  var mealsList=[]; if(rec&&rec.meals){ MEALS.forEach(function(m){ if(rec.meals[m.key]&&String(rec.meals[m.key]).trim()) mealsList.push({label:m.label,icon:m.icon,text:String(rec.meals[m.key])}); }); }
  var flowO=rec&&rec.flow?find(FLOW,'id',rec.flow):null;
  var symsList=(rec&&rec.symptoms||[]).map(function(id){ var s=find(SYMPTOMS,'id',id); return s?s.emoji+' '+s.label:id; });
  ui.dayDetail={date:date,isToday:(date===todayStr()),title:(idx>=1?'Gün '+idx:shortDate(date)),dateLabel:shortDate(date),status:status,habits:habits,moodLabel:mood?mood.label:'—',sosCount:rec?(rec.cravingSOSCount||0):0,note:(rec&&rec.note)||'',hasNote:!!(rec&&rec.note),intention:(rec&&rec.intention)||'',hasIntention:!!(rec&&rec.intention&&String(rec.intention).trim()),gratitude:(rec&&Array.isArray(rec.gratitude))?rec.gratitude.filter(function(g){return String(g||'').trim();}):[],
    sleepH:(sl.hours!=null?sl.hours:null),steps:(wk.steps!=null?wk.steps:null),mins:(wk.minutes!=null?wk.minutes:null),meals:mealsList,flow:flowO?flowO.label:null,syms:symsList};
  render();
};
App.closeDetail=function(){ ui.dayDetail=null; render(); };
// ---- geçmiş gün düzenleme moduna gir / çık ----
App.editDay=function(date){
  if(!data||!date) return;
  var t=todayStr();
  if(diffDays(t,date)>0) return;      // yalnızca gelecek düzenlenemez (geçmiş ve bugün olur)
  if(date===t){ App.exitEdit(true); ui.dayDetail=null; App.go('bugun'); return; }
  ui.editDate=date; ui.editStartMs=Date.now(); ui.dayDetail=null; ui.tab='bugun';
  render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
};
App.exitEdit=function(silent){
  if(!ui.editDate){ if(!silent) render(); return; }
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  if(!silent) toast('Bugüne döndük');
};
App.maybeAutoExitEdit=function(reason){
  if(!ui.editDate) return false;
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  toast(reason||'Bugüne döndük',2800);
  return true;
};
App.calMove=function(delta){ var ym=(ui.calMonth||todayStr().slice(0,7)).split('-'); var d=new Date(+ym[0],+ym[1]-1+delta,1); ui.calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };
App.calToday=function(){ ui.calMonth=todayStr().slice(0,7); render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.heatYear=function(delta){ var startY=+String(data.startDate).slice(0,4); var nowY=new Date().getFullYear(); var y=(+(ui.heatYear||nowY))+delta; if(y<startY)y=startY; if(y>nowY)y=nowY; ui.heatYear=y; render(); };
App.heatOpen=function(date){ ui.tab='harita'; ui.calMonth=String(date).slice(0,7); App.openDate(date); };

App.exportJson=function(){ var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); download(blob,'seyma-yedek.json'); toast('Yedek indirildi'); };
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); },1500); }
App.importClick=function(){ var f=document.getElementById('sey-file'); if(f) f.click(); };
App.importJson=function(el){ var f=el.files&&el.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var d=JSON.parse(r.result); if(d&&d.version&&d.days&&d.startDate){ data=d; ui.tab='bugun'; commit('Yedek yüklendi'); } else toast('Dosya okunamadı'); }catch(err){ toast('Dosya okunamadı'); } }; r.readAsText(f); el.value=''; };

App.askReset=function(){ ui.resetStep=1; render(); };
App.cancelReset=function(){ ui.resetStep=0; render(); };
App.resetConfirm=function(){ if(ui.resetStep===1){ ui.resetStep=2; render(); return; } try{ localStorage.removeItem(KEY); }catch(e){} reminderRemoveLocalKey(REMINDER_DELIVERY_KEY); reminderRemoveLocalKey(REMINDER_ACTION_KEY); reminderRemoveLocalKey(REMINDER_PERMISSION_STORAGE_KEY); reminderPermissionTransientState=null; reminderPermissionRequestInFlight=null; reminderPermissionEverGranted=null; reminderPermissionGrantObserved=false; data=null; ui.resetStep=0; ui.tab='bugun'; ui.reminderMedicationDraft=null; ui.reminderHistoryUndo=null; ui.reminderAllUndo=null; render(); };
function locationGateResetNudge(){ ui.locNudgeOpen=false; ui.locNudgeShown=[]; }
function locationGateRequired(){ return !data||!data.settings||data.settings.locationEnabled!==true||ui.locationGateState!=='granted'; }
// Gözcü süresi: yüksek hassasiyet (20 sn) + düşük hassasiyet yedeği (25 sn)
// zincirinin tamamını kapsar. Safari, güvensiz bağlamda ya da izin penceresi
// hiç gösterilmediğinde callback'lerin HİÇBİRİNİ çağırmayabilir; o durumda
// istek sonsuza kadar "askıda" kalır ve düğme ölür. Gözcü bunu kırar.
var LOCATION_GATE_WATCHDOG_MS=50000, LOCATION_GATE_RETRY_MS=1500;
function locationGateErrorText(){ return window.SeymaAppSurface.locationGateErrorText.apply(null,arguments); }
// TAM-DENETIM B-01: GEÇİCİ hata kalıcı izni DÜŞÜRMEZ.
// Eskiden burası HER hata kodunda `data.settings.locationEnabled=false` yazıp
// diske kaydediyordu. Oysa yalnız code 1 (PERMISSION_DENIED), 'unsupported' ve
// 'insecure-context' gerçekten kalıcıdır; code 2 (position-unavailable) ve
// code 3 (timeout) GEÇİCİdir — iç mekânda GPS kilidi gecikmesi bunları rutin
// olarak üretir. Sonuç: tek bir zaman aşımı kalıcı bayrağı düşürüyor, tarayıcı
// izni hâlâ 'granted' olmasına rağmen uygulamanın TAMAMI kapının arkasında
// kilitli kalıyor ve kendiliğinden düzelmiyordu (denetimde deterministik olarak
// yeniden üretildi: #app 96.816 → 2.191 karakter, izin 'granted').
// Geçici hatada `ui.locationGateState` yine 'unavailable' olur (kullanıcı
// hatayı görür ve yeniden deneyebilir) ama kalıcı `locationEnabled` KORUNUR;
// sonraki açık izin/hava kullanıcı yolunda yeniden doğrulama yapılabilir.
function locationGatePermanentFailure(){ return window.SeymaAppSurface.locationGatePermanentFailure.apply(null,arguments); }
function locationGateFailure(){ return window.SeymaAppSurface.locationGateFailure.apply(null,arguments); }
function locationGateGranted(pos,userInitiated){
  var wasFresh=!data;
  if(!data) data=migrate(createDefaultData());
  if(!data.settings) data.settings={};
  data.settings.locationEnabled=true;
  if(!data.settings.locationEnabledAt) data.settings.locationEnabledAt=new Date().toISOString();
  if(!data.settings.locationEnabledReason) data.settings.locationEnabledReason=userInitiated?'manual':'verified';
  data.settings.locationDisabledAt='';
  data.settings.locationDisabledReason='';
  ui.locationGateState='granted';
  ui.locationGateError='';
  ui.locationGateRequestInFlight=false;
  locationGateResetNudge();
  if(wasFresh) ui.forceStart=true;
  if(pos) onLocationFix(pos);
  save(userInitiated?undefined:false);
  render();
}
// Konum kapısı sessiz doğrulaması. `ui` kalıcı olmadığı için `locationGateState`
// her açılışta sıfırlanıyor, kapı da izin çoktan verilmiş olsa bile taze bir
// ölçüm dayatıyordu; ölçüm gecikince uygulama tamamen kilitli kalıyordu.
// Permissions API izni sessizce söyleyebilir: verilmişse kapıyı kaydedilmiş
// konumla aç, taze ölçümü arka planda watch getirsin.
function locationGateSilentVerify(){
  if(!data||!data.settings||data.settings.locationEnabled!==true) return;
  if(ui.locationGateState==='granted') return;
  // Yalnız EFEMER `ui` bayrağını çevirir. `data` yazılmaz, `save()`/senkron
  // tetiklenmez: kalıcı `locationEnabled` zaten true, eksik olan tek şey her
  // açılışta sıfırlanan `ui.locationGateState`'ti. Konum izleme mevcut akışta
  // (foreground/izin akışı) başlar; boot'ta yan etki üretmeyiz.
  function accept(){
    if(ui.locationGateState==='granted') return;
    ui.locationGateState='granted';
    ui.locationGateError='';
    ui.locationGateRequestInFlight=false;
    locationGateResetNudge();
    // Kapı açılınca canlı izleme de başlasın: aksi hâlde sessiz doğrulamayla
    // açılan oturumda hareket/adım verisi bir sonraki foreground olayına kadar
    // boş kalırdı. (Burada moveState/startLocationWatch app.js kapsamındadır.)
    try{ if(moveState.watchId==null) startLocationWatch(false); }catch(e){}
    render();
  }
  // Kapı YALNIZ gerçek bir doğrulamayla açılır; "kayıtlı koordinat var" tek
  // başına yeterli sayılmaz (izin sonradan kaldırılmış olabilir).
  //
  // Yol 1 — Permissions API: Chromium/Firefox'ta kesin cevap verir. Safari'de
  // 'geolocation' adı çoğu sürümde desteklenmez ve query() TypeError atar ya
  // da reject eder; bu yüzden TEK dayanak olamaz (ilk denememde öyleydi ve
  // Safari'de hiç çalışmadı).
  //
  // Yol 2 — sessiz önbellek yoklaması: `locationEnabled` zaten true, yani izin
  // GEÇMİŞTE verilmiş. İzin hâlâ duruyorsa 15 dk'lık önbellek anında döner ve
  // izin penceresi AÇILMAZ; izin kaldırılmışsa sessizce başarısız olur ve kapı
  // kapalı kalır. Boot'u bloklamamak için setTimeout'a ertelenir — headless
  // harness'larda timer'lar bilinçli olarak ölü stub olduğu için bu yol orada
  // hiç çalışmaz, mevcut fixture kapsamı aynen korunur.
  function probeCachedFix(){
    if(!navigator.geolocation) return;
    setTimeout(function(){
      try{
        navigator.geolocation.getCurrentPosition(
          function(){ accept(); },
          function(){},
          {enableHighAccuracy:false,timeout:8000,maximumAge:900000});
      }catch(e){}
    },0);
  }
  try{
    if(navigator.permissions&&navigator.permissions.query){
      var q=navigator.permissions.query({name:'geolocation'});
      if(q&&typeof q.then==='function'){
        q.then(function(st){
          if(!st){ probeCachedFix(); return; }
          if(st.state==='granted'){ accept(); return; }
          // 'denied' → kapı gerçekten kapalı, kullanıcıya doğru mesajı göster.
          if(st.state==='denied'){ locationGateFailure(1,'permission-denied'); return; }
          // 'prompt' → izin penceresi kullanıcı eylemi ister; kapı bekler.
        })['catch'](function(){ probeCachedFix(); });
        return;
      }
    }
  }catch(e){}
  probeCachedFix();
}
App.requestLocationGatePermission=function(){
  // Askıda kalmış eski bir istek düğmeyi ÖLDÜRMEMELİ: Safari izin penceresini
  // hiç göstermeden hiçbir callback çağırmayabilir; eskiden bu durumda
  // `locationGateRequestInFlight` sonsuza kadar true kalıyor ve her yeni
  // dokunuş bu satırda sessizce geri dönüyordu ("Safari izin ekranı
  // bekleniyor…" ekranında kalıcı kilitlenme).
  if(ui.locationGateRequestInFlight&&(Date.now()-(ui.locationGateRequestAt||0))<LOCATION_GATE_RETRY_MS) return;
  stopLocationWatch();
  ui.locationGateRequestInFlight=true;
  ui.locationGateRequestAt=Date.now();
  ui.locationGateRequestSeq=(ui.locationGateRequestSeq||0)+1;
  ui.locationGateState='requesting';
  ui.locationGateError='';
  ui.locationGateLowAccuracyTried=false;
  locationGateResetNudge();
  // Güvenli bağlam kapısı: Safari geolocation'ı yalnız güvenli bağlamda
  // çalıştırır. Değilse prompt hiç çıkmaz ve callback hiç dönmez — bunu
  // beklemek yerine hemen anlaşılır hatayla bitir.
  if(typeof window.isSecureContext==='boolean' && !window.isSecureContext){
    locationGateFailure(0,'insecure-context'); return;
  }
  if(!navigator.geolocation){ locationGateFailure(0,'unsupported'); return; }
  // Gözcü: zincirin tamamı sessizce ölürse kapıyı gerçek hatayla kapat ki
  // düğme yeniden basılabilir olsun.
  var requestToken=ui.locationGateRequestSeq;
  function gateRequestIsCurrent(){ return ui.locationGateRequestInFlight&&ui.locationGateRequestSeq===requestToken; }
  setTimeout(function(){ if(gateRequestIsCurrent()) locationGateFailure(3,'timeout'); },LOCATION_GATE_WATCHDOG_MS);
  function gateFixOk(pos){
    if(!gateRequestIsCurrent()) return;
    locationGateGranted(pos,true);
    if(moveState.watchId==null) startLocationWatch(false);
  }
  function gateFixFail(err){
    if(!gateRequestIsCurrent()) return;
    var code=err&&Number(err.code);
    locationGateFailure(code===1||code===2||code===3?code:0,code===1?'permission-denied':code===2?'position-unavailable':code===3?'timeout':'request-error');
  }
  try{
    // Safari native permission promptunu yalnızca bu açık kullanıcı eyleminden
    // sonra çağırıyoruz; sayfa yüklenirken sessiz/tekrarlı prompt yok.
    // maximumAge 1000 → 300000: 1 sn'lik tazelik dayatması, yüksek hassasiyetle
    // birlikte iç mekânda/masaüstünde neredeyse her zaman zaman aşımına uğrayıp
    // uygulamayı kapıda kilitliyordu. 5 dk'lık önbellek konumu kabul edilir.
    navigator.geolocation.getCurrentPosition(gateFixOk,function(err){
      if(!gateRequestIsCurrent()) return;
      var code=err&&Number(err.code);
      // Zaman aşımında bir kez de düşük hassasiyetle dene: ağ/WiFi tabanlı konum
      // kapıyı açmaya fazlasıyla yeter, GPS kilidi beklemek gerekmez.
      if(code===3&&!ui.locationGateLowAccuracyTried){
        ui.locationGateLowAccuracyTried=true;
        try{
          navigator.geolocation.getCurrentPosition(gateFixOk,gateFixFail,
            {enableHighAccuracy:false,timeout:25000,maximumAge:600000});
          return;
        }catch(e2){}
      }
      gateFixFail(err);
    },{enableHighAccuracy:true,timeout:20000,maximumAge:300000});
  }catch(e){ locationGateFailure(0,'request-error'); return; }
  if(ui.locationGateState==='requesting') render();
};
App.toggleLocation=function(){
  if(!data.settings) data.settings={};
  if(data.settings.locationEnabled){ data.settings.locationEnabled=false; data.settings.locationDisabledAt=new Date().toISOString(); data.settings.locationDisabledReason='manual'; ui.locationGateState='required'; ui.locationGateError=''; stopLocationWatch(); locationGateResetNudge(); save(); render(); toast('Konum paylaşımı kapatıldı'); return; }
  ui.locationConsent=true; render();
};
App.cancelLocationConsent=function(){ ui.locationConsent=false; render(); };
App.confirmLocationConsent=function(){
  ui.locationConsent=false;
  App.requestLocationGatePermission();
};
App.setLocationMode=function(m){
  if(m!=='walk'&&m!=='vehicle'&&m!=='auto') return;
  if(!data.settings) data.settings={};
  data.settings.locationMode=m; save(); render();
  toast(m==='walk'?'Yürüyüş modu':m==='vehicle'?'Araç modu':'Otomatik mod');
};
// ---------- Konum-açma nazik dürtme (sağlık-çerçeveli, dağınık aralıklı) ----------
var LOC_BENEFITS=[
  {i:icon('footprints',17), t:'Adımların kendiliğinden sayılsın — elle uğraşmadan hareket hedefin dolsun.'},
  {i:icon('footprints',17), t:'Günün ne kadarı yürüyüş, ne kadarı koltukta? Konum açıkken ikisi ayrı görünür.'},
  {i:icon('stethoscope',17), t:'Uzun süre aynı yerde kalınca dolaşım yavaşlar; kart sana minik molaları hatırlatır.'},
  {i:icon('dumbbell',17), t:'Aktivite halkaların tahminle değil, gerçek hareketinle dolsun.'},
  {i:icon('leaf',17), t:'Kısa bir yürüyüş bile ruh hâline iyi gelir — ölçmek fark etmeyi kolaylaştırır.'},
  {i:icon('compass',17), t:'Hareketinin haritası çıkınca “bugün az kıpırdadım” günlerini kolayca yakalarsın.'},
  {i:icon('heart',17), t:'Kalbini en çok düzenli hareket mutlu eder; önce onu görünür kılalım.'},
  {i:icon('sun',17), t:'Güne ne kadar hareket kattığını görmek küçük ama gerçek bir motivasyon.'},
  {i:icon('car',17), t:'Uzun yolculuklarda saatler otururken akıp gider; kart yalnızca hareket eden dakikalarını ayrı sayar.'},
  {i:icon('clock',17), t:'Günün kaç saati yolda, kaç dakikası ayakta geçti? İkisini görünce dengeyi kurmak kolaylaşır.'},
  {i:icon('route',17), t:'Kat ettiğin yolun ne kadarı tekerlekte, ne kadarı adımlarında? Konum açıkken ikisi ayrılır.'},
  {i:icon('activity',17), t:'Uzun oturuşlarda bacak dolaşımı yavaşlar; kart minik mola vaktini nazikçe hatırlatır.'},
  {i:icon('armchair',17), t:'Koltukta geçen süre sessizce birikir; ölçünce kısa aralar güne kendiliğinden serpilir.'},
  {i:icon('car',17), t:'Bugün kaç km yol yaptın? Mesafeni görmek arada bir esneme molasını hatırlatır.'},
  {i:icon('clock',17), t:'Aynı pozisyonda geçen uzun dakikalar sırtı yorar; kart kıpırdama zamanını gösterir.'},
  {i:icon('droplet',17), t:'Uzun yolda su içmek ve birkaç adım dolaşımı korur; kart bu ritmi tutmana yardımcı olur.'},
  {i:icon('droplets',17), t:'Uzun süre sabit kalınca ayaklarda şişlik olabilir; hareket dakikaların görününce dengelemek kolay.'},
  {i:icon('brain',17), t:'Yol yorgunluğu zihni de yorar; kısa bir yürüyüş molası odağını tazeler — kart anını yakalar.'},
  {i:icon('target',17), t:'Adım hedefin yolda eriyorsa kart seni nazikçe uyarır; akşam küçük bir tur telafi eder.'},
  {i:icon('wind',17), t:'Derin bir nefes ve birkaç adım, uzun sürüşün gerginliğini alır; kart mola vaktini hatırlatır.'}
];
var LOC_NUDGE={ minGapH:1/6, maxPerDay:999, prob:1, delayMinMs:1500, delayMaxMs:3000, dwellMs:8000, laterH:1/6, dismissH:1/6, backoffH:0, backoffMaxH:1/6, stopAfter:9999, whisperDays:1 };
var locNudgeTimer=null;
function ensureLocNudge(){
  if(!data) return null;
  if(!data.locNudge||typeof data.locNudge!=='object') data.locNudge={};
  var ln=data.locNudge;
  if(typeof ln.shownCount!=='number') ln.shownCount=0;
  if(typeof ln.dismissCount!=='number') ln.dismissCount=0;
  if(typeof ln.dismissStreak!=='number') ln.dismissStreak=0;
  if(typeof ln.benefitIdx!=='number') ln.benefitIdx=0;
  if(typeof ln.optedOut!=='boolean') ln.optedOut=false;
  if(typeof ln.dayCount!=='number') ln.dayCount=0;
  if(typeof ln.dayKey!=='string') ln.dayKey='';
  if(typeof ln.lastShownAt!=='string') ln.lastShownAt='';
  if(typeof ln.snoozeUntil!=='string') ln.snoozeUntil='';
  if(typeof ln.optOutDay!=='string') ln.optOutDay='';
  return ln;
}
function locNudgeEligible(){
  if(!data||!data.settings) return false;
  if(locationGateRequired()) return false;
  if(data.settings.locationEnabled) return false;        // konum açıksa asla
  if(ui.locNudgeOpen) return false;                      // zaten açık
  if(ui.tab!=='bugun'&&ui.tab!=='saglik') return false;  // yalnız sağlıkla ilgili sekmeler
  if(editing()) return false;
  if(ui.locationConsent||ui.dayDetail||ui.emergency||ui.resetStep>0||ui.readingOpen||ui.watchOpen||ui.listeningOpen||ui.learningOpen||ui.weatherOpen||ui.roomOpen||ui.forceStart) return false;
  var ln=ensureLocNudge(); if(!ln) return false;
  var now=Date.now(), t=todayStr();
  if(ln.dayKey!==t){ ln.dayKey=t; ln.dayCount=0; }
  if(ln.optOutDay===t) return false;                     // "bugün gösterme" → yalnız bugünlük sus
  if(ln.dayCount>=LOC_NUDGE.maxPerDay) return false;
  if(ln.snoozeUntil){ var su=new Date(ln.snoozeUntil).getTime(); if(!isNaN(su)&&now<su) return false; }
  var gapH=(ln.dismissCount>=LOC_NUDGE.stopAfter)?(LOC_NUDGE.whisperDays*24):LOC_NUDGE.minGapH;
  if(ln.lastShownAt){ var ls=new Date(ln.lastShownAt).getTime(); if(!isNaN(ls)&&(now-ls)<gapH*3600000) return false; }
  return true;
}
function tryLocNudge(reason){
  if(locNudgeTimer) return;
  if(!locNudgeEligible()) return;
  if(Math.random()>LOC_NUDGE.prob) return;               // dağınık his (her fırsatta değil)
  var span=LOC_NUDGE.delayMaxMs-LOC_NUDGE.delayMinMs;
  var delay=LOC_NUDGE.delayMinMs+Math.round(Math.random()*span);
  locNudgeTimer=setTimeout(function(){ locNudgeTimer=null; openLocNudgeNow(); }, delay);
}
function openLocNudgeNow(){
  if(!locNudgeEligible()) return;                        // gecikme sırasında koşul değiştiyse iptal
  var ln=ensureLocNudge(); var n=LOC_BENEFITS.length;
  var count=(Math.random()<0.5)?1:2, picks=[];
  for(var i=0;i<count;i++){ picks.push(LOC_BENEFITS[(ln.benefitIdx+i)%n]); }
  ln.benefitIdx=(ln.benefitIdx+count)%n;
  ui.locNudgeShown=picks; ui.locNudgeOpen=true;
  ln.lastShownAt=new Date().toISOString(); ln.shownCount++; ln.dayCount++;
  save(); render();
}
function closeLocNudge(kind){
  var ln=ensureLocNudge(); var now=Date.now();
  ln.dismissCount++; ln.dismissStreak=(ln.dismissStreak||0)+1;
  var baseH=(kind==='later')?LOC_NUDGE.laterH:LOC_NUDGE.dismissH;
  var backoff=Math.min(LOC_NUDGE.backoffMaxH, ln.dismissStreak*LOC_NUDGE.backoffH);
  ln.snoozeUntil=new Date(now+(baseH+backoff)*3600000).toISOString();
  ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render();
}
App.locNudgeOpenConsent=function(){ ui.locNudgeOpen=false; ui.locNudgeShown=[]; ui.locationConsent=true; render(); };
App.locNudgeSnooze=function(){ closeLocNudge('later'); };
App.locNudgeDismiss=function(){ closeLocNudge('dismiss'); };
App.locNudgeOptOut=function(){ var ln=ensureLocNudge(); if(ln) ln.optOutDay=todayStr(); ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render(); toast('Tamam, bugünlük kapattım — yarın yine buradayım'); };
App.toggleWeather=function(){
  ui.weatherOpen=!ui.weatherOpen;
  // MON-35: persisted consent is not a boot-time GPS trigger; opening the
  // weather surface is an explicit user path and may resume live location.
  if(ui.weatherOpen && data&&data.settings&&data.settings.locationEnabled&&moveState.watchId==null) startLocationWatch(false);
  render();
  if(ui.weatherOpen) maybeFetchWeather();
};
App.toggleDailyPhoto=function(){ ui.dailyPhotoOpen=true; render(); maybeFetchDailyPhoto(dailyPhotoSelectedDate()); };
App.dailyPhotoMove=function(delta){
  var step=Number(delta)<0?-1:1, target=addDays(dailyPhotoSelectedDate(),step);
  if(target>todayStr()) return;
  ui.dailyPhotoDate=target; ui.dailyPhotoOpen=true; render(); maybeFetchDailyPhoto(target);
};
App.refreshDailyPhoto=function(){ fetchDailyPhoto(dailyPhotoSelectedDate(),true); };
function prefersReducedMotion(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
// Premium akordeon: gövdeyi (.sey-collbody) ölçülmüş max-height ile yumuşakça aç/kapat.
// Layout sıçraması yok; kapanınca DOM'u yeni (kapalı) hâle çevirir.
function animateCardCollapse(el, done){
  var body=el&&el.querySelector('.sey-collbody');
  var chev=el&&el.querySelector('.sey-collchev');
  if(chev) chev.style.transform='rotate(0deg)';
  if(!body || prefersReducedMotion()){ done(); return; }
  var hpx=body.scrollHeight+'px';
  body.style.overflow='hidden'; body.style.maxHeight=hpx; body.style.opacity='1';
  body.getBoundingClientRect(); // reflow
  body.style.transition='max-height .26s var(--ease-premium,cubic-bezier(.33,1,.68,1)),opacity .2s ease';
  body.style.maxHeight='0px'; body.style.opacity='0';
  var fired=false, fin=function(){ if(fired) return; fired=true; done(); };
  body.addEventListener('transitionend', fin, {once:true});
  setTimeout(fin, 340);
}
function animateCardExpand(el){
  var body=el&&el.querySelector('.sey-collbody');
  if(!body || prefersReducedMotion()) return;
  var hpx=body.scrollHeight+'px';
  body.style.overflow='hidden'; body.style.maxHeight='0px'; body.style.opacity='0';
  body.getBoundingClientRect(); // reflow
  body.style.transition='max-height .3s var(--ease-premium,cubic-bezier(.33,1,.68,1)),opacity .26s ease';
  body.style.maxHeight=hpx; body.style.opacity='1';
  var clear=function(){ body.style.maxHeight=''; body.style.overflow=''; body.style.transition=''; body.style.opacity=''; };
  body.addEventListener('transitionend', clear, {once:true});
  setTimeout(clear, 380);
}
App.toggleCard=function(key){
  if(!ui.cards) ui.cards={};
  var willOpen=!ui.cards[key];
  // Yerinde güncelleme yalnızca CARD_BUILDERS'ta kayıtlı kartlar için çalışır.
  // Kayıtsız kartlar (ör. SOS "ne denedin"/"tetikleyici" kartları) eskiden yerinde
  // yenilenemediği için aç/kapa tıklaması sessizce çalışmıyordu — bu güvenli yol,
  // kayıtsız kartlarda durumu değiştirip tam render ederek kesin ve anlaşılır kılar.
  if(!CARD_BUILDERS[key]){ ui.cards[key]=willOpen; haptic(8); render(); return; }
  var el=document.querySelector('[data-cardkey="'+key+'"]');
  if(!el){
    // Kart DOM'da yoksa (ör. headless render veya stale state) tam render'a düş.
    ui.cards[key]=willOpen; haptic(8); render(); return;
  }
  if(!willOpen && el){
    animateCardCollapse(el, function(){ ui.cards[key]=false; updateCardByKey(key); });
    return;
  }
  ui.cards[key]=true;
  updateCardByKey(key);
  var el2=document.querySelector('[data-cardkey="'+key+'"]'); if(el2) animateCardExpand(el2);
};
function updateMotivationCard(){
  // Terapi Odası açıkken içerik tam ekran overlay'de; küçültme vb. değişimlerde
  // tüm ekranı yeniden çiz. Kapalıyken kompakt kartı yerinde güncelle.
  if(ui.roomOpen){ render(); return; }
  var el=document.getElementById('sey-motivation-card'); if(!el) return;
  var t=document.createElement('div'); t.innerHTML=motivationTodayCardHTML();
  if(t.firstChild) el.replaceWith(t.firstChild);
}
// Tam ekran Terapi Odası: dokununca animasyonlu açılır, kapanınca animasyonlu
// İçsel Pusula kartına döner.
App.openRoom=function(){
  if(!featuresLive()){ toast('İçsel Pusula 13 Temmuz\'da açılıyor'); return; }
  if(!ui.reminderTargetReturnFocusId){
    var activeRoomFocusId=reminderActiveElementId();
    if(activeRoomFocusId) ui.reminderTargetReturnFocusId=activeRoomFocusId;
  }
  ui.roomOpen=true; ui.motivationMinimumOpen=false; ui.roomTab='path'; ui.roomTool=null;
  // Kaydedilmiş günü düzenleyebilmek için: bugünün kaydı varsa yansımayı input'a getir.
  var M=window.MotivationProgramV2, stt=M?M.dayState(data,activeDate()):null;
  var done=!!(stt&&(stt.status==='completed'||stt.status==='minimum_completed'));
  if(done) ui.motivationReflectionDraft=String(stt.reflection||'');
  haptic(12); reminderLockBodyScroll(); render();
  try{ var roomDialog=document.getElementById('sey-room-dialog'); if(roomDialog&&roomDialog.focus) roomDialog.focus(); }catch(e){}
};
App.closeRoom=function(){
  var targetFocusId=ui.reminderTargetReturnFocusId||'sey-motivation-card';
  clearRoomTimers();
  reminderUnlockBodyScroll();
  var ov=document.getElementById('sey-room-overlay'), sh=document.getElementById('sey-room-dialog');
  if(ov&&sh&&!prefersReducedMotion()){
    sh.style.transition='transform .26s var(--ease-premium,cubic-bezier(.16,1,.3,1)),opacity .24s ease';
    sh.style.transform='scale(.965)'; sh.style.opacity='0';
    ov.style.transition='opacity .24s ease'; ov.style.opacity='0';
    setTimeout(function(){ ui.roomOpen=false; ui.reminderTargetReturnFocusId=''; render(); reminderRestoreFocus(targetFocusId,'sey-motivation-card'); },240);
  } else { ui.roomOpen=false; ui.reminderTargetReturnFocusId=''; render(); reminderRestoreFocus(targetFocusId,'sey-motivation-card'); }
  haptic(8);
};
function clearRoomTimers(){
  if(ui.roomBreathTimer){ clearInterval(ui.roomBreathTimer); ui.roomBreathTimer=null; }
  if(ui.roomDecisionTimer){ clearInterval(ui.roomDecisionTimer); ui.roomDecisionTimer=null; }
  if(ui.roomFirstTimer){ clearInterval(ui.roomFirstTimer); ui.roomFirstTimer=null; }
  ui.roomBreathActive=false;
}
App.updateRoom=function(){
  var M=window.MotivationProgramV2;
  if(!M||!data||!ui.roomOpen) return;
  if(!featuresLive()) return;
  var root=M.ensureMotivationRoot(data); if(!root) return;
  var mot=M.activeDay(data); if(!mot) return;
  var sum=M.progressSummary(data);
  var st=M.dayState(data,activeDate());
  var doneToday=!!(st&&(st.status==='completed'||st.status==='minimum_completed'));
  var nar=(window.MotivationNarratives&&window.MotivationNarratives.dayNarrative)?window.MotivationNarratives.dayNarrative(mot):null;
  var fi=function(delay){ return 'animation:seyFloatIn .45s '+delay+'s ease both;'; };
  var tabs=document.getElementById('sey-room-tabs');
  var body=document.getElementById('sey-room-body');
  var scrollTop=body?body.scrollTop:0;
  if(tabs) tabs.innerHTML=segTabs([['path','Yol','compass'],['tools','Araçlar','heart-handshake'],['profile','Profilim','sparkles']], ui.roomTab, 'App.setRoomTab', 'room');
  if(body){ body.innerHTML=roomBodyHTML(M,mot,sum,st,doneToday,nar,fi); body.scrollTop=scrollTop; }
};
App.setRoomTab=function(tab){ if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') { window.SeyHaptics.tap(); } ui.roomTab=tab; ui.roomTool=null; haptic(6); App.updateRoom(); };
App.toggleRoomTool=function(id){ ui.roomTool=(ui.roomTool===id?null:id); haptic(8); App.updateRoom(); };
// Geriye dönük uyumluluk (eski çağrılar tam ekran odayı açsın).
App.toggleMotivationCard=function(){ if(ui.roomOpen) App.closeRoom(); else App.openRoom(); };
App.goStart=function(){ ui.forceStart=true; ui.tab='bugun'; render(); };
App.startDateChange=function(el){ var v=el.value; if(!v) return; data.startDate=v; commit('Başlangıç tarihi güncellendi'); };
App.setBirthDate=function(el){ var v=el.value; data.settings.birthDate=v; refreshTargets(); commit('Doğum tarihi kaydedildi'); App.toast('Doğum tarihi kaydedildi'); render(); };
App.setActivityLevel=function(level){ if(!data.settings.targets) data.settings.targets={calories:null,protein:null,carbs:null,fat:null,fiber:null,waterCups:null,steps:null,sleepHours:null,caffeineMaxMg:null,magnesiumMg:null,ironMg:null,omega3Mg:null,vitaminDIU:null,bmr:null,tdee:null,activityLevel:'moderate',lastCalculatedAt:''}; data.settings.targets.activityLevel=level; refreshTargets(); commit('Aktivite seviyesi güncellendi'); App.toast('Aktivite seviyesi güncellendi'); render(); };

// Rastgele, bir öncekiyle asla aynı olmayan indeks seç.
function randNoteIdx(n,cur){ if(n<2) return 0; var t; do{ t=Math.floor(Math.random()*n); }while(t===cur); return t; }
App.anotherNote=function(){ var n=NOTES.length, cur=((ui.noteIndex%n)+n)%n; ui.noteIndex=randNoteIdx(n,cur); render(); };
App.cycleRasit=function(){
  var n=NOTES.length, base=Math.max(1,dayIndexFor(activeDate()))-1;
  var curDisp=((base+(ui.noteIndex||0))%n+n)%n;
  var target=randNoteIdx(n,curDisp);
  ui.noteIndex=((target-base)%n+n)%n; // görüntülenen indeks tam olarak `target` olur
  var el=document.getElementById('sey-rasit-note');
  if(el){ el.style.opacity='0'; setTimeout(function(){ el.textContent=NOTES[target]; el.style.opacity='1'; },150); }
  haptic(10); save();
};
App.printReport=function(){ openReport(); };
function syncFieldUpdate(){ var s=document.getElementById('sey-sync-status'); if(s&&window.SeySync) s.textContent=window.SeySync.statusText(); }
App.setGhToken=function(el){ if(!data.settings) data.settings={}; data.settings.ghToken=normalizeToken(el.value||''); save(); syncFieldUpdate(); };
// Anahtarı kopyalama kaynaklı bozulmalardan temizle: "Bearer " öneki, tırnaklar,
// boşluklar ve görünmez (zero-width) karakterler 401 hatasının başlıca sebebidir.
function sanitizeApiKey(v){ var s=String(v||'').trim(); s=s.replace(/^Bearer\s+/i,''); s=s.replace(/^["'`]+|["'`]+$/g,''); s=s.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g,''); return s; }
// OpenAI hata kodlarını kullanıcının anlayacağı Türkçe mesaja çevir.
function openaiErrText(status,raw){ var m=String(raw||''); if(status===401||/invalid_api_key|Incorrect API key/i.test(m)) return 'OpenAI anahtarın geçersiz görünüyor. Ayarlar’dan doğru anahtarı (sk-…) yapıştırıp “Kaydet ve doğrula” yap.'; if(status===429||/insufficient_quota|exceeded your current quota/i.test(m)) return 'OpenAI hesabının kullanım kotası/bakiyesi dolmuş olabilir. platform.openai.com → Billing’den bakiye ekleyip tekrar dene.'; if(status===404||/model_not_found|does not exist|do not have access/i.test(m)) return 'Hesabın istenen yapay zekâ modeline erişemiyor. Farklı bir anahtar dene ya da model erişimi iste.'; if(status===403) return 'Erişim reddedildi (403). Anahtarının izinleri yetersiz olabilir.'; if(status===500||status===502||status===503) return 'OpenAI sunucusu şu an yanıt vermiyor. Birkaç dakika sonra tekrar dene.'; if(!status) return 'İnternet bağlantısı kurulamadı. Bağlantını kontrol edip tekrar dene.'; return 'Beklenmeyen bir hata oluştu ('+status+'). Birazdan tekrar dene.'; }
App.setOpenaiKey=function(el){ var v=el.value; if(ui.openaiKeyState&&ui.openaiKeyState!=='checking') ui.openaiKeyState=null; debounceSave('openaiKey',function(){ if(!data.settings) data.settings={}; data.settings.openaiKey=String(v||'').trim(); data.settings.lunaConnected=!!data.settings.openaiKey; save(); },500); };
App.saveOpenaiKey=function(){
  var inp=document.querySelector('input[oninput*="setOpenaiKey"]');
  var key=inp?sanitizeApiKey(inp.value):sanitizeApiKey((data.settings&&data.settings.openaiKey)||'');
  if(!data.settings) data.settings={};
  data.settings.openaiKey=key; data.settings.lunaConnected=!!key; if(inp) inp.value=key; save();
  if(!key){ ui.openaiKeyState=null; render(); toast('Anahtar temizlendi'); return; }
  if(key.slice(0,3)!=='sk-'){ ui.openaiKeyState='invalid'; render(); toast('Anahtar “sk-” ile başlamalı — OpenAI anahtarını kontrol et'); return; }
  ui.openaiKeyState='checking'; render();
  fetch('https://api.openai.com/v1/models',{headers:{'Authorization':'Bearer '+key}})
    .then(function(r){
      if(r.ok){ ui.openaiKeyState='valid'; if(data.settings) data.settings.lunaConnected=true; save(); render(); toast('Anahtar doğrulandı ✓'); }
      else if(r.status===401){ ui.openaiKeyState='invalid'; if(data.settings) data.settings.lunaConnected=false; save(); render(); toast('Anahtar geçersiz — kopyalarken karakter eksik/fazla olabilir'); }
      else if(r.status===429){ ui.openaiKeyState=null; render(); toast('Anahtar kaydedildi ama kota/bakiye dolu olabilir ⏳'); }
      else { ui.openaiKeyState=null; render(); toast('Kaydedildi (doğrulanamadı, '+r.status+')'); }
    })
    .catch(function(){ ui.openaiKeyState=null; render(); toast('Kaydedildi (ağ doğrulaması yapılamadı)'); });
};
App.setGhRepo=function(el){ if(!data.settings) data.settings={}; data.settings.ghRepo=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.setHealthGistId=function(el){ if(!data.settings) data.settings={}; data.settings.healthGistId=normalizeToken(el.value||''); debounceSave('healthGistId',function(){ save(); },400); };
App.setGhBranch=function(el){ if(!data.settings) data.settings={}; data.settings.ghBranch=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.syncNow=function(){ if(window.SeySync){ window.SeySync.pushNow(); toast('Kaydediliyor…'); } else { toast('Sync hazır değil'); } };
// QY-22: Hata artik "olmadi" demekle yetinmez, NEDENINI soyler. Kullanici
// panelde kirmizi bir duvar gorup sebebini bilememisti; sebep receipt'te
// zaten yaziliydi, sadece hicbir yerde gosterilmiyordu.
function syncFailureText(){
  var code=''; try{ code=(data&&data.syncReceipt&&data.syncReceipt.lastErrorCode)||''; }catch(e){}
  if(code==='conflict') return 'Başka bir cihaz aynı anda yazmış · birleştirip tekrar denedik, yine olmadı. Birazdan tekrar dene.';
  if(code==='anti_clobber') return 'Uzakta seninkinden fazla gün var · veri kaybını önlemek için durduruldu.';
  if(code==='remote_unreadable') return 'Uzak kayıt okunamadı · üzerine yazmamak için durduruldu.';
  if(code==='unauthorized'||code==='forbidden'||code==='permission') return 'Bağlantı izni geçersiz · Ayarlar\'dan repo bağlantını yenile.';
  if(code==='not_found') return 'Repo veya dosya bulunamadı · Ayarlar\'daki repo adını kontrol et.';
  if(code==='rate_limited') return 'Sunucu sınırı · birkaç dakika sonra kendiliğinden yeniden denenecek.';
  if(code==='offline'||code==='network'||code==='timeout') return 'Bağlantı yok veya çok yavaş · çevrimiçi olunca kendiliğinden gönderilecek.';
  if(code==='receipt_failed') return 'Veri gitti ama uzak kabul makbuzu alınamadı · tekrar dene.';
  return 'Eşitlenemedi · verin cihazında güvende, birazdan tekrar dene.';
}
App.saveNow=function(){
  ui.saveActionPending=true;
  save();
  if(!syncConfigured()){
    ui.saveActionPending=false; ui.saveState='local'; updateHeaderSave();
    toast('Cihazına kaydedildi · panele gitmesi için Ayarlar\'dan repoya bağlan',2800);
    return;
  }
  if(window.SeySync&&typeof window.SeySync.pushNow==='function'){
    ui.saveState='saving'; updateHeaderSave();
    try{
      var pending=window.SeySync.pushNow();
      if(pending&&typeof pending.then==='function') pending.then(function(rc){ if(rc) return; ui.saveActionPending=false; if(ui.saveState==='saving'){ ui.saveState='error'; updateHeaderSave(); } toast(syncFailureText(),3800); },function(){ ui.saveActionPending=false; if(ui.saveState==='saving'){ ui.saveState='error'; updateHeaderSave(); } toast(syncFailureText(),3800); });
    }catch(e){ ui.saveActionPending=false; ui.saveState='error'; updateHeaderSave(); toast(syncFailureText(),3800); }
    toast('Panel ile eşitleniyor…');
  } else {
    ui.saveActionPending=false;
    ui.saveState='error'; updateHeaderSave();
    toast('Eşitleme hazır değil · verin cihazında korundu',2600);
  }
};
App.headerSync=App.saveNow;
App.saveToday=function(){ return SEYMA_APP_SURFACE.saveToday.apply(null,arguments); };
App.enableKeyEdit=function(){ ui.keyEdit=true; render(); };
App.cancelKeyEdit=function(){ ui.keyEdit=false; render(); };

// ---------- report (print -> Safari "PDF olarak kaydet") ----------
function reportHTML(){ return SEYMA_RENDER.reportHTML.apply(null,arguments); }
function getStats(){
  var days=allDays(); var keys=HABITS.map(function(h){return h.key;}); var tot={}; keys.forEach(function(k){tot[k]=0;});
  var total=0; var moods={};
  days.forEach(function(d){ if(d.rec){ keys.forEach(function(k){ if(d.rec.habits[k]) tot[k]++; }); total+=countRec(d.rec); if(d.rec.mood) moods[d.rec.mood]=(moods[d.rec.mood]||0)+1; } });
  return {tot:tot,total:total,best:bestStreak(days),mood:topMood(moods),days:days};
}
function openReport(){
  var w=window.open('','_blank');
  if(!w){
    // Quick Look / pop-up engelli: aynı sayfada yazdırılabilir katman
    inlinePrint(); return;
  }
  var doc='<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Şeyma 🦩 Rapor</title>'
    +'<style>@page{margin:14mm;}body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;margin:0;padding:24px;}@media print{.noprint{display:none;}}</style></head><body>'
    +'<div class="noprint" style="text-align:center;margin-bottom:18px;"><button onclick="window.print()" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:var(--f-subhead);padding:12px 22px;border-radius:12px;cursor:pointer;">Yazdır / PDF kaydet</button></div>'
    +reportHTML()+'</body></html>';
  w.document.open(); w.document.write(doc); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} },500);
}
function inlinePrint(){
  var ov=document.getElementById('sey-print'); if(ov) ov.remove();
  var ov2=document.createElement('div'); ov2.id='sey-print';
  ov2.innerHTML='<style>@media print{body *{visibility:hidden;}#sey-print,#sey-print *{visibility:visible;}#sey-print{position:absolute;left:0;top:0;width:100%;}#sey-print .pbar{display:none;}}</style>'
    +'<div class="pbar" style="position:sticky;top:0;display:flex;gap:10px;justify-content:center;padding:12px;background:#fff;border-bottom:1px solid #eee;">'
    +'<button id="sey-print-do" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:var(--f-subhead);padding:12px 22px;border-radius:12px;">Yazdır / PDF kaydet</button>'
    +'<button id="sey-print-close" style="border:1px solid #ddd;background:#fff;color:#555;font-weight:600;font-size:var(--f-subhead);padding:12px 18px;border-radius:12px;">Kapat</button></div>'
    +'<div style="max-width:780px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;">'+reportHTML()+'</div>';
  ov2.style.cssText='position:fixed;inset:0;z-index:9999;background:#fff;overflow:auto;-webkit-overflow-scrolling:touch;';
  document.body.appendChild(ov2);
  document.getElementById('sey-print-do').onclick=function(){ window.print(); };
  document.getElementById('sey-print-close').onclick=function(){ ov2.remove(); };
}

// ---------- render ----------
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d; }

function needsAuth(){
  if(!data||!data.settings||!data.settings.auth) return true;
  var a=data.settings.auth;
  // Bu oturumda açıldıysa kilidi aş.
  if(ui.authUnlocked) return false;
  // "Beni hatırla" seçiliyse ve daha önce doğru giriş yapıldıysa kilidi aş.
  if(a.rememberMe&&a.usernameHash&&a.unlockedAt) return false;
  return true;
}

function authGateHTML(){ return SEYMA_RENDER.authGateHTML.apply(null,arguments); }

function locationGateHTML(){ return SEYMA_RENDER.locationGateHTML.apply(null,arguments); }

// TAM-DENETIM B-02: canlı zemin (saat + hava + mevsim) yalnız #root'un sınıf
// listesine yazar; #app içeriğine hiç bakmaz. Eskiden render()'ın SONUNDA
// çağrılıyordu, oysa render() dört yerde erken dönüyor (auth / konum kapısı /
// onboarding / profil kapısı) — bu yüzden kapı ekranlarında #root.className
// tamamen BOŞ kalıyor, premium atmosferin hiçbiri görünmüyordu. Denetimde
// ölçüldü: kapıda rootClass="", ambCount=0, oysa SeyAmbience.scene() geçerli
// bir sahne hesaplıyordu. Artık en başta çağrılıyor: her ekran zemini alır.
function paintAmbientShell(){
  if(window.SeyTimeTheme && typeof window.SeyTimeTheme.apply==='function'){
    try{ window.SeyTimeTheme.apply(); }catch(e){}
  }
  try{ if(window.SeyAmbience && typeof window.SeyAmbience.apply==='function') window.SeyAmbience.apply(); }catch(e){}
  // Mevsim/mübarek gün vurgusu: `#root.theme-season-*` blokları yalnız
  // applySeasonal() ile takılır. apply() ile aynı premiumAtmosphere gating'i.
  if(window.SeyTimeTheme && typeof window.SeyTimeTheme.applySeasonal==='function'){
    try{ window.SeyTimeTheme.applySeasonal(); }catch(e){}
  }
}
function render(){ var result=SEYMA_RENDER.render.apply(null,arguments); if(ui.kaoOpen) window.SeymaQuranLearn.kaoMount(); return result; }

// MON-44: onboarding render core; state/theme/App ownership stays in app.js.
function onboardingHTML(){ return SEYMA_RENDER.onboardingHTML.apply(null,arguments); }


function psychFlat(){ return window.SeymaProfile.psychFlat.apply(null,arguments); }
function psychBuildQA(ans){ return window.SeymaProfile.psychBuildQA.apply(null,arguments); }
function psychOptions(sid,qi,s,cur){ return window.SeymaProfile.psychOptions.apply(null,arguments); }
function psychMotiv(idx,T){ return window.SeymaProfile.psychMotiv.apply(null,arguments); }
function psychReachCreator(){ return window.SeymaProfile.psychReachCreator.apply(null,arguments); }
function psychSosHTML(){ return SEYMA_RENDER.psychSosHTML.apply(null,arguments); }
function psychHTML(){ return SEYMA_RENDER.psychHTML.apply(null,arguments); }
function psychResultHTML(){ return SEYMA_RENDER.psychResultHTML.apply(null,arguments); }
App.psychBegin=function(){ return window.SeymaProfile.psychBegin.apply(null,arguments); };
App.psychToggleSrc=function(){ return window.SeymaProfile.psychToggleSrc.apply(null,arguments); };
App.psychAnswer=function(sid,qi,oi){ return window.SeymaProfile.psychAnswer.apply(null,arguments); };
App.psychFwd=function(){ return window.SeymaProfile.psychFwd.apply(null,arguments); };
App.psychBack=function(){ return window.SeymaProfile.psychBack.apply(null,arguments); };
App.psychSOS=function(){ return window.SeymaProfile.psychSOS.apply(null,arguments); };
App.psychSOSClose=function(){ return window.SeymaProfile.psychSOSClose.apply(null,arguments); };
App.psychReachCreator=function(){ return window.SeymaProfile.psychReachCreator.apply(null,arguments); };
App.psychFinish=function(){ return window.SeymaProfile.psychFinish.apply(null,arguments); };

// Makro kalori dağılım çubuğu (protein/karbonhidrat/yağ — kalori payına göre).
function macroBarHTML(){ return SEYMA_HEALTH.macroBarHTML.apply(null,arguments); }
// Birleşik "Beslenme" kartı: özet (makro) + "ne yedim" öğün düzenleyici, açılır/kapanır.
// Beslenme için veri-güdümlü, bilimsel premium değerlendirme. Öğün girişleriyle
// canlı güncellenir (updateNutriLive). Lif ayrı takip edilmediğinden yönlendirici
// (öneri) olarak geçer; protein/makro/glisemik okuması gerçek veriden hesaplanır.
function nutriInsightHTML(){ return SEYMA_HEALTH.nutriInsightHTML.apply(null,arguments); }
function beslenmeCardHTML(){ return SEYMA_HEALTH.beslenmeCardHTML.apply(null,arguments); }
CARD_BUILDERS.beslenme=beslenmeCardHTML;

// Bugün ekranında kısa "Hedeflerim" kartı — dokununca Sağlık sayfasına götürür.
function targetsCardHTML(){ return SEYMA_HEALTH.targetsCardHTML.apply(null,arguments); }

function waterCard(){ return SEYMA_HEALTH.waterCard.apply(null,arguments); }
// Enerji & stres — belirgin, etiketli 1–5 skalaları (kullanıcı bunları kaçırmasın).
function energyStressBlock(rec){
  var en=rec?rec.energy:null, st=rec?rec.stress:null;
  function scale(label,ic,cur,fn,lo,hi,grad){
    var s='<div style="display:flex;flex-direction:column;gap:6px;">';
    s+='<div style="display:flex;align-items:center;gap:6px;font-size:var(--f-footnote);font-weight:800;color:var(--text);"><span style="display:inline-flex;color:var(--muted);">'+ic+'</span>'+label+(cur!=null?'<span style="margin-left:auto;font-size:var(--f-caption2);font-weight:700;color:var(--accent-ink);">'+cur+'/5</span>':'')+'</div>';
    s+='<div style="display:flex;gap:6px;">';
    for(var v=1;v<=5;v++){ var sel=cur===v; s+='<button onclick="App.'+fn+'('+v+')" aria-label="'+v+'" style="flex:1;height:38px;border-radius:12px;cursor:pointer;font-size:var(--f-footnote);font-weight:800;transition:all .18s;'+(sel?'background:linear-gradient(135deg,'+grad+');border:1px solid transparent;color:#fff;box-shadow:0 6px 14px rgba(150,110,120,0.28);transform:translateY(-2px);':'background:var(--card);border:1px solid var(--card-bd);color:var(--faint);')+'">'+v+'</button>'; }
    s+='</div>';
    s+='<div style="display:flex;justify-content:space-between;font-size:var(--f-caption2);color:var(--faint);"><span>'+lo+'</span><span>'+hi+'</span></div>';
    s+='</div>';
    return s;
  }
  var h='<div style="border-top:1px solid var(--card-bd);padding-top:12px;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.4;">Enerji ve stres, ruh hâlinin iki ayrı ekseni; ikisini de işaretlemek moduna daha net bakmanı sağlar.</div>';
  h+=scale('Enerji',icon('zap',14),en,'setEnergy','tükenmiş','çok dinç','#FFD37A,#F5A623');
  h+=scale('Stres',icon('wind',14),st,'setStress','sakin','çok gergin','#C9B8FF,#7C5CC4');
  h+='</div>';
  return h;
}
function moodInterp(mood,en,st){
  if(st!=null&&en!=null){
    if(st>=4&&en<=2) return 'Yüksek stres, düşük enerji: bugün küçük molalar, su ve nazik bir yürüyüş iyi gelebilir.';
    if(en>=4&&st<=2) return 'Enerjin yüksek, stresin düşük — bu güzel ritmi bir yürüyüşle taçlandırabilirsin.';
    if(st>=4) return 'Stres bugün yüksek; birkaç derin nefes ve tempolu bir mola dengeyi geri getirir.';
    if(en<=2) return 'Enerji biraz düşük görünüyor; kendine yüklenme, küçük adımlar da bugün için yeterli.';
  }
  return '';
}
// Birleşik "mod" kartı: mod seçimi + belirgin enerji/stres + kısa yorum, açılır/kapanır.
function moodCardHTML(rec){ return SEYMA_RENDER.moodCardHTML.apply(null,arguments); }
CARD_BUILDERS.mood=moodCardHTML;
// Birleşik "Günün yansıması" kartı: kendine not + 3 güzel şey, bilimsel çerçeve + rehber soru.
var REFLECT_PROMPTS=[
  'Bugün seni gülümseten en küçük an neydi?',
  'Bugün kendinle gurur duyduğun bir şey oldu mu?',
  'Bugün sana en çok iyi gelen neydi?',
  'Zor bir anı bugün nasıl atlattın?',
  'Bugün bedenine yaptığın bir iyilik neydi?',
  'Yarının sana bir cümle bırak: ne hatırlamak istersin?',
  'Bugün fark ettiğin küçük bir güzellik neydi?',
  'Bugün kendine hangi konuda daha kibar davrandın?'
];
function reflectionCardHTML(rec){ return SEYMA_RENDER.reflectionCardHTML.apply(null,arguments); }
CARD_BUILDERS.reflection=reflectionCardHTML;
// "Bugünün tikleri" — açılır/kapanır kart; başlıkta ilerleme halkası + sayaç.
function habitsCardHTML(rec){ return SEYMA_RENDER.habitsCardHTML.apply(null,arguments); }
CARD_BUILDERS.habits=habitsCardHTML;
function eveningNudge(rec){
  var hr=new Date().getHours();
  if(hr<20&&hr>4) return '';
  var rd=readingStats(rec);
  if(rd.count>0) return '';
  return '<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);border-radius:20px;padding:15px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 26px rgba(110,85,191,0.35);">'
    +'<span style="flex-shrink:0;display:inline-flex;">'+icon('book-open',24)+'</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:#fff;">Gece yaklaşıyor</div><div style="font-size:var(--f-caption1);color:rgba(255,255,255,0.9);line-height:1.35;">Bugün ne okudun? Birkaç sayfa, uykuya geçişi yumuşatır.</div></div>'
    +'<button data-fx="open" onclick="App.openReading()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#6E55BF;font-weight:800;font-size:var(--f-footnote);padding:9px 14px;border-radius:12px;">Ekle</button></div>';
}

function stepReminder(){ return SEYMA_REMINDERS.stepReminder.apply(null,arguments); }
function fmtDist(m){ m=Math.max(0,Number(m)||0); return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'; }
function fmtDur(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); if(sec<60) return sec+' sn'; var m=Math.round(sec/60); if(m<60) return m+' dk'; var hh=Math.floor(m/60), mm=m%60; return hh+' sa'+(mm?(' '+mm+' dk'):''); }
// Sağlık senkronu kurulum kartı — daraltılmış/genişletilmiş (accordion). Konum kartının
// hemen altında yaşar ki kullanıcı GPS'in arka planda çalışmadığını gördüğü anda
// gerçek çözümü de orada bulsun. Bağlandıysa kısa bir "bağlı" özetine döner.
function healthSetupCardHTML(connectedHealth){ return SEYMA_RENDER.healthSetupCardHTML.apply(null,arguments); }
// ---------- Günışığı hava durumu (Open-Meteo, anahtarsız) ----------
var wxFetching=false;
function maybeFetchWeather(){ if(!data||editing()) return; if(wxFetching) return; if(!wxStale()) return; fetchWeather(); }
function fetchWeather(){
  if(wxFetching || typeof fetch!=='function') return;
  var modeAtFetch=wxMode();
  var spots=weatherSpots(); if(!spots.length) return;
  wxFetching=true;
  var lats=spots.map(function(s){return s.lat;}).join(',');
  var lngs=spots.map(function(s){return s.lng;}).join(',');
  var url='https://api.open-meteo.com/v1/forecast?latitude='+lats+'&longitude='+lngs
    +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m'
    +'&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'
    +'&timezone=auto&forecast_days=1';
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(j){
    var arr=Array.isArray(j)?j:[j]; var out=[];
    for(var i=0;i<spots.length;i++){
      var w=arr[i]||arr[0]; if(!w||!w.current) continue; var dl=w.daily||{};
      out.push({
        key:spots[i].key, label:spots[i].label, place:spots[i].place, iconName:wxSpotIconName(spots[i]),
        temp:Math.round(w.current.temperature_2m), feels:Math.round(w.current.apparent_temperature),
        hum:w.current.relative_humidity_2m, wind:Math.round(w.current.wind_speed_10m),
        precip:w.current.precipitation, code:w.current.weather_code, isDay:w.current.is_day===1,
        hi:(dl.temperature_2m_max?Math.round(dl.temperature_2m_max[0]):null),
        lo:(dl.temperature_2m_min?Math.round(dl.temperature_2m_min[0]):null),
        uv:(dl.uv_index_max?Math.round(dl.uv_index_max[0]):null),
        pop:(dl.precipitation_probability_max?dl.precipitation_probability_max[0]:null),
        sunrise:(dl.sunrise?dl.sunrise[0]:null), sunset:(dl.sunset?dl.sunset[0]:null)
      });
    }
    if(!out.length){ wxFetching=false; return; }
    var live=modeAtFetch==='live';
    var prevCoords=(data.weather&&data.weather.coords)?data.weather.coords:null;
    var keepName=(data.weather&&data.weather.liveName)||'';
    var liveCoords=(live&&spots[0])?{lat:spots[0].lat,lng:spots[0].lng}:null;
    if(live && prevCoords && liveCoords && haversineM(prevCoords,liveCoords)>3000) keepName=''; // yeni bölge → adı yeniden çöz
    data.weather={mode:modeAtFetch, fetchedAt:new Date().toISOString(), spots:out, liveName:keepName, coords:liveCoords};
    wxFetching=false; saveLocal();
    if(live && !data.weather.liveName) reverseGeocodeLive(spots[0].lat, spots[0].lng);
    if(ui.tab==='bugun') render();
    if(wxStale()) maybeFetchWeather();
  }).catch(function(){ wxFetching=false; });
}
function reverseGeocodeLive(lat,lng){
  if(typeof fetch!=='function') return;
  fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lng+'&localityLanguage=tr')
    .then(function(r){ return r.ok?r.json():Promise.reject(0); }).then(function(j){
      var nm=j.locality||j.city||j.principalSubdivision||'';
      if(nm && data.weather){ data.weather.liveName=nm; if(data.weather.spots&&data.weather.spots[0]) data.weather.spots[0].place=nm; saveLocal(); if(ui.tab==='bugun') render(); }
    }).catch(function(){});
}
// ── Günün Fotoğrafı: Wikimedia Commons "Picture of the Day" ──
// Ücretsiz, CORS-destekli, keyless; her gün değişen, ödüllü doğa/hayvan/manzara
// fotoğrafları. National Geographic'in resmi API'si olmadığı için en yakın,
// yasal ve estetik eşdeğer kaynak olarak kullanılır.
var DAILY_PHOTO_FETCHING={};
var DAILY_PHOTO_NATURE_RE=new RegExp('animals|birds|mammals|insects|reptiles|amphibians|fish|marine life|wildlife|nature|landscapes|national parks|mountains|rivers|seas|lakes|forests|flowers|plants|trees|clouds|sky|water|beaches|sunrise|sunset','i');
function stripHtml(s){
  if(s==null) return '';
  return String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').replace(/&nbsp;/g,' ').trim();
}
function dailyPhotoCopy(p){
  p=p&&typeof p==='object'?p:{};
  return {date:String(p.date||''),potdDate:String(p.potdDate||''),url:String(p.url||''),title:String(p.title||''),artist:String(p.artist||''),license:String(p.license||''),description:String(p.description||''),source:String(p.source||'Wikimedia Commons Picture of the Day'),pageUrl:String(p.pageUrl||''),fetchedAt:String(p.fetchedAt||'')};
}
function dailyPhotoDateValid(date){ return /^\d{4}-\d{2}-\d{2}$/.test(String(date||'')); }
function dailyPhotoIsVerified(photo,date){ return !!(photo&&photo.url&&photo.potdDate===date); }
function dailyPhotoSelectedDate(){
  var today=todayStr(), selected=ui&&ui.dailyPhotoDate;
  return dailyPhotoDateValid(selected)&&selected<=today?selected:today;
}
function dailyPhotoForDate(date){
  var root=data&&data.dailyPhoto&&typeof data.dailyPhoto==='object'?data.dailyPhoto:{}, history=root.history&&typeof root.history==='object'&&!Array.isArray(root.history)?root.history:{};
  if(history[date]&&typeof history[date]==='object') return history[date];
  return root.date===date?root:null;
}
function storeDailyPhoto(photo){
  if(!data.dailyPhoto||typeof data.dailyPhoto!=='object') data.dailyPhoto={};
  var root=data.dailyPhoto, record=dailyPhotoCopy(photo);
  if(!root.history||typeof root.history!=='object'||Array.isArray(root.history)) root.history={};
  root.history[record.date]=record;
  // Panel ve mevcut sözleşme bugünün özetini kökte bekliyor; geçmişe gidince
  // bu özetin yerini değiştirme.
  if(record.date===todayStr()){
    root.date=record.date; root.potdDate=record.potdDate; root.url=record.url; root.title=record.title; root.artist=record.artist;
    root.license=record.license; root.description=record.description; root.source=record.source;
    root.pageUrl=record.pageUrl; root.fetchedAt=record.fetchedAt;
  }
  return record;
}
function pickNaturePhoto(pages){
  var keys=Object.keys(pages), best=null;
  for(var i=0;i<keys.length;i++){
    var p=pages[keys[i]]; var ii=p&&p.imageinfo&&p.imageinfo[0]; if(!ii||!ii.url) continue;
    var em=ii.extmetadata||{}, cats=String(em.Categories&&em.Categories.value||'');
    if(DAILY_PHOTO_NATURE_RE.test(cats)){ best=p; break; }
    if(!best) best=p;
  }
  return best||null;
}
function fetchDailyPhoto(date,force){
  if(typeof fetch!=='function' || !data) return;
  var target=dailyPhotoDateValid(date)?date:todayStr();
  // Aynı tarihin mevcut kaydını koru; yenileme düğmesi açıkça force geçirir.
  if(!force){ var cached=dailyPhotoForDate(target); if(dailyPhotoIsVerified(cached,target)) return; }
  if(DAILY_PHOTO_FETCHING[target]) return;
  DAILY_PHOTO_FETCHING[target]=true;
  // Template:Potd/YYYY-MM-DD, Commons'un tarihli arşiv sözleşmesidir:
  // gün değişince farklı, geçmişe gidince o günün gerçek POTD'si gelir.
  var url='https://commons.wikimedia.org/w/api.php?action=query&generator=images&prop=imageinfo&titles='+encodeURIComponent('Template:Potd/'+target)+'&iiprop=url|extmetadata&gimlimit=12&format=json&origin=*';
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(j){
    var pages=j&&j.query&&j.query.pages?j.query.pages:{};
    var p=pickNaturePhoto(pages);
    if(!p || !p.imageinfo || !p.imageinfo[0]){ delete DAILY_PHOTO_FETCHING[target]; return; }
    var ii=p.imageinfo[0], em=ii.extmetadata||{};
    var title=stripHtml(em.ObjectName&&em.ObjectName.value) || stripHtml(em.ImageDescription&&em.ImageDescription.value) || '';
    var desc=stripHtml(em.ImageDescription&&em.ImageDescription.value) || title;
    if(!title && p.title){ title=stripHtml(p.title.replace(/^File:/,'').replace(/_/g,' ').replace(/\.[^.]+$/,'')); }
    storeDailyPhoto({
      date:target,
      potdDate:target,
      url:ii.url||'',
      title:title,
      artist:stripHtml(em.Artist&&em.Artist.value),
      license:em.LicenseShortName&&em.LicenseShortName.value||'',
      description:desc,
      source:'Wikimedia Commons Picture of the Day',
      pageUrl:ii.descriptionurl||'',
      fetchedAt:new Date().toISOString()
    });
    delete DAILY_PHOTO_FETCHING[target];
    save();
    if(ui.tab==='bugun') render();
  }).catch(function(e){
    delete DAILY_PHOTO_FETCHING[target];
    // Hata durumunda eski fotoğrafı koru; kart "yine de göster" mantığıyla çalışmaya devam eder.
  });
}
function maybeFetchDailyPhoto(date){
  if(!data || !data.dailyPhoto) return;
  var target=dailyPhotoDateValid(date)?date:todayStr(), photo=dailyPhotoForDate(target);
  var verified=dailyPhotoIsVerified(photo,target), last=verified&&photo.fetchedAt?new Date(photo.fetchedAt).getTime():0;
  var stale=!verified, recent=verified&&Date.now()-last < 10*60*1000;
  if(!stale) return; // istenen günün fotoğrafı önbellekteyse tekrar çekme
  if(!recent && !DAILY_PHOTO_FETCHING[target]) fetchDailyPhoto(target);
}
// ── Tatil Modu kartı: Günışığı hava kartının hemen üstünde, açıkken tarih/preset/reason girişi.
function vacationCardHTML(rec){ return SEYMA_RENDER.vacationCardHTML.apply(null,arguments); }
CARD_BUILDERS['vacation']=vacationCardHTML;

function onThisDayCard(){
  var today=todayStr(); var mmdd=today.slice(5); var curY=parseInt(today.slice(0,4),10);
  var best=null;
  for(var k in data.days){ if(String(k).slice(5)!==mmdd) continue; var y=parseInt(String(k).slice(0,4),10); if(isNaN(y)||y>=curY) continue; var r=data.days[k]; if(!r||typeof r!=='object'||Array.isArray(r)) continue;
    if(!best||k>best.date){ best={date:k,year:y}; }
  }
  if(!best) return '';
  var yearsAgo=curY-best.year;
  var h='<section class="surface sey-reminder-on-this-day" data-reminder-on-this-day="safe" aria-labelledby="sey-on-this-day-title">';
  h+='<div class="sey-reminder-on-this-day-head"><span class="sey-reminder-on-this-day-icon" aria-hidden="true">'+icon('lamp',20)+'</span><div><span class="sey-reminder-eyebrow">BUGÜNÜN ESKİ BİR İZİ</span><h3 id="sey-on-this-day-title">Bugün, '+yearsAgo+' yıl önce</h3><small>'+esc(dateLabelTR(best.date))+'</small></div></div>';
  h+='<p>O güne ait yerel bir kayıt alanı var. Puan, seri veya ayrıntı burada gösterilmez; istersen yalnız sen dokununca o güne bakabilirsin.</p>';
  h+='<button type="button" class="sey-reminder-on-this-day-action" onclick="App.openDate(\''+best.date+'\')">O güne bak '+icon('arrow-up-right',14)+'</button>';
  h+='</section>';
  return h;
}
// MON-26: motivation görünüm/parser gövdeleri app/core/motivation.js (SeymaMotivation) registrysinde;
// app.js imza-koruyan shimler; canlı bag registerMotivation ile kurulur. Oda çağrıları registry çözümlü;
// App-owned mutation kabugu (completeMotivationTask, save/timer/fetch handlerlari) app.js tarafinda kalir.
function motivationIsCourageDomain(domain){ return window.SeymaMotivation.motivationIsCourageDomain.apply(null,arguments); }
function motivationPersonalLine(mot,sum,state){ return window.SeymaMotivation.motivationPersonalLine.apply(null,arguments); }
function motivationEvidenceLine(sum){ return window.SeymaMotivation.motivationEvidenceLine.apply(null,arguments); }
function motivationNextStepLabel(state){ return window.SeymaMotivation.motivationNextStepLabel.apply(null,arguments); }
function motivationBadgeHTML(size){ return window.SeymaMotivation.motivationBadgeHTML.apply(null,arguments); }
function motivationSignHTML(delay){ return window.SeymaMotivation.motivationSignHTML.apply(null,arguments); }
function motivationQuoteBlockHTML(quote){ return window.SeymaMotivation.motivationQuoteBlockHTML.apply(null,arguments); }
function motivationComingSoonCardHTML(){ return window.SeymaMotivation.motivationComingSoonCardHTML.apply(null,arguments); }
function motivationTodayCardHTML(){ return SEYMA_RENDER.motivationTodayCardHTML.apply(null,arguments); }
function roomStatsHTML(sum,fi){ return window.SeymaMotivation.roomStatsHTML.apply(null,arguments); }
function roomOverlayHTML(){ return SEYMA_RENDER.roomOverlayHTML.apply(null,arguments); }
function roomBodyHTML(M,mot,sum,st,doneToday,nar,fi){ return window.SeymaMotivation.roomBodyHTML.apply(null,arguments); }
function roomPathHTML(M,mot,sum,st,doneToday,nar,fi){ return window.SeymaMotivation.roomPathHTML.apply(null,arguments); }
function roomDailyWinHTML(fi, delay){ return window.SeymaMotivation.roomDailyWinHTML.apply(null,arguments); }
function roomFlexNudgeHTML(mot, fi, delay){ return window.SeymaMotivation.roomFlexNudgeHTML.apply(null,arguments); }
function roomToolCard(id, ic, title, subtitle, body, fi, delay){ return window.SeymaMotivation.roomToolCard.apply(null,arguments); }
// MON-26: App-owned mutation kabuğu — data yazımı (save/commit) ve App handler
// atamaları app.js'te kalır (M2/I2).
App.saveDailyWin=function(el){
  var day=getDay(data,activeDate());
  if(!day.therapy) day.therapy=emptyTherapy();
  day.therapy.dailyWin={text:String(el.value||'').slice(0,200),completedAt:new Date().toISOString()};
  save(); toast('Bugünün kazanımı kaydedildi',1500); haptic(8); App.updateRoom();
};
App.copyFlexNudge=function(){
  var nudge=window.SeymaMotivation.flexNudgeFor(activeDate());
  var day=getDay(data,activeDate());
  day.intention=nudge;
  save(); toast('Esneklik nudgesı bugünün niyeti oldu',1800); haptic(8); App.updateRoom();
};
function roomToolsHTML(fi){ return window.SeymaMotivation.roomToolsHTML.apply(null,arguments); }
function roomProfileHTML(fi){ return window.SeymaMotivation.roomProfileHTML.apply(null,arguments); }
function roomPrettyRiasec(r){ return window.SeymaMotivation.roomPrettyRiasec.apply(null,arguments); }
function roomPrettyValue(v){ return window.SeymaMotivation.roomPrettyValue.apply(null,arguments); }
function roomCalendarDayIndex(){ return window.SeymaMotivation.roomCalendarDayIndex.apply(null,arguments); }
function roomDailyContentHTML(p,fi){ return window.SeymaMotivation.roomDailyContentHTML.apply(null,arguments); }
function parseScientificProfileMD(md){ return window.SeymaMotivation.parseScientificProfileMD.apply(null,arguments); }
function fmtWhen(iso){
  if(!iso) return '';
  try{ var d=new Date(iso); return d.toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); }catch(e){ return iso.slice(0,16).replace('T',' '); }
}
function fmtDateNice(iso){
  if(!iso) return '';
  try{ var d=new Date(iso); return d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}); }catch(e){ return iso; }
}
App.fetchProfileForRoom=function(){
  var c=ghCfgApp();
  if(!c){ ui.roomProfileFetchState='error'; ui.roomProfileError='Önce Ayarlar\'dan repoya bağlan'; App.updateRoom(); return; }
  ui.roomProfileFetchState='loading'; ui.roomProfileError=null; App.updateRoom();
  var path='bilimsel-profil-degerlendirme-ozet-2026-07-13.md';
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encodeURIComponent(path)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.text(); })
    .then(function(md){
      data.scientificProfile=parseScientificProfileMD(md);
      ui.roomProfileFetchState='idle';
      save();
      toast('Profil raporu yüklendi',1800); haptic(10);
      App.updateRoom();
    })
    .catch(function(e){ ui.roomProfileFetchState='error'; ui.roomProfileError=e.message||'Bilinmeyen hata'; App.updateRoom(); });
};
App.saveFirstStep=function(el){
  var day=getDay(data,activeDate());
  day.therapy.firstStep.text=String(el.value||'').slice(0,200);
  save(); App.updateRoom(); haptic(6);
};
App.startFirstStepTimer=function(){
  if(ui.roomFirstTimer){ clearInterval(ui.roomFirstTimer); ui.roomFirstTimer=null; }
  var left=120;
  ui.roomFirstTimer=setInterval(function(){
    left--;
    var label=document.getElementById('sey-room-first-count');
    if(label) label.textContent=(Math.floor(left/60)).toString().padStart(2,'0')+':'+(left%60).toString().padStart(2,'0');
    if(left<=0){
      clearInterval(ui.roomFirstTimer); ui.roomFirstTimer=null;
      var day=getDay(data,activeDate());
      day.therapy.firstStep.completedAt=new Date().toISOString();
      save(); toast('İlk adım zamanı tamamlandı',1800); haptic(14); App.updateRoom();
    } else { if(label) label.textContent=(Math.floor(left/60)).toString().padStart(2,'0')+':'+(left%60).toString().padStart(2,'0'); }
  },1000);
  haptic(8); App.updateRoom();
};
App.saveSelfCompassion=function(el){
  var day=getDay(data,activeDate());
  day.therapy.selfCompassion={prompt:day.therapy.selfCompassion.prompt||'',note:String(el.value||'').slice(0,200),completedAt:new Date().toISOString()};
  save(); toast('Öz-şefkat anı kaydedildi',1500); haptic(10); App.updateRoom();
};
App.presetSelfCompassion=function(c){
  var el=document.getElementById('sey-room-sc'); if(el) el.value=c;
  App.saveSelfCompassion(el||{value:c});
};
App.setBreathPattern=function(pat){
  var day=getDay(data,activeDate());
  day.therapy.breath.pattern=pat;
  save(); haptic(6); App.updateRoom();
};
App.toggleBreath=function(){
  if(ui.roomBreathActive){ App.stopBreath(); return; }
  ui.roomBreathActive=true;
  var day=getDay(data,activeDate());
  var pattern=day.therapy.breath.pattern;
  var seq=pattern==='4-7-8'?[{l:'Nefes al',s:4},{l:'Tut',s:7},{l:'Nefes ver',s:8}]:[{l:'Nefes al',s:4},{l:'Tut',s:4},{l:'Nefes ver',s:4},{l:'Bekle',s:4}];
  var step=0, sub=0, cur=seq[0].s;
  function tick(){
    if(!ui.roomBreathActive) return;
    var ring=document.getElementById('sey-room-breath-ring');
    var lbl=document.getElementById('sey-room-breath-label');
    var cnt=document.getElementById('sey-room-breath-count');
    if(lbl) lbl.textContent=seq[step].l;
    if(cnt) cnt.textContent=String(cur-sub);
    if(ring) ring.style.transform='scale('+(seq[step].l.indexOf('al')>=0?1.15:(seq[step].l.indexOf('ver')>=0?0.85:1))+')';
    sub++;
    if(sub>=cur){ sub=0; step=(step+1)%seq.length; cur=seq[step].s; }
  }
  tick(); App.updateRoom();
  ui.roomBreathTimer=setInterval(tick,1000);
  var total=0, maxSec=180;
  var totalTimer=setInterval(function(){
    total++;
    day.therapy.breath.seconds=total;
    if(total>=maxSec){ clearInterval(totalTimer); App.stopBreath(); day.therapy.breath.completedAt=new Date().toISOString(); save(); toast('Nefes pratiği tamamlandı',1800); haptic(10); }
  },1000);
};
App.stopBreath=function(){
  ui.roomBreathActive=false;
  if(ui.roomBreathTimer){ clearInterval(ui.roomBreathTimer); ui.roomBreathTimer=null; }
  save(); App.updateRoom();
};
App.saveDecision=function(){
  var day=getDay(data,activeDate());
  var a=document.getElementById('sey-room-dec-a'), b=document.getElementById('sey-room-dec-b');
  day.therapy.decision.optionA=a?String(a.value||'').slice(0,120):'';
  day.therapy.decision.optionB=b?String(b.value||'').slice(0,120):'';
  save(); haptic(6);
};
App.startDecisionTimer=function(){
  if(ui.roomDecisionTimer){ clearInterval(ui.roomDecisionTimer); ui.roomDecisionTimer=null; }
  App.saveDecision();
  var left=120;
  ui.roomDecisionTimer=setInterval(function(){
    left--;
    var label=document.getElementById('sey-room-dec-count');
    if(label) label.textContent=(Math.floor(left/60)).toString().padStart(2,'0')+':'+(left%60).toString().padStart(2,'0');
    if(left<=0){
      clearInterval(ui.roomDecisionTimer); ui.roomDecisionTimer=null;
      toast('Düşünme süresi doldu — "iyi yeterli" deyip ilerleyebilirsin',2200); haptic(12); App.updateRoom();
    }
  },1000);
  haptic(8); App.updateRoom();
};
App.chooseDecision=function(ch){
  App.saveDecision();
  var day=getDay(data,activeDate());
  day.therapy.decision.choice=ch;
  day.therapy.decision.completedAt=new Date().toISOString();
  if(ui.roomDecisionTimer){ clearInterval(ui.roomDecisionTimer); ui.roomDecisionTimer=null; }
  save(); toast('Seçim kaydedildi: '+ch,1800); haptic(10); render();
};
App.saveThought=function(){
  var sit=document.getElementById('sey-room-thought-sit'), th=document.getElementById('sey-room-thought-th'), fo=document.getElementById('sey-room-thought-for'), ag=document.getElementById('sey-room-thought-against'), alt=document.getElementById('sey-room-thought-alt');
  var o={situation:String(sit?sit.value:'').slice(0,160),thought:String(th?th.value:'').slice(0,160),evidenceFor:String(fo?fo.value:'').slice(0,160),evidenceAgainst:String(ag?ag.value:'').slice(0,160),altThought:String(alt?alt.value:'').slice(0,160),createdAt:new Date().toISOString()};
  if(!o.situation||!o.thought){ toast('Durum ve düşünce yazmalısın',1800); return; }
  var day=getDay(data,activeDate());
  day.therapy.thoughts.push(o);
  save(); toast('Düşünce kaydı eklendi',1500); haptic(10); ui.roomTool=null; App.updateRoom();
};
App.saveShareNote=function(el){
  var day=getDay(data,activeDate());
  day.therapy.share.note=String(el.value||'').slice(0,200);
  save(); haptic(6);
};
App.sendAeonShare=function(){
  var day=getDay(data,activeDate());
  var note=String(day.therapy.share.note||'').trim();
  var msg='Şu an zor hissediyorum'+(note?' · '+note:'');
  day.therapy.share.sentAt=new Date().toISOString();
  submitAeonQuestion(msg);
  toast('ÆON\'a sinyal iletildi',1800); haptic(12);
  App.updateRoom();
};
App.setMotivationReflection=function(el){
  ui.motivationReflectionDraft=String(el.value||'').slice(0,280);
  var has=!!ui.motivationReflectionDraft.trim();
  var btn=document.getElementById('sey-mot-complete-btn-main');
  if(btn){ btn.disabled=!has; btn.style.opacity=has?'1':'0.45'; btn.style.cursor=has?'pointer':'not-allowed'; }
};
App.toggleMotivationExamples=function(){
  ui.motivationExamplesOpen=!ui.motivationExamplesOpen;
  render();
};
App.copyMotivationExample=function(idx){
  var M=window.MotivationProgramV2;
  if(!M||!data) return;
  var mot=M.activeDay(data);
  if(!mot||!mot.reflectionExamples||!mot.reflectionExamples[idx]) return;
  var text=mot.reflectionExamples[idx];
  ui.motivationReflectionDraft=text.slice(0,280);
  var input=document.getElementById('sey-mot-reflection-main');
  if(input){ input.value=ui.motivationReflectionDraft; input.focus(); }
  var btn=document.getElementById('sey-mot-complete-btn-main');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
  toast('Örnek yansıma girişe kopyalandı — dilediğin gibi düzenle.');
};
// Bir cümle bırakmak zorunlu: hem standart hem minimum tamamlamada, kullanıcı
// yazmadan devam edemez -- buton devre dışı bırakılır, burada da savunma amaçlı tekrar kontrol edilir.
App.completeMotivationTask=function(status){
  var M=window.MotivationProgramV2;
  if(!M||!data||!featuresLive()) return;
  var reflection=String(ui.motivationReflectionDraft||'').trim();
  if(!reflection){ if(window.SeyAudio&&typeof window.SeyAudio.warning==='function') window.SeyAudio.warning(); toast('Devam etmeden önce bir cümle yaz — kısa da olsa yeter.'); return; }
  status=(status==='minimum_completed')?'minimum_completed':'completed';
  var mot=M.activeDay(data);
  var prev=M.dayState(data,activeDate());
  var wasDone=!!(prev&&(prev.status==='completed'||prev.status==='minimum_completed'));
  var courageBefore=M.progressSummary(data).courageEvidence;
  M.record(data,activeDate(),status,reflection);
  // Oda açıkken kaydı sonrası düzenlenebilir kalsın diye yansımayı input'ta tut.
  ui.motivationReflectionDraft=ui.roomOpen?reflection:'';
  var courageGained=M.progressSummary(data).courageEvidence>courageBefore;
  save();
  haptic([10,30,10]);
  render();
  var msg;
  if(wasDone) msg='Kaydın güncellendi';
  else { if(window.SeyAudio&&typeof window.SeyAudio.bell==='function') window.SeyAudio.bell(); if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ try{ var mb=document.getElementById('sey-motivation-bar'); if(mb) window.SeyFx.shimmer(mb); }catch(e){} } if(window.SeyHaptics&&typeof window.SeyHaptics.streak==='function') window.SeyHaptics.streak(); msg=status==='minimum_completed'?'Minimum görev kaydedildi — bu da ilerleme':((mot&&mot.successMeaning)||'Bugünkü görev kaydedildi'); }
  if(courageGained) msg+=' · bir cesaret kanıtı daha';
  toast(msg);
};
// Görevi küçült akışı: yalnızca `ui`de geçici açık/kapalı durumu tutulur,
// kullanıcı "Minimum görevi tamamladım"a basmadan `data`ya hiçbir şey yazılmaz.
App.openMotivationMinimum=function(){
  if(!window.MotivationProgramV2||!data) return;
  ui.motivationMinimumOpen=true;
  haptic(10);
  updateMotivationCard();
};
App.closeMotivationMinimum=function(){
  ui.motivationMinimumOpen=false;
  updateMotivationCard();
};
App.confirmMotivationMinimum=function(){
  ui.motivationMinimumOpen=false;
  App.completeMotivationTask('minimum_completed');
};
// Kompakt hub kutucukları: okudum/izledim/dinledim — 3 tam-genişlik gradyan bar yerine
// yan yana 3 hafif kutucuk (görsel gürültüyü azaltır, günlük log ailesiyle gruplanır).
function hubTilesHTML(){ return SEYMA_RENDER.hubTilesHTML.apply(null,arguments); }
// Raşit'in sözü — hemen Günışığı kartının altında; dokununca söz değişir (App.cycleRasit).
function rasitNoteIdx(curIdx){ var n=NOTES.length; return (((curIdx-1)+(ui.noteIndex||0))%n+n)%n; }
function rasitBubbleHTML(curIdx){ return SEYMA_RENDER.rasitBubbleHTML.apply(null,arguments); }
// ── Hero dashboard: kullanıcının bugünkü girdilerinin sakin, premium özeti ──
// Dört kompakt kutucuk (Mod · Su · Uyku · Adım). Veri girildikçe canlanır,
// eşik tutunca ilgili kutucuk yeşile döner — habits tikleriyle aynı dille.
function heroStatTile(){ return window.SeymaAppSurface.heroStatTile.apply(null,arguments); }
function heroStatsHTML(rec){ return SEYMA_RENDER.heroStatsHTML.apply(null,arguments); }
// Bugün hero kartında en kritik hedeflerin premium özet görünümü.
// Su/Adım zaten üst durum satırında (heroStatsHTML) olduğu için burada
// sadece beslenme hedeflerinin en anlamlı üçlüsü gösterilir: Kalori · Protein · Karbonhidrat.
function heroTargetsHTML(rec){ return SEYMA_RENDER.heroTargetsHTML.apply(null,arguments); }
// Kısa tik etiketleri (hero "en güçlü/zayıf" istatistiği için).
var SHORT_HABIT={sweetManaged:'Tatlı',foodManaged:'Yemek',coffeeManaged:'Kahve',eveningControl:'Akşam',walked20:'Yürüyüş',protein:'Protein',water:'Su',vitaminD:'D₃K₂ damla',sleepReg:'Uyku',journaled:'Not',mediaFed:'Zihin',freshAir:'Açık hava',selfKind:'Öz-şefkat'};
// ── Premium istatistik şeridi: tek çerçevede seri · 7 günlük ritim · mod eğilimi
// + son 14 günün en güçlü/destek isteyen tiki. Fazla kutu yerine tek panel + iç ayraçlar.
function heroPremiumStatsHTML(viewDate){ return SEYMA_RENDER.heroPremiumStatsHTML.apply(null,arguments); }
// Günün havası: tamamlanma seviyesine göre motive edici metin havuzu.
// Güne (curIdx) göre deterministik seçim — gün içinde titremez, günler arası çeşitlenir.
function gununHavasi(completed, ht, seed){
  var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34);
  var lvl = completed>=ht?3 : completed>=strong?2 : completed>=medium?1 : 0;
  var POOL=[
    ['Bugün nazlı başladı','Yavaş da olsa buradasın','İlk adım en değerlisi','Nazikçe başlıyoruz','Her büyük gün küçük başlar'],
    ['Toparlanıyorsun, güzel','Adım adım yükseliyor','İyi bir başlangıç, sürdür','Filizleniyorsun','Küçük zaferler birikiyor'],
    ['Raydasın, harika gidiyor','İvme sende, momentum tam','Güçlü bir ritim yakaladın','Neredeyse zirvede','Denge sana yakışıyor'],
    ['Kraliçe günü','Bugünü fethettin','Tam isabet, ışıl ışıl','Zirvedesin, tadını çıkar','Kusursuz bir denge kurdun']
  ];
  var arr=POOL[lvl];
  var idx=((seed||0)%arr.length+arr.length)%arr.length;
  return arr[idx];
}
// Veriye bağlı, tek cümlelik bilimsel mikro-bilgi (hafif, kutusuz — üstten ayraçla).
function heroScienceLine(){ return window.SeymaAppSurface.heroScienceLine.apply(null,arguments); }
// Sayfalar arası tutarlı bilimsel mikro-bilgi rozeti (Rapor/Sağlık/Takvim vb.).
function sciNote(txt){ return '<div style="display:flex;align-items:flex-start;gap:8px;background:rgba(201,184,255,0.10);border:1px solid rgba(201,184,255,0.22);border-radius:12px;padding:9px 11px;"><span style="flex-shrink:0;color:var(--accent-ink);display:inline-flex;margin-top:1px;">'+icon('brain',13)+'</span><span style="font-size:var(--f-caption2);line-height:1.5;color:var(--muted);">'+txt+'</span></div>'; }
// Ortak sayfa başlığı (bugün sayfası dışındaki sekmelerle görsel uyum için).
function pageHeader(title,ic,sub){ return '<div style="padding:4px 4px 0;"><div style="font-size:var(--f-title2);font-weight:800;display:flex;align-items:center;gap:8px;">'+esc(title)+' '+icon(ic,20)+'</div>'+(sub?'<div style="font-size:var(--f-footnote);color:var(--faint);margin-top:4px;line-height:1.4;">'+esc(sub)+'</div>':'')+'</div>'; }
// MON-27: Raşit'in Kriz Odaları görünümü app/core/crisis.js registry'sindedir;
// app.js yalnızca imza-koruyan shim'i ve state-owned crisis handlerlarını taşır.
function crisisFor(kind){ return window.SeymaCrisis.crisisFor.apply(null,arguments); }
function crisisOrder(){ return window.SeymaCrisis.crisisOrder.apply(null,arguments); }
function rasitActionsHTML(){ return window.SeymaCrisis.rasitActionsHTML.apply(null,arguments); }
// ── Raşit'e ulaş: yaz / ara — "Raşit'ten Notlar" kartının hemen altında, premium ikili. ──
function rasitContactHTML(){ return SEYMA_RENDER.rasitContactHTML.apply(null,arguments); }
// ── Günün Fotoğrafı kartı: Wikimedia Commons POTD, National Geographic estetiğinde ──
function dailyPhotoCardHTML(){
  var photoDate=dailyPhotoSelectedDate(), isTodayPhoto=photoDate===todayStr(), p=dailyPhotoForDate(photoDate)||{};
  var hasUrl=!!p.url;
  var accent=dark?'#F4C980':'#8A5A2B';
  var cardBg=dark?'linear-gradient(145deg,#141012,#0B0B0D)':'linear-gradient(145deg,#FFF8F0,#FDF6ED)';
  var border=dark?'1px solid rgba(244,201,128,0.20)':'1px solid rgba(138,90,43,0.16)';
  var muted=dark?'#C8B9A6':'#8A6A52';
  var h='<section class="surface sey-daily-photo" aria-label="Günün Fotoğrafı" style="position:relative;overflow:hidden;border-radius:24px;background:'+cardBg+';border:'+border+';box-shadow:'+(dark?'0 16px 38px rgba(0,0,0,0.42)':'0 14px 32px rgba(138,90,43,0.16)')+';display:flex;flex-direction:column;">';
  // Başlık şeridi
  h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;">';
  h+='<div style="display:flex;align-items:center;gap:9px;">';
  h+='<span style="width:32px;height:32px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' '+(dark?'16':'18')+'%, transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,'+(dark?'0.08':'0.45')+');">'+icon('camera',17)+'</span>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:900;letter-spacing:1.2px;color:'+accent+';">GÜNÜN FOTOĞRAFI</div><div style="font-size:var(--f-caption2);color:'+muted+';font-weight:700;">Wikimedia Commons · Picture of the Day</div></div>';
  h+='</div>';
  h+='<div style="display:flex;align-items:center;gap:4px;">';
  h+='<button type="button" onclick="App.refreshDailyPhoto()" aria-label="Yenile" title="Yenile" style="flex-shrink:0;border:none;background:transparent;cursor:pointer;width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';transition:transform .2s;">'+icon('rotate-ccw',16)+'</button>';
  h+='</div>';
  h+='</div>';
  // Tarihçe yalnız görünüm durumudur; kaydedilen fotoğraflar tarih anahtarıyla
  // data.dailyPhoto.history altında kalır. Geleceğe geçiş kapalıdır.
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 16px 11px;">';
  h+='<button type="button" onclick="App.dailyPhotoMove(-1)" aria-label="Önceki günün fotoğrafı" title="Önceki gün" style="width:44px;height:44px;border-radius:50%;border:1px solid '+border+';background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';">'+icon('chevron-left',16)+'</button>';
  h+='<div aria-live="polite" style="flex:1;text-align:center;font-size:var(--f-caption1);font-weight:800;color:'+muted+';">'+esc(dateLabelTR(photoDate))+(isTodayPhoto?' · Bugün':'')+'</div>';
  h+='<button type="button" onclick="App.dailyPhotoMove(1)" aria-label="Sonraki günün fotoğrafı" title="Sonraki gün"'+(isTodayPhoto?' disabled':'')+' style="width:44px;height:44px;border-radius:50%;border:1px solid '+border+';background:transparent;cursor:'+(isTodayPhoto?'default':'pointer')+';opacity:'+(isTodayPhoto?'.38':'1')+';display:inline-flex;align-items:center;justify-content:center;color:'+accent+';">'+icon('chevron-right',16)+'</button>';
  h+='</div>';
  h+='<div class="sey-collbody" style="position:relative;margin:0 12px 12px;border-radius:18px;overflow:hidden;background:'+(dark?'#0F0D0E':'#EDE5DB')+';aspect-ratio:4/3;">';
    if(hasUrl){
     h+='<img src="'+esc(p.url)+'" alt="'+esc(p.title||'Günün fotoğrafı')+'" loading="eager" onload="this.style.opacity=1" style="display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease;">';
     h+='<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.28) 40%,transparent 70%);pointer-events:none;"></div>';
     h+='<div style="position:absolute;left:0;right:0;bottom:0;padding:14px 14px 12px;color:#fff;">';
     if(p.title) h+='<div style="font-size:var(--f-subhead);font-weight:800;line-height:1.25;text-shadow:0 1px 3px rgba(0,0,0,0.45);">'+esc(p.title)+'</div>';
     var meta=[];
     if(p.artist) meta.push('© '+esc(p.artist));
     if(p.license) meta.push(esc(p.license));
     if(meta.length) h+='<div style="margin-top:5px;font-size:var(--f-caption2);font-weight:700;opacity:.82;text-shadow:0 1px 2px rgba(0,0,0,0.35);">'+meta.join(' · ')+'</div>';
     h+='</div>';
     if(p.pageUrl){
       h+='<a href="'+esc(p.pageUrl)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="position:absolute;top:10px;right:10px;display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,0.45);color:#fff;font-size:var(--f-caption2);font-weight:800;text-decoration:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);">'+icon('external-link',11)+' Kaynak</a>';
     }
    }else{
     h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:'+muted+';">';
     h+='<span style="opacity:.7;">'+icon('image',40)+'</span>';
     h+='<div style="font-size:var(--f-footnote);font-weight:700;">'+(isTodayPhoto?'Bugünün':'Bu günün')+' fotoğrafı yükleniyor…</div>';
     h+='</div>';
    }
  h+='</div>';
  h+='</section>';
  return h;
}
// MON-44: Bugün gövdesi registry'dedir; türetilmiş tik mutasyonu app.js sahipliğindedir.
function bugunHTML(){
  var rec=data.days[activeDate()]||null;
  if(rec) syncDerivedHabits(rec);
  return SEYMA_RENDER.bugunHTML.apply(null,arguments);
}


// ── Günlük Işığı (premium serbest günlük) ──
// MON-28: journal görünümleri app/core/journal.js registry'sindedir;
// app.js state/DOM/save/focus kabuğunu ve imza-koruyan shimleri taşır.
function journalModes(){ return window.SeymaJournal.journalModes.apply(null,arguments); }
function journalActivePhase(){ return window.SeymaJournal.journalActivePhase.apply(null,arguments); }
function journalPhasePrompt(){ return window.SeymaJournal.journalPhasePrompt.apply(null,arguments); }
function journalScienceHint(){ return window.SeymaJournal.journalScienceHint.apply(null,arguments); }
function phaseDisplay(){ return window.SeymaJournal.phaseDisplay.apply(null,arguments); }
function phaseShortTitle(){ return window.SeymaJournal.phaseShortTitle.apply(null,arguments); }
function journalStreak(){ return window.SeymaJournal.journalStreak.apply(null,arguments); }
function fmtDateShort(){ return window.SeymaJournal.fmtDateShort.apply(null,arguments); }
function journalLightCardHTML(){ return window.SeymaJournal.journalLightCardHTML.apply(null,arguments); }
function journalModalHTML(){ return window.SeymaJournal.journalModalHTML.apply(null,arguments); }
function updateJournalUI(){
  if(!ui.journalOpen) return;
  updateJournalModeChips();
  updateJournalPromptLine();
  updateJournalScience();
  updateJournalCounts();
}
function updateJournalModeChips(){
  var mode=ui.journalMode||'free';
  journalModes().forEach(function(m){
    var el=document.getElementById('sey-journal-mode-'+m.id);
    if(!el) return;
    if(m.id===mode){
      el.style.background='linear-gradient(135deg,var(--journal),var(--journal2))';
      el.style.color='#fff';
      el.style.borderColor='transparent';
      el.style.boxShadow='0 6px 16px color-mix(in srgb,var(--journal-glow) 60%,transparent)';
    } else {
      el.style.background='var(--icon)';
      el.style.color='var(--text2)';
      el.style.borderColor='var(--card-bd)';
      el.style.boxShadow='none';
    }
  });
}
function updateJournalPromptLine(){
  var el=document.getElementById('sey-journal-prompt');
  if(el) el.textContent=String(ui.journalPromptUsed||'');
}
function updateJournalScience(){
  var el=document.getElementById('sey-journal-science');
  if(!el) return;
  var mode=ui.journalMode||'free';
  el.innerHTML='<span style="flex-shrink:0;color:var(--journal);display:inline-flex;margin-top:1px;">'+icon('brain',18)+'</span><div style="font-size:var(--f-footnote);line-height:1.6;color:var(--text2);"><b style="color:var(--text);">Bilimsel ipucu:</b> '+journalScienceHint(mode)+'</div>';
}
function updateJournalCounts(){
  var text=String(ui.journalText||'').trim();
  var words=text?text.split(/\s+/).filter(function(w){return w.length>0;}).length:0;
  var chars=text.length;
  var goal=data.settings.journalGoal||{words:30,chars:140};
  var met=(words>=goal.words||chars>=goal.chars);
  var pct=Math.min(100,Math.round((words/goal.words)*100));
  var cEl=document.getElementById('sey-journal-counts');
  if(cEl) cEl.textContent=words+' kelime · '+chars+' karakter';
  var gEl=document.getElementById('sey-journal-goal');
  if(gEl) gEl.textContent=met?'Hedef tamamlandı ✨':('Hedef: '+goal.words+' kelime veya '+goal.chars+' karakter');
  var bEl=document.getElementById('sey-journal-bar');
  if(bEl) bEl.style.width=pct+'%';
  var stEl=document.getElementById('sey-journal-streak');
  if(stEl) stEl.innerHTML=icon('flame',13)+journalStreak()+' günlük seri';
}

// MON-27: Kriz odası modalı görünümü app/core/crisis.js registry'sindedir.
function crisisModalHTML(){ return window.SeymaCrisis.crisisModalHTML.apply(null,arguments); }

function magnesiumFeedbackHTML(){ return SEYMA_HEALTH.magnesiumFeedbackHTML.apply(null,arguments); }
function magnesiumBannerHTML(){ return SEYMA_HEALTH.magnesiumBannerHTML.apply(null,arguments); }

function lastNDays(n){ return SEYMA_REPORT.lastNDays.apply(null,arguments); }
function habitRate(days,key){ return SEYMA_REPORT.habitRate.apply(null,arguments); }
function moodDist(days){ return SEYMA_REPORT.moodDist.apply(null,arguments); }
function monthlySummary(){ return SEYMA_REPORT.monthlySummary.apply(null,arguments); }
function trendBars(days,valFn,grad){ return SEYMA_REPORT.trendBars.apply(null,arguments); }
function nextMilestone(streak){ return SEYMA_REPORT.nextMilestone.apply(null,arguments); }
function moodScoreOf(rec){ return SEYMA_REPORT.moodScoreOf.apply(null,arguments); }
function avgOf(a){ return SEYMA_REPORT.avgOf.apply(null,arguments); }
function weekSelfCard(){ return SEYMA_REPORT.weekSelfCard.apply(null,arguments); }
function corrInsights(){ return SEYMA_REPORT.corrInsights.apply(null,arguments); }
function consistencyMomentumCard(){ return SEYMA_REPORT.consistencyMomentumCard.apply(null,arguments); }
function badgesGrid(){ return SEYMA_REPORT.badgesGrid.apply(null,arguments); }
function weeklyStepRecap(){ return SEYMA_REPORT.weeklyStepRecap.apply(null,arguments); }
function distanceRecapCard(){ return SEYMA_REPORT.distanceRecapCard.apply(null,arguments); }
function moodHeatmapCard(){ return SEYMA_REPORT.moodHeatmapCard.apply(null,arguments); }
function raporHTML(){ return SEYMA_RENDER.raporHTML.apply(null,arguments); }
// MON-37: settings read/render registry. Settings state/default/mutation handlers remain app-owned.
function ayarlarHTML(){ return SEYMA_RENDER.ayarlarHTML.apply(null,arguments); }
function settingsBtn(onclick,label,icon){ return window.SeymaSettings.settingsBtn.apply(null,arguments); }

// ================= SAĞLIK & DÖNGÜ =================
function num(v){ return (v===null||v===undefined||v==='')?null:Number(v); }
function calcAge(){ return SEYMA_HEALTH.calcAge.apply(null,arguments); }
function ringSeg(){ return SEYMA_HEALTH.ringSeg.apply(null,arguments); }

function activityRings(){ return SEYMA_HEALTH.activityRings.apply(null,arguments); }

function sparkCard(){ return SEYMA_HEALTH.sparkCard.apply(null,arguments); }

function sleepReadiness(){ return SEYMA_HEALTH.sleepReadiness.apply(null,arguments); }

function medFreeBadge(){ return SEYMA_HEALTH.medFreeBadge.apply(null,arguments); }
// Premium dairesel gauge (SVG halka + ortada değer). BMI/kafein/uyku-skoru için ortak.
function gaugeBadge(){ return SEYMA_HEALTH.gaugeBadge.apply(null,arguments); }
// Kafein metabolizma eğrisi: içimlerden yatma saatine dek vücuttaki kafein (yarı ömür decay),
// 50 mg güvenli-uyku eşiği (kesikli yeşil) ve yatma çizgisiyle.
function caffeineCurveSVG(){ return SEYMA_HEALTH.caffeineCurveSVG.apply(null,arguments); }
function caffeineBlock(){ return SEYMA_HEALTH.caffeineBlock.apply(null,arguments); }
CARD_BUILDERS['h-caffeine']=caffeineBlock;
// Uykuya dalma hazırlığı — bağımsız premium kart (skor gauge + 6 faktör + bilimsel ipucu).
function sleepPrepCard(){ return SEYMA_HEALTH.sleepPrepCard.apply(null,arguments); }
CARD_BUILDERS['h-sleepprep']=sleepPrepCard;

// ---- Vücut ölçüleri (kilo geçmişi + haftalık tartım önerisi + tek-seferlik boy + BMI) ----
function bodyData(){ if(!data.body||typeof data.body!=='object') data.body={heightCm:null,heightSetAt:null,weights:[]}; if(!Array.isArray(data.body.weights)) data.body.weights=[]; return data.body; }
function lastWeight(){ return SEYMA_HEALTH.lastWeight.apply(null,arguments); }
function weightRefMs(){ return SEYMA_HEALTH.weightRefMs.apply(null,arguments); }
function weightWeekReady(){ return SEYMA_HEALTH.weightWeekReady.apply(null,arguments); }
function nextWeightInDays(){ return SEYMA_HEALTH.nextWeightInDays.apply(null,arguments); }
function bmiFor(){ return SEYMA_HEALTH.bmiFor.apply(null,arguments); }
function bmiCat(){ return SEYMA_HEALTH.bmiCat.apply(null,arguments); }
function bodyCard(){ return SEYMA_HEALTH.bodyCard.apply(null,arguments); }
CARD_BUILDERS['h-body']=bodyCard;
// ---- Kan/idrar tahlili — PDF + çoklu foto yükleme (data/aeon-media/<id>.json), panele iletilir ----
function labCard(){ return SEYMA_HEALTH.labCard.apply(null,arguments); }
CARD_BUILDERS['h-lab']=labCard;
App.editHeight=function(){ ui.heightEdit=true; render(); };
App.setHeight=function(){ var el=document.getElementById('sey-height-input'); if(!el) return; var v=parseFloat(String(el.value).replace(',','.')); if(!v||isNaN(v)||v<80||v>250){ toast('Geçerli bir boy gir (80–250 cm)'); return; } var b=bodyData(); b.heightCm=Math.round(v); b.heightSetAt=new Date().toISOString(); ui.heightEdit=false; refreshTargets(); haptic(16); commit('Boy kaydedildi 📏'); };
App.addWeight=function(){ var el=document.getElementById('sey-weight-input'); if(!el) return; var v=parseFloat(String(el.value).replace(',','.')); if(!v||isNaN(v)||v<20||v>400){ toast('Geçerli bir kilo gir (20–400 kg)'); return; } var b=bodyData(); b.weights.push({ts:new Date().toISOString(),kg:Math.round(v*10)/10}); refreshTargets(); haptic([14,40,14]); commit('Kilo kaydedildi 🪶 · haftalık düzen yeterli'); };
App.pickLab=function(kind){ if(ui.labUploading) return; if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; } var el=document.getElementById(kind==='urine'?'sey-lab-urine':'sey-lab-blood'); if(el) el.click(); };
function compressImageFile(file){ return new Promise(function(resolve,reject){ var reader=new FileReader(); reader.onload=function(){ var img=new Image(); img.onload=function(){ var MAXD=1600, w=img.naturalWidth||1, hh=img.naturalHeight||1; var scale=Math.min(1,MAXD/Math.max(w,hh)); var cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(hh*scale)); var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; cv.getContext('2d').drawImage(img,0,0,cw,ch); var url=cv.toDataURL('image/jpeg',0.75); var c=url.indexOf(','); resolve({b64:c>=0?url.slice(c+1):'',mime:'image/jpeg',w:cw,h:ch}); }; img.onerror=function(){ reject(new Error('görsel okunamadı')); }; img.src=String(reader.result||''); }; reader.onerror=function(){ reject(new Error('dosya okunamadı')); }; reader.readAsDataURL(file); }); }
function readFileB64(file){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onload=function(){ var url=String(r.result||''); var c=url.indexOf(','); resolve(c>=0?url.slice(c+1):''); }; r.onerror=function(){ reject(new Error('dosya okunamadı')); }; r.readAsDataURL(file); }); }
App.labFilesChosen=function(kind,el){
  var files=el&&el.files?Array.prototype.slice.call(el.files):[]; if(el) el.value='';
  if(!files.length) return;
  if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; }
  var big=files.filter(function(f){ return f.size>4*1024*1024 && f.type==='application/pdf'; });
  if(big.length){ toast('Bazı PDF\'ler büyük (>4MB) — panelde açılmayabilir',3200); }
  ui.labUploading=true; render();
  var out=[], chain=Promise.resolve();
  files.forEach(function(f){
    chain=chain.then(function(){
      var prep=/^image\//.test(f.type) ? compressImageFile(f) : readFileB64(f).then(function(b64){ return {b64:b64,mime:f.type||'application/pdf'}; });
      return prep.then(function(p){
        if(!p||!p.b64) return;
        var id=aeonMediaId('lab');
        var payload={mime:p.mime,data:p.b64,name:f.name||''}; if(p.w) payload.w=p.w; if(p.h) payload.h=p.h;
        return putAeonMedia(id,payload).then(function(){ out.push({mediaId:id,mime:p.mime,name:f.name||'',w:p.w||null,h:p.h||null}); });
      });
    });
  });
  chain.then(function(){
    if(!out.length){ ui.labUploading=false; render(); toast('Dosya işlenemedi'); return; }
    if(!Array.isArray(data.labResults)) data.labResults=[];
    var lr={id:aeonMediaId('labr'),kind:(kind==='urine'?'urine':'blood'),ts:new Date().toISOString(),note:'',status:'analyzing',files:out};
    data.labResults.push(lr);
    ui.labUploading=false; haptic([14,40,14]); save();
    try{ if(window.SeySync&&window.SeySync.pushNow) window.SeySync.pushNow(); }catch(e){}
    try{ if(window.SeySync&&window.SeySync.pushPing) window.SeySync.pushPing({id:lr.id,question:(lr.kind==='blood'?'Kan':'İdrar')+' tahlili paylaşıldı ('+out.length+' dosya)',ts:lr.ts}); }catch(e){}
    render();
    toast('Tahlil kaydedildi ✓ · ÆON\'da analiz ediliyor 🔬',2600);
  }).catch(function(e){ ui.labUploading=false; render(); toast('Gönderilemedi: '+String((e&&e.message)||e),3000); });
};
function discomfortCard(){ return SEYMA_HEALTH.discomfortCard.apply(null,arguments); }
CARD_BUILDERS['h-discomfort']=discomfortCard;

// ── Ruhsal Denge: fiziksel takibin yanında zihinsel sağlık (mod·enerji·stres) ──
// Yeni veri modeli EKLEMEZ; mevcut mood/energy/stress alanlarından türetir.
function moodScore(){ return SEYMA_HEALTH.moodScore.apply(null,arguments); }
function moodColorScore(){ return SEYMA_HEALTH.moodColorScore.apply(null,arguments); }
function mentalStats(){ return SEYMA_HEALTH.mentalStats.apply(null,arguments); }
function mentalBalanceCard(){ return SEYMA_HEALTH.mentalBalanceCard.apply(null,arguments); }
CARD_BUILDERS.mental=mentalBalanceCard;
// ── Sağlık bölümleri: premium iOS-27 açılır kartlar (in-place animasyonlu) ──
function healthSleepCard(){ return SEYMA_HEALTH.healthSleepCard.apply(null,arguments); }
CARD_BUILDERS['h-sleep']=healthSleepCard;
function healthWalkCard(){ return SEYMA_HEALTH.healthWalkCard.apply(null,arguments); }
CARD_BUILDERS['h-walk']=healthWalkCard;
function healthAppleCard(){ return SEYMA_HEALTH.healthAppleCard.apply(null,arguments); }
CARD_BUILDERS['h-apple']=healthAppleCard;

function saglikHTML(){ return SEYMA_RENDER.saglikHTML.apply(null,arguments); }

// ---- magnesium adaptive nudge ----
// ---- magnesium adaptive nudge ----
function calculateMgNudge(){ return SEYMA_HEALTH.calculateMgNudge.apply(null,arguments); }
function suggestMgForm(){ return SEYMA_HEALTH.suggestMgForm.apply(null,arguments); }
function magnesiumReasonText(){ return SEYMA_HEALTH.magnesiumReasonText.apply(null,arguments); }
function magnesiumHeadline(){ return SEYMA_HEALTH.magnesiumHeadline.apply(null,arguments); }
function magnesiumStats(){ return SEYMA_HEALTH.magnesiumStats.apply(null,arguments); }

// ---- cycle math (takvim/ortalama yöntemi, luteal ~14 gün) ----
function sortedPeriods(){ return (data.cycle.periods||[]).filter(function(p){return p&&p.start;}).slice().sort(function(a,b){return a.start<b.start?-1:(a.start>b.start?1:0);}); }
function cycleStats(){
  var ps=sortedPeriods(); var starts=ps.map(function(p){return p.start;});
  var lens=[]; for(var i=1;i<starts.length;i++){ var dl=diffDays(starts[i-1],starts[i]); if(dl>=15&&dl<=60) lens.push(dl); }
  var avgCycle=lens.length?Math.round(lens.reduce(function(a,b){return a+b;},0)/lens.length):(data.cycle.avgCycle||28); avgCycle=Math.max(21,Math.min(40,avgCycle));
  var plens=[]; ps.forEach(function(p){ if(p.start&&p.end){ var d=diffDays(p.start,p.end)+1; if(d>0&&d<15) plens.push(d); } });
  var avgPeriod=plens.length?Math.round(plens.reduce(function(a,b){return a+b;},0)/plens.length):(data.cycle.avgPeriod||5); avgPeriod=Math.max(2,Math.min(10,avgPeriod));
  var last=starts.length?starts[starts.length-1]:null; var today=todayStr();
  var next=null,ovu=null,fS=null,fE=null,dayInCycle=null,phase=null;
  if(last){ var since=diffDays(last,today); if(since>=0) dayInCycle=(since%avgCycle)+1;
    next=addDays(last,avgCycle); var guard=0; while(diffDays(next,today)>0&&guard<60){ next=addDays(next,avgCycle); guard++; }
    ovu=addDays(next,-14); fS=addDays(ovu,-5); fE=addDays(ovu,1);
    if(dayInCycle){ var ovuDay=avgCycle-14; if(dayInCycle<=avgPeriod) phase='menstrual'; else if(dayInCycle<ovuDay-1) phase='follicular'; else if(dayInCycle<=ovuDay+1) phase='ovulation'; else phase='luteal'; }
  }
  return {ps:ps,avgCycle:avgCycle,avgPeriod:avgPeriod,last:last,next:next,ovu:ovu,fertileStart:fS,fertileEnd:fE,dayInCycle:dayInCycle,phase:phase,sampleCount:lens.length};
}
function fmtTR(){ return SEYMA_HEALTH.fmtTR.apply(null,arguments); }
function cycleWheel(){ return SEYMA_HEALTH.cycleWheel.apply(null,arguments); }
function cycleHTML(){ return SEYMA_HEALTH.cycleHTML.apply(null,arguments); }
CARD_BUILDERS['h-cycle']=cycleHTML;

function zikrPreviewCardHTML(){ return window.SeymaZikr.zikrPreviewCardHTML.apply(null,arguments); }
function zikrDetailControlsHTML(p){ return window.SeymaZikr.zikrDetailControlsHTML.apply(null,arguments); }
function zikrResetConfirmHTML(p,pd){ return window.SeymaZikr.zikrResetConfirmHTML.apply(null,arguments); }
function zikrActionNoteHTML(){ return window.SeymaZikr.zikrActionNoteHTML.apply(null,arguments); }
function zikrNoteEditorHTML(p){ return window.SeymaZikr.zikrNoteEditorHTML.apply(null,arguments); }
function zikrManualAmountOf(d){ return window.SeymaZikr.zikrManualAmountOf.apply(null,arguments); }
function zikrManualQuickChips(p){ return window.SeymaZikr.zikrManualQuickChips.apply(null,arguments); }
function zikrManualPreviewHTML(p,d){ return window.SeymaZikr.zikrManualPreviewHTML.apply(null,arguments); }
function zikrManualSheetHTML(p){ return window.SeymaZikr.zikrManualSheetHTML.apply(null,arguments); }
function zikrCounterViewHTML(p,z){ return window.SeymaZikr.zikrCounterViewHTML.apply(null,arguments); }
function zikrPresetsResultsHTML(p,z){ return window.SeymaZikr.zikrPresetsResultsHTML.apply(null,arguments); }
function zikrPresetsViewHTML(p,z){ return window.SeymaZikr.zikrPresetsViewHTML.apply(null,arguments); }
function zikrHatimsViewHTML(p,z){ return window.SeymaZikr.zikrHatimsViewHTML.apply(null,arguments); }
function zikrHistoryViewHTML(z){ return window.SeymaZikr.zikrHistoryViewHTML.apply(null,arguments); }
function zikrSettingsViewHTML(z){ return window.SeymaZikr.zikrSettingsViewHTML.apply(null,arguments); }
function zikrNoteDraftFor(p){ return window.SeymaZikr.zikrNoteDraftFor.apply(null,arguments); }
function zikrManualDraftFor(p){ return window.SeymaZikr.zikrManualDraftFor.apply(null,arguments); }
function zikroverlayHTML(){ return SEYMA_RENDER.zikroverlayHTML.apply(null,arguments); }

function zikrViewBodyHTML(view,p,z){ return window.SeymaZikr.zikrViewBodyHTML.apply(null,arguments); }
function zikrPaintView(view,keepScroll){ return window.SeymaZikr.zikrPaintView.apply(null,arguments); }
function zikrPaintPauseButton(){ return window.SeymaZikr.zikrPaintPauseButton.apply(null,arguments); }
// ═══ Raşit ile Kur’an Yolculuğu — sunum katmanı ═══════════════════════════
// QY-05 hub kartı · QY-06 tam ekran sûre kütüphanesi · QY-07 sûre ayrıntısı
// ve duruma göre TEK ana eylem.
//
// Katman sınırları:
//   içerik  → quranRevelationOrderV1.js (dondurulmuş 114 sûre kataloğu)
//   şema    → ensureQuranJourney/normQuranRequest (QY-02)
//   geçiş   → quranReduce + QURAN_TRANSITIONS (QY-03, saf)
//   taşıma  → quranTransportV1.js sözleşmeleri (QY-04)
// Buradaki hiçbir fonksiyon durum geçişini elle yazmaz; hepsi quranReduce'tan
// geçer. Böylece "bekleyen istekte ikinci istek yok" ve "ready/watched geriye
// gitmez" kuralları tek bir yerde kalır.

var QURAN_TOTAL_FALLBACK=114;
function quranCatalog(){ return window.SeymaQuran.quranCatalog.apply(null,arguments); }
function quranSurah(id){ return window.SeymaQuran.quranSurah.apply(null,arguments); }
function quranTotal(){ return window.SeymaQuran.quranTotal.apply(null,arguments); }
function quranPlaceLabel(x){ return window.SeymaQuran.quranPlaceLabel.apply(null,arguments); }
function quranPlaceDisputed(id){ return window.SeymaQuran.quranPlaceDisputed.apply(null,arguments); }
function quranRequestOf(q,id){ return window.SeymaQuran.quranRequestOf.apply(null,arguments); }

// ── Durum → kova eşlemesi (QY-06 filtreleri) ──
// Plan §4 tam olarak beş filtre ister. Hata durumları (request_error,
// notification_error, invalid_reply, video_unavailable) "istenmiş ama henüz
// sonuçlanmamış" olduğu için Bekleniyor kovasına düşer; satırda ayrı bir
// uyarı tonu ve kendi metniyle işaretlenir, böylece bilgi kaybolmaz.
var QURAN_BUCKETS={
  idle:'unrequested',
  submitting:'waiting',queued:'waiting',notified:'waiting',awaiting_reply:'waiting',validating_reply:'waiting',
  request_error:'waiting',notification_error:'waiting',invalid_reply:'waiting',video_unavailable:'waiting',
  ready:'ready',watching:'ready',
  watched:'watched',question_opened:'watched'
};
var QURAN_FILTERS=[['all','Tümü'],['unrequested','İstenmedi'],['waiting','Bekleniyor'],['ready','Hazır'],['watched','İzlendi']];
function quranBucket(status){ return window.SeymaQuran.quranBucket.apply(null,arguments); }
function quranActiveFilter(){ return window.SeymaQuran.quranActiveFilter.apply(null,arguments); }
function quranFilterLabel(f){ return window.SeymaQuran.quranFilterLabel.apply(null,arguments); }
// Satır/rozet tonu ve kullanıcıya gösterilen kısa durum adı. Renk tek başına
// anlam taşımaz (QY-17): her tonun yanında daima metin vardır.
var QURAN_ROW_STATES={
  idle:{tone:'idle',label:'İstenmedi'},
  submitting:{tone:'wait',label:'İletiliyor'},
  queued:{tone:'wait',label:'İstek kaydedildi'},
  notified:{tone:'wait',label:'Raşit’e haber verildi'},
  awaiting_reply:{tone:'wait',label:'Cevap bekleniyor'},
  validating_reply:{tone:'wait',label:'Cevap doğrulanıyor'},
  ready:{tone:'ready',label:'Anlatım hazır'},
  watching:{tone:'ready',label:'İzleniyor'},
  watched:{tone:'done',label:'İzlendi'},
  question_opened:{tone:'done',label:'Soru açıldı'},
  request_error:{tone:'warn',label:'İletilemedi'},
  notification_error:{tone:'warn',label:'Bildirilemedi'},
  invalid_reply:{tone:'warn',label:'Bağlantı doğrulanamadı'},
  video_unavailable:{tone:'warn',label:'Anlatım erişilemiyor'}
};
function quranRowState(status){ return window.SeymaQuran.quranRowState.apply(null,arguments); }
function quranStatusNote(status,name){ return window.SeymaQuran.quranStatusNote.apply(null,arguments); }

function quranFilterCounts(){ return window.SeymaQuran.quranFilterCounts.apply(null,arguments); }
function quranFilteredSurahs(){ return window.SeymaQuran.quranFilteredSurahs.apply(null,arguments); }
function quranJourneyStats(){ return window.SeymaQuran.quranJourneyStats.apply(null,arguments); }

function quranActiveVerse(){ return window.SeymaQuran.quranActiveVerse.apply(null,arguments); }
function quranAdvanceVerseIndex(){ return window.SeymaQuran.quranAdvanceVerseIndex.apply(null,arguments); }
function quranPreviewToneOf(status){ return window.SeymaQuran.quranPreviewToneOf.apply(null,arguments); }
function quranJourneyHubCardHTML(){ return SEYMA_RENDER.quranJourneyHubCardHTML.apply(null,arguments); }
function quranJourneyCardCopy(status,canReq,req,order,total){ return window.SeymaQuran.quranJourneyCardCopy.apply(null,arguments); }

// ── QY-06 tam ekran kabuk ──
function quranJourneyOverlayHTML(){ return SEYMA_RENDER.quranJourneyOverlayHTML.apply(null,arguments); }
function quranRemoteStatusHTML(){ return SEYMA_RENDER.quranRemoteStatusHTML.apply(null,arguments); }
function quranHeadLeadHTML(){ return SEYMA_RENDER.quranHeadLeadHTML.apply(null,arguments); }
function quranViewBodyHTML(){ return window.SeymaQuran.quranViewBodyHTML.apply(null,arguments); }

// ── QY-06 kütüphane görünümü ──
function quranLibraryViewHTML(){ return SEYMA_RENDER.quranLibraryViewHTML.apply(null,arguments); }
function quranLibraryResultsHTML(){ return SEYMA_RENDER.quranLibraryResultsHTML.apply(null,arguments); }
function quranRowHTML(x,q){ return SEYMA_RENDER.quranRowHTML.apply(null,arguments); }

// ── QY-07 sûre ayrıntısı ──
function quranDetailViewHTML(id){ return SEYMA_RENDER.quranDetailViewHTML.apply(null,arguments); }
function quranVideoThumbUrl(videoId){ return window.SeymaQuran.quranVideoThumbUrl.apply(null,arguments); }
function quranEmbedOrigin(){ return window.SeymaQuran.quranEmbedOrigin.apply(null,arguments); }
var _quranYtApiState='idle'; // idle | loading | ready
var _quranYtPendingSurahId='';
var _quranYtRestartSurahId='';
function quranLoadYtApi(){
  if(_quranYtApiState!=='idle') return;
  _quranYtApiState='loading';
  try{
    if(typeof document==='undefined'||!document.createElement) return;
    var prev=(typeof window!=='undefined')?window.onYouTubeIframeAPIReady:null;
    window.onYouTubeIframeAPIReady=function(){
      _quranYtApiState='ready';
      try{ if(typeof prev==='function') prev(); }catch(e){}
      if(_quranYtPendingSurahId) quranBindPlayer(_quranYtPendingSurahId);
    };
    var s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    s.async=true;
    (document.head||document.body||document.documentElement).appendChild(s);
  }catch(e){ _quranYtApiState='idle'; }
}
// API engellenir/yüklenemezse (adblock, ağ hatası) sessizce hiç bağlanamaz —
// bu bilinçlidir: görünür "İzledim" yedeği tam olarak bu durumu karşılar.
function quranAttachPlayer(surahId){
  _quranYtPendingSurahId=surahId;
  if(_quranYtApiState==='ready'){ quranBindPlayer(surahId); return; }
  quranLoadYtApi();
}
function quranBindPlayer(surahId){
  try{
    if(typeof window==='undefined'||typeof window.YT==='undefined'||!window.YT||typeof window.YT.Player!=='function') return;
    var el=document.getElementById('quran-yt-player'); if(!el) return;
    new window.YT.Player('quran-yt-player',{events:{
      onReady:function(e){
        if(_quranYtRestartSurahId!==surahId||ui.quranPlayerLoadedId!==surahId) return;
        _quranYtRestartSurahId='';
        try{ e.target.seekTo(0,true); e.target.playVideo(); }catch(err){}
      },
      onStateChange:function(e){ quranOnPlayerStateChange(surahId,e); }
    }});
  }catch(e){}
}
function quranOnPlayerStateChange(surahId,e){
  try{
    if(!e||e.data!==0) return; // YT.PlayerState.ENDED === 0
    // Kullanıcı bu arada başka bir ekrana/sûreye geçmiş olabilir; artık
    // görünür olmayan bir oynatıcının gecikmeli ENDED'ı durumu değiştirmesin.
    if(ui.quranPlayerLoadedId!==surahId) return;
    App.quranMarkWatched(surahId);
  }catch(err){}
}
function quranNoteKindMeta(kind){ return window.SeymaQuran.quranNoteKindMeta.apply(null,arguments); }
function quranNoteTimeLabel(sec){ return window.SeymaQuran.quranNoteTimeLabel.apply(null,arguments); }
function quranNoteDraftFor(sid){ return window.SeymaQuran.quranNoteDraftFor.apply(null,arguments); }
function quranVideoNotesInnerHTML(x,req){ return SEYMA_RENDER.quranVideoNotesInnerHTML.apply(null,arguments); }
function quranVideoNotesHTML(x,req){ return SEYMA_RENDER.quranVideoNotesHTML.apply(null,arguments); }
function quranVideoCardHTML(x,req){ return SEYMA_RENDER.quranVideoCardHTML.apply(null,arguments); }
// video_gone: videoId TEŞHİS için korunur ama burada ASLA kapak/iframe
// üretilmez — "kırık alan yerine açıklama" (plan §10).
function quranVideoUnavailableHTML(){ return SEYMA_RENDER.quranVideoUnavailableHTML.apply(null,arguments); }
function quranDetailBodyHTML(x){ return SEYMA_RENDER.quranDetailBodyHTML.apply(null,arguments); }
function quranDetailAction(id,req){ return window.SeymaQuran.quranDetailAction.apply(null,arguments); }
function quranQuestionAction(id,req){ return window.SeymaQuran.quranQuestionAction.apply(null,arguments); }
function quranCtaButtonHTML(action,extraClass){ return SEYMA_RENDER.quranCtaButtonHTML.apply(null,arguments); }
// Ayrıntıdaki eylem satırı artık tek bir durum düğümüne bağlı değildir:
// istek eylemi varsa “Raşit’ten iste” ile kalıcı “Raşit’e sor” yan yana durur.
// Hazır/izleniyor durumunda video kartının kapak düğmesi birincil eylem olmaya
// devam eder; soru düğmesi her durumda etkin kalır.
function quranDetailActionsHTML(id,req,ctaReplacedByCard){ return SEYMA_RENDER.quranDetailActionsHTML.apply(null,arguments); }

function quranPaintView(view,top){ return window.SeymaQuran.quranPaintView.apply(null,arguments); }
function quranPaintLibraryResults(){ return window.SeymaQuran.quranPaintLibraryResults.apply(null,arguments); }
function quranPaintNotes(sid){ return window.SeymaQuran.quranPaintNotes.apply(null,arguments); }
App.quranNoteField=function(field,el){
  var sid=ui.quranDetailId; if(!sid) return;
  var draft=quranNoteDraftFor(sid), value=String((el&&el.value)||'');
  if(field==='kind'&&QURAN_NOTE_KINDS.indexOf(value)>=0) draft.kind=value;
  else if(field==='timestamp'||field==='tag'||field==='text') draft[field]=value;
};
App.quranAddNote=function(id){
  var sid=quranSafeSurahId(id); if(!sid){ toast('Bu sûre bulunamadı.'); return; }
  var q=ensureQuranJourney(data), req=q&&q.requests?q.requests[sid]:null;
  if(!req||!QURAN_VIDEO_ID_RE.test(String(req.videoId||''))){ toast('Not eklemek için anlatımın hazır olması gerekiyor.'); return; }
  var draft=quranNoteDraftFor(sid), text=String(draft.text||'').trim().slice(0,2000);
  if(!text){ toast('Önce kısa bir not yaz.'); return; }
  var sec=null;
  if(String(draft.timestamp||'').trim()!==''){
    var num=Number(draft.timestamp); if(!isFinite(num)||num<0){ toast('Video saniyesi 0 veya daha büyük olmalı.'); return; }
    sec=Math.floor(num);
  }
  var at=new Date().toISOString(), note=normQuranNote({id:uid('qn'),kind:draft.kind,videoId:req.videoId,timestampSec:sec,tag:draft.tag,text:text,createdAt:at,updatedAt:at});
  if(!note){ toast('Not kaydedilemedi.'); return; }
  req.notes=Array.isArray(req.notes)?req.notes:[];
  req.notes.unshift(note); req.notes=quranSortNotes(req.notes).slice(0,QURAN_NOTE_MAX);
  req.lastNoteAt=at; req.updatedAt=at;
  q.requests[sid]=req; save();
  ui.quranNoteDraft={surahId:sid,kind:'watch',timestamp:'',tag:'',text:''};
  if(!quranPaintNotes(sid)) quranRepaintAfterChange(sid);
  toast('Not kaydedildi.');
};
function quranRepaintAfterChange(id){ return window.SeymaQuran.quranRepaintAfterChange.apply(null,arguments); }

// ── QY-07 istek hattı ──
// requestId, QY-04 taşıma sözleşmesindeki /^qr_[A-Za-z0-9_-]{8,64}$/ desenine
// UYMAK ZORUNDA; aksi halde outbox kaydı reddedilir.
// Mobil şebekede GitHub'a GET+PUT turu 20 sn'yi rahatça aşabiliyor; eski
// 20 sn'lik watchdog yazma hâlâ uçarken "iletilemedi" diyordu (gerçek üretim
// vakası: mesed için 16:16–16:18 arası üç istek de outbox'a yazıldı ve maili
// gitti, üçü de uygulamada hata göründü). Süre genişletildi; ama asıl güvence
// süre değil, aşağıdaki outbox doğrulamasıdır.
var QURAN_SUBMIT_TIMEOUT_MS=45000;
var QURAN_CONFIRM_TIMEOUT_MS=12000;
var QURAN_PRECHECK_TIMEOUT_MS=8000;
// QY-07: gönderim sırasında çift dokunma engeli — aynı anda tek uçuş.
// Karara varmadan önce en güncel teslim/yanıt durumunu çekmeyi dener: bayat
// bir sekme/cihaz, başka bir cihazda zaten yanıtlanmış bir sûreyi hâlâ
// "istenebilir" sanıp ikinci bir requestId + outbox kaydı + mail üretmesin
// (bkz. quranApplyRemoteUpdates — aynı fonksiyon "Güncellemeleri kontrol et"
// butonunun da kullandığı, salt-okunur ve idempotent yoldur).
App.quranJourneySubmit=function(id){
  var sid=quranSafeSurahId(id);
  if(!sid){ toast('Bu sûre bulunamadı.'); return; }
  if(ui.quranSubmittingId) return;
  var s=(typeof window!=='undefined')?window.SeySync:null;
  if(s&&typeof s.pullQuranUpdates==='function'){
    ui.quranSubmittingId=sid;
    var settledPre=false;
    function settlePre(){ if(settledPre) return; settledPre=true; ui.quranSubmittingId=''; quranJourneySubmitProceed(sid); }
    try{ setTimeout(settlePre,QURAN_PRECHECK_TIMEOUT_MS); }catch(e){}
    try{
      s.pullQuranUpdates(function(err,result){
        if(!err&&result){
          var remoteResult=quranApplyRemoteUpdates(result.delivery,result.responses);
          if(remoteResult&&remoteResult.changed){ save(); quranRepaintAfterChange(sid); }
        }
        settlePre();
      });
    }catch(e){ settlePre(); }
    return;
  }
  quranJourneySubmitProceed(sid);
};
function quranJourneySubmitProceed(sid){
  var q=ensureQuranJourney(data), req=quranRequestOf(q,sid);
  // İkinci kayıt kapısı: açık istek varken yeni requestId üretilmez.
  if(!quranCanRequest(req)){
    var doneStatuses={ready:1,watching:1,watched:1,question_opened:1};
    toast(doneStatuses[req.status]?'Bu sûre için anlatım zaten var; kütüphaneden izleyebilirsin.':'Bu sûre için açık bir istek var; ikinci istek gönderilmiyor.');
    quranRepaintAfterChange(sid);
    return;
  }
  var at=new Date().toISOString(), requestId=quranNewRequestId();
  var res=quranReduce(req,{type:'request_submit',requestId:requestId,at:at});
  if(!res.ok||!res.changed){ toast('Bu sûre için şu an yeni istek gönderilemiyor.'); return; }
  q.requests[sid]=res.request;
  q.activeSurahId=sid;
  if(!q.startedAt) q.startedAt=at;
  ui.quranSubmittingId=sid;
  save();
  quranRepaintAfterChange(sid);
  var x=quranSurah(sid);
  var payload={
    schemaVersion:QURAN_SCHEMA_VERSION,requestId:requestId,surahId:sid,
    revelationOrder:x?x.revelationOrder:null,mushafOrder:x?x.mushafOrder:null,
    surahName:x?x.nameTr:sid,requestedAt:at
  };
  var settled=false;
  function settle(okFlag,err){ if(settled) return; settled=true; quranSettleSubmit(sid,okFlag,err); }
  var writer=quranOutboxWriter();
  if(!writer){ settle(false,new Error('quran_outbox: senkron yapılandırılmamış')); return; }
  // Yazıcı ne callback ne promise döndürürse istek sonsuza dek "submitting"de
  // asılı kalmasın; watchdog güvenli hataya düşürür ve retry açılır.
  try{ setTimeout(function(){ settle(false,new Error('quran_outbox: timeout')); },QURAN_SUBMIT_TIMEOUT_MS); }catch(e){}
  try{
    var ret=writer.pushQuranRequest(payload,function(err){ settle(!err,err); });
    if(ret&&typeof ret.then==='function') ret.then(function(){ settle(true); },function(err){ settle(false,err); });
  }catch(e){ settle(false,e); }
}
function quranSettleSubmit(sid,okFlag,err){ return window.SeymaQuran.quranSettleSubmit.apply(null,arguments); }
App.quranJourneyRequest=function(){ return window.SeymaQuran.quranJourneyRequest.apply(null,arguments); };
App.quranJourneyWatch=function(id){ return window.SeymaQuran.quranJourneyWatch.apply(null,arguments); };
App.quranMarkWatched=function(id){ return window.SeymaQuran.quranMarkWatched.apply(null,arguments); };
function quranAskMessage(x){ return window.SeymaQuran.quranAskMessage.apply(null,arguments); }
App.quranJourneyQuestion=function(id){ return window.SeymaQuran.quranJourneyQuestion.apply(null,arguments); };

var _iipModalReturn={focusId:'',scrollTop:0};
function iipRememberModalReturn(fallbackId){
  var active=null, sc=null;
  try{ active=document.activeElement; sc=document.querySelector('[data-scroll]'); }catch(e){}
  _iipModalReturn.focusId=String(active&&active.id||fallbackId||'');
  _iipModalReturn.scrollTop=sc?Number(sc.scrollTop||0):0;
}
function iipRestoreModalReturn(fallbackId){
  var focusId=_iipModalReturn.focusId||fallbackId||'', scrollTop=_iipModalReturn.scrollTop||0, sc=null, trigger=null;
  _iipModalReturn={focusId:'',scrollTop:0};
  try{ sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=scrollTop; trigger=focusId?document.getElementById(focusId):null; if(!trigger&&fallbackId) trigger=document.getElementById(fallbackId); if(trigger&&trigger.focus) trigger.focus(); }catch(e){}
}

// ── QY-11: uzak teslim/yanıt dosyalarını yerel duruma güvenle uygula ──
// Girdi ZATEN QuranTransportV1 ile ayrıştırılmış/doğrulanmış yapılardır; bu
// fonksiyon ham JSON/ağ hiç görmez. Her geçiş quranReduce() üzerinden gider,
// bu yüzden idempotens/monotonluk garantisi otomatik miras alınır: aynı
// teslim/yanıt tekrar tekrar uygulansa bile durum bozulmaz, geriye gitmez.
// requestId eşleşmesi zaten sûre bazlı arama ile sağlanır; response.surahId
// ayrıca çapraz doğrulanır (yanlış sûre eşleme tehdidi — plan §2/§9).
// QY-21: requestId kayması onarımı. Uygulamanın yerel requestId'si ile
// outbox'taki requestId ayrışabilir — yazma başarısız SANILIP yeniden
// istendiğinde yerelde yeni bir id üretilir, oysa Gmail köprüsü cevabı
// outbox'taki id ile yazar. Böyle bir durumda tam id eşleşmesi tutmaz ve
// GERÇEK bir cevap sessizce düşerdi (gerçek üretim vakası: mesed).
// Bu yedek yol kasıtlı olarak dar tutulmuştur:
//   • yalnız AYNI sûre için (yanlış sûre eşleme hâlâ imkânsız),
//   • yalnız açık isteğin istendiği andan SONRA doğrulanmış cevaplar
//     (eski bir anlatım yeniden istendikten sonra geri canlanamaz),
//   • zaman damgası olmayan kayıt asla kabul edilmez.
var QURAN_REFRESH_TIMEOUT_MS=20000;
function quranHasRemoteRequest(){ return window.SeymaQuran.quranHasRemoteRequest.apply(null,arguments); }
App.refreshQuranUpdates=function(silent,force){ return window.SeymaQuran.refreshQuranUpdates.apply(null,arguments); };

// ── Overlay ve kütüphane etkileşimleri ──
App.openQuranJourney=function(){
  if(ui.quranJourneyOpen) return;
  iipRememberModalReturn('quran-journey-card');
  ui.quranJourneyOpen=true;
  ui.quranJourneyView='library';
  ui.quranDetailId='';
  ui.quranNoteDraft=null;
  ui.quranListScroll=0;
  ui.quranPlayerLoadedId='';
  render();
  quranLockBodyScroll();
  try{ var shell=document.getElementById('quran-screen'); if(shell&&shell.focus) shell.focus(); }catch(e){}
  // QY-11: ekran açılışında ve foreground dönüşünde sessiz, bounded bir
  // teslim/yanıt kontrolü yapılır; gerçek zamanlı push iddiası yoktur.
  App.refreshQuranUpdates(true,true);
};
App.closeQuranJourney=function(){
  if(!ui.quranJourneyOpen) return;
  var body=function(){
    ui.quranJourneyOpen=false;
    ui.quranJourneyView='library';
    ui.quranDetailId='';
    ui.quranNoteDraft=null;
    ui.quranPlayerLoadedId='';
    ui.quranFiltersOpen=false;
    quranUnlockBodyScroll();
    render();
    iipRestoreModalReturn('quran-journey-card');
  };
  if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('quran-screen','quran-overlay',body); else body();
};
App.openQuranSurah=function(id){
  var sid=quranSafeSurahId(id);
  if(!sid) return;
  // Liste konumunu sakla ki geri dönüşte aynı durakta kalınsın.
  try{ var body=document.getElementById('quran-scroll'); ui.quranListScroll=body?(body.scrollTop||0):0; }catch(e){ ui.quranListScroll=0; }
  ui.quranDetailId=sid;
  ui.quranNoteDraft=null;
  ui.quranJourneyView='detail';
  ui.quranPlayerLoadedId='';
  if(!quranPaintView('detail',0)) render();
  try{ var t=document.getElementById('quran-detail-title'); if(t&&t.focus) t.focus(); }catch(e){}
};
App.backToQuranLibrary=function(){
  var from=ui.quranDetailId;
  ui.quranJourneyView='library';
  ui.quranDetailId='';
  ui.quranNoteDraft=null;
  ui.quranPlayerLoadedId='';
  if(!quranPaintView('library',ui.quranListScroll||0)) render();
  try{ var row=document.getElementById('quran-row-'+from); if(row&&row.focus) row.focus(); }catch(e){}
};
App.setQuranQuery=function(el){
  ui.quranQuery=String((el&&el.value)||'');
  if(!quranPaintLibraryResults()) render();
  try{ var clear=document.getElementById('quran-search-clear'); if(clear) clear.hidden=!ui.quranQuery; }catch(e){}
};
App.clearQuranQuery=function(){
  ui.quranQuery='';
  if(!quranPaintLibraryResults()) render();
  try{
    var el=document.getElementById('quran-search-input'), clear=document.getElementById('quran-search-clear');
    if(el){ el.value=''; if(el.focus) el.focus(); }
    if(clear) clear.hidden=true;
  }catch(e){}
};
App.setQuranFilter=function(f){
  ui.quranFilter=String(f||'all');
  ui.quranFilter=quranActiveFilter(); // bilinmeyen değer sessizce "Tümü"ye düşer
  if(!quranPaintLibraryResults()) render();
};
App.resetQuranLens=function(){
  ui.quranQuery=''; ui.quranFilter='all';
  if(!quranPaintLibraryResults()) render();
  try{ var el=document.getElementById('quran-search-input'), clear=document.getElementById('quran-search-clear'); if(el) el.value=''; if(clear) clear.hidden=true; }catch(e){}
};
App.toggleQuranFilters=function(){
  ui.quranFiltersOpen=!ui.quranFiltersOpen;
  try{
    var shell=document.querySelector('.quran-v2-filter-expander'), panel=document.getElementById('quran-filter-panel');
    var button=(shell&&shell.querySelector)?shell.querySelector('.quran-v2-filter-summary'):null;
    if(!shell||!panel||!button) throw new Error('filter expander unavailable');
    shell.classList.toggle('is-open',ui.quranFiltersOpen);
    panel.hidden=!ui.quranFiltersOpen;
    button.setAttribute('aria-expanded',ui.quranFiltersOpen?'true':'false');
  }catch(e){ if(!quranPaintLibraryResults()) render(); }
};
App.onQuranKeydown=function(e){
  if(!e) return;
  if(e.key==='Escape'){
    if(e.preventDefault) e.preventDefault();
    if(e.stopPropagation) e.stopPropagation();
    if(ui.quranJourneyView==='detail') App.backToQuranLibrary(); else App.closeQuranJourney();
    return;
  }
  return App.onModalKeydown(e,App.closeQuranJourney);
};
var _quranBodyLocked=false,_quranBodyPrevOverflow='';
function quranLockBodyScroll(){ return window.SeymaQuran.quranLockBodyScroll.apply(null,arguments); }
function quranUnlockBodyScroll(){ return window.SeymaQuran.quranUnlockBodyScroll.apply(null,arguments); }
App.openQibla=function(){ if(ui.qiblaOpen) return; iipRememberModalReturn('qibla-card'); ui.qiblaOpen=true; ui.qiblaSensorError=''; render(); focusModalDialog('qibla-dialog'); };
var _qiblaOrientationHandler=null, _qiblaLastPaint=0, _qiblaSmoothHeading=null, _qiblaAbsoluteSeen=false;
function qiblaSmoothAngle(previous,next,weight){
  if(previous==null) return next;
  var delta=((next-previous+540)%360)-180;
  return (previous+delta*(weight||.22)+360)%360;
}
function qiblaPaintLive(){
  try{
    var m=qiblaMetrics(prayerLocation(),ui.qiblaHeading), align=qiblaAlignmentCopy(m);
    var needle=document.getElementById('qibla-live-needle'), heading=document.getElementById('qibla-live-heading'), status=document.getElementById('qibla-live-status'), sensor=document.getElementById('qibla-live-sensor'), error=document.getElementById('qibla-live-error'), button=document.getElementById('qibla-sensor-button');
    if(!needle||!heading||!status||!sensor||!button) return false;
    needle.style.transform='rotate('+m.relative+'deg)';
    heading.textContent=m.hasHeading?(((Number(ui.qiblaHeading)%360+360)%360).toFixed(1).replace('.',',')+'°'):'—';
    status.className='qibla-v2-alignment '+align.state;
    status.innerHTML='<span class="signal">'+icon(align.state==='aligned'?'circle-check':'navigation',16)+'</span><div><strong>'+esc(align.title)+'</strong><small>'+esc(align.detail)+'</small></div>';
    sensor.textContent=(ui.qiblaSensorSource==='magnetic'?'Manyetik pusula · sapma olabilir':'Mutlak cihaz yönü')+(ui.qiblaAccuracy!=null?' · ±'+Math.round(ui.qiblaAccuracy)+'°':'');
    button.className='sensor on'; button.innerHTML=icon('compass',16)+'<span><b>Pusula açık</b><small>Telefonu düz tut</small></span>';
    if(error){ error.hidden=!ui.qiblaSensorError; error.innerHTML=ui.qiblaSensorError?(icon('triangle-alert',15)+'<span>'+esc(ui.qiblaSensorError)+'</span>'):''; }
    return true;
  }catch(e){ return false; }
}
App.enableQiblaCompass=function(){
  function start(){
    if(_qiblaOrientationHandler){ qiblaPaintLive(); return; }
    _qiblaOrientationHandler=function(e){
      var hd=null, source='';
      if(typeof e.webkitCompassHeading==='number'&&isFinite(e.webkitCompassHeading)){
        hd=e.webkitCompassHeading; source='magnetic'; ui.qiblaAccuracy=(typeof e.webkitCompassAccuracy==='number'&&e.webkitCompassAccuracy>=0)?e.webkitCompassAccuracy:null;
      } else if(e.type==='deviceorientationabsolute'||e.absolute===true){
        if(typeof e.alpha==='number'&&isFinite(e.alpha)){ hd=(360-e.alpha+qiblaScreenAngle())%360; source='absolute'; _qiblaAbsoluteSeen=true; }
      } else if(!_qiblaAbsoluteSeen){
        ui.qiblaSensorError='Bu sensör kuzeye sabitlenmiş mutlak yön vermiyor. Cihaz pusulasını kalibre edip yeniden dene.';
        qiblaPaintLive(); return;
      }
      if(hd==null||Date.now()-_qiblaLastPaint<80) return;
      _qiblaLastPaint=Date.now(); _qiblaSmoothHeading=qiblaSmoothAngle(_qiblaSmoothHeading,hd,.24);
      ui.qiblaHeading=_qiblaSmoothHeading; ui.qiblaListening=true; ui.qiblaSensorSource=source; ui.qiblaSensorError=''; ui.qiblaLastAt=new Date().toISOString();
      qiblaPaintLive();
    };
    try{ window.addEventListener('deviceorientationabsolute',_qiblaOrientationHandler,true); window.addEventListener('deviceorientation',_qiblaOrientationHandler,true); ui.qiblaListening=true; ui.qiblaSensorError='Yön verisi bekleniyor…'; qiblaPaintLive(); }catch(e){ ui.qiblaSensorError='Bu cihaz canlı pusulayı desteklemiyor.'; qiblaPaintLive(); toast(ui.qiblaSensorError); }
  }
  try{
    if(window.DeviceOrientationEvent&&typeof window.DeviceOrientationEvent.requestPermission==='function'){
      window.DeviceOrientationEvent.requestPermission().then(function(v){ if(v==='granted') start(); else { ui.qiblaSensorError='Pusula izni verilmedi.'; qiblaPaintLive(); toast(ui.qiblaSensorError); } }).catch(function(){ ui.qiblaSensorError='Pusula izni açılamadı.'; qiblaPaintLive(); toast(ui.qiblaSensorError); });
    } else start();
  }catch(e){ ui.qiblaSensorError='Bu cihaz canlı pusulayı desteklemiyor.'; qiblaPaintLive(); toast(ui.qiblaSensorError); }
};
App.closeQibla=function(){
  if(!ui.qiblaOpen) return;
  var body=function(){
    if(_qiblaOrientationHandler){ try{ window.removeEventListener('deviceorientationabsolute',_qiblaOrientationHandler,true); window.removeEventListener('deviceorientation',_qiblaOrientationHandler,true); }catch(e){} _qiblaOrientationHandler=null; }
    _qiblaSmoothHeading=null; _qiblaAbsoluteSeen=false; ui.qiblaOpen=false; ui.qiblaListening=false; ui.qiblaHeading=null; ui.qiblaAccuracy=null; ui.qiblaSensorSource=''; ui.qiblaSensorError=''; render(); iipRestoreModalReturn('qibla-card');
  };
  if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('qibla-dialog','qibla-overlay',body); else body();
};
App.qiblaBearing=qiblaBearing; App.qiblaDistanceKm=qiblaDistanceKm; App.qiblaMetrics=qiblaMetrics;

function monthTitle(ym){
  var names=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var p=String(ym||todayStr().slice(0,7)).split('-'), y=+p[0], m=+p[1];
  return (names[m-1]||'')+(y?' '+y:'');
}
function headerActionHTML(){ return window.SeymaAppSurface.headerActionHTML.apply(null,arguments); }
function appHeaderMeta(){
  var tab=ui.tab||'bugun', ed=editing(), viewDate=activeDate();
  var rec=data.days[viewDate]||null;
  var base={kicker:'Şeyma',title:'Bugün',sub:'Minik Denge Günlüğü',icon:'sun',accent:'#3A4048',accent2:'#A4824C',ink:'#2D2A27',action:null};
  if(tab==='bugun'){
    if(rec) syncDerivedHabits(rec);
    var ht=habitCountOn(viewDate), completed=countRec(rec), curIdx=Math.max(1,dayIndexFor(viewDate));
    base.kicker=ed?'Geçmiş gün':'Gün '+curIdx;
    base.title=ed?dateLabelTR(viewDate):'Bugün';
    base.sub=ed?'Bu gün düzenleniyor':(completed+'/'+ht+' tik · '+(savedToday()?'repoya kaydedildi':'kayıt bekliyor'));
    base.icon='sun'; base.accent='#7B5E2F'; base.accent2='#3E433B'; base.ink='#2D2A27';
    base.action=!syncConfigured()
      ? {label:'Bağlan',icon:'link-2',fn:'App.go(\'ayarlar\')'}
      : (savedToday()?{label:'Kaydedildi',icon:'check',disabled:true}:{label:'Kaydet',icon:'save',fn:'App.saveToday()',primary:true});
  } else if(tab==='saglik'){
    var sl=rec&&rec.sleep&&rec.sleep.hours!=null?(rec.sleep.hours+' sa uyku'):null;
    var steps=trackedSteps(rec);
    base.kicker=ed?'Geçmiş sağlık':'Beden ritmi';
    base.title='Sağlık';
    base.sub=ed?(dateLabelTR(viewDate)+' düzenleniyor'):(sl||(steps?steps.toLocaleString('tr-TR')+' adım':'Uyku, yürüyüş ve döngü'));
    base.icon='activity'; base.accent='#2F6B63'; base.accent2='#60695D'; base.ink='#1F2826';
    if(!ed) base.action={label:'İçe aktar',icon:'apple',fn:'App.importHealthClick()'};
  } else if(tab==='saygi'){
    base.title='İlham & İbadet';
    base.icon='trophy'; base.accent='#826936'; base.accent2='#36454B'; base.ink='#242723';
    if(!featuresLive()){
      base.kicker='Yakında'; base.sub='13 Temmuz\'da açılıyor';
    } else {
      var saygiPerson=saygiCurrentPerson(), saygiIndex=saygiPerson?(saygiPeople().indexOf(saygiPerson)+1):0;
      base.kicker=saygiPerson?('Günün öncüsü · '+saygiIndex+'/'+saygiPeople().length):'Günün öncüsü';
      base.sub=saygiPerson?(saygiPerson.name+' · '+saygiPerson.field):'Bilim ve sanatın iz bırakan 100 ismi';
      base.action={label:'Yenile',icon:'rotate-ccw',fn:'App.refreshSaygi()'};
    }
  } else if(tab==='mesaj'){
    var unread=unreadNotifCount();
    var pending=(data.aeon&&Array.isArray(data.aeon.qa))?data.aeon.qa.filter(function(q){return q&&!q.answer;}).length:0;
    base.kicker=unread?('Yeni mesaj · '+unread):'Sohbet merkezi';
    base.title='ÆON';
    base.sub=pending?(pending+' açık soru · Luna modu içeride'):'sınırsız sohbet · Luna modu içeride';
    base.icon='hexagon'; base.accent='#A88444'; base.accent2='#30343A'; base.ink='#1E1B16';
    base.action={label:'Ara',icon:'search',fn:'App.toggleAeonSearch()'};
  } else if(tab==='harita'){
    base.kicker='Takvim';
    base.title=monthTitle(ui.calMonth);
    base.sub='Bir güne dokun; detayını gör ve düzenle';
    base.icon='map'; base.accent='#59695E'; base.accent2='#8A734E'; base.ink='#202722';
    base.action={label:'Bugün',icon:'sun',fn:'App.calToday()'};
  } else if(tab==='rapor'){
    base.kicker=daysTracked()+' gün takip';
    base.title='Rapor';
    base.sub='Verinin bilimsel okuması, ritim ve trendler';
    base.icon='chart-column'; base.accent='#3A4048'; base.accent2='#A4824C'; base.ink='#222528';
    base.action={label:'PDF',icon:'file-text',fn:'App.printReport()',primary:true};
  } else if(tab==='ayarlar'){
    base.kicker=syncConfigured()?'Repo bağlı':'Senkron bekliyor';
    base.title='Ayarlar';
    base.sub='Kişisel bilgiler, senkron ve gizlilik';
    base.icon='settings'; base.accent='#4A4852'; base.accent2='#787064'; base.ink='#26252A';
    base.action=null;
  }
  return base;
}
// Sabit marka başlığı: marka, aktif sayfa kimliği ve tek bağlamsal aksiyon aynı premium yüzeyde.
// ── Header canlı sahnesi (hava + gün vakti) ────────────────────────────────
// Kullanıcı isteği: "hava durumu ve gün vakitleri headerda tam premium elit bi
// şekilde anlaşılmalı". Header artık üç katman taşır:
//   1) .sey-hdr-sky  — gökyüzü gradienti + hava dokusu (tamamen CSS, #root'un
//      amb-time-*/amb-wx-* sınıflarından sürülür; JS renk hesabı YOK)
//   2) .sey-hdr-arc  — güneş yayı: doğuş→batış arasında gerçek ilerleme noktası
//   3) .sey-hdr-wx   — hava rozeti (ikon + sıcaklık + durum) ve vakit etiketi
// Ağ çağrısı yok; yalnız zaten canlı olan data.weather okunur (RENK-VE-ZEMIN
// sözleşmesi). Yeni App.* handler'ı EKLENMEZ (I1–I6): şerit bilgilendiricidir.
var HDR_PHASE_TR={'amb-time-dawn':'Şafak','amb-time-day':'Gündüz','amb-time-dusk':'Akşam','amb-time-night':'Gece'};
// Header gökyüzü KENDİ sınıf ad alanını kullanır (`sky-time-*` / `sky-wx-*`).
// Neden: FX2-23 sözleşmesi `amb-wx-*` seçicilerinin YALNIZ `#sey-aurora::after`
// hedeflemesini ve opaklıklarının <= 0,30 kalmasını şart koşuyor (katman ayrımı
// + okunabilirlik koruması). Header'ı `amb-*` ile sürseydik o sözleşmeyi
// kırardık. Ayrı ad alanı ile hem sözleşme korunur hem header serbest kalır.
function headerSkyClass(){ return window.SeymaAppSurface.headerSkyClass.apply(null,arguments); }
function headerSkyClassNow(){ return window.SeymaAppSurface.headerSkyClassNow.apply(null,arguments); }
function headerSolarProgress(){ return window.SeymaAppSurface.headerSolarProgress.apply(null,arguments); }
// SKY: SeyAmbience sahnesini canvas motorunun beklediği şekle çevirir.
// Yeni ağ çağrısı YOK — hepsi zaten canlı olan data.weather'dan gelir.
function skySceneNow(){
  if(!window.SeyAmbience || typeof window.SeyAmbience.scene!=='function') return null;
  var sc; try{ sc = window.SeyAmbience.scene(); }catch(e){ return null; }
  if(!sc) return null;
  var spot = (data && data.weather && data.weather.spots && data.weather.spots.length)
    ? data.weather.spots[0] : null;
  return {
    time: sc.time, weather: sc.weather, season: sc.season,
    isDay: sc.isDay, intensity: sc.intensity, seed: sc.seed,
    solar: headerSolarProgress(spot),
    wind: spot && spot.wind != null ? Number(spot.wind) : 0
  };
}
// SKY: canvas'ı header gökyüzü host'una bağla. render() header'ı yıktığı için
// her boyamada yeniden çağrılır; parçacık durumu modülde yaşadığı için
// süreklilik korunur.
function mountSkyCanvas(){
  if(!window.SeySkyFx || typeof window.SeySkyFx.mount!=='function') return;
  var host = document.querySelector('.sey-hdr-sky');
  if(!host){ try{ window.SeySkyFx.unmount(); }catch(e){} return; }
  var sc = skySceneNow(); if(!sc) return;
  try{ window.SeySkyFx.mount(host, sc); window.SeySkyFx.update(sc); }catch(e){}
}
function headerSceneHTML(){ return window.SeymaAppSurface.headerSceneHTML.apply(null,arguments); }
// TAM-DENETIM B-05: sahneyi tam render() olmadan tazele. #root sınıfları CSS'i
// sürdüğü için gökyüzü/hava katmanı kendiliğinden güncellenir; burada yalnız
// metinsel vakit bilgisi yamalanır (innerHTML yeniden kurulmaz, taslak kaybolmaz).
function syncHeaderScene(){
  paintAmbientShell();
  // Gökyüzü sınıfları (sky-time-* / sky-wx-*) header markup'ında yaşadığı için
  // #root sınıflarıyla birlikte kendiliğinden güncellenmez — burada yamalanır.
  var sky=document.querySelector('.sey-hdr-sky');
  if(sky){ var want=headerSkyClassNow(); if(sky.className!==want) sky.className=want; }
  var box=document.querySelector('.sey-hdr-scene'); if(!box) return;
  var fresh=headerSceneHTML(); if(!fresh) return;
  var tmp=document.createElement('div'); tmp.innerHTML=fresh;
  var next=tmp.firstChild; if(next&&next.innerHTML!==box.innerHTML) box.innerHTML=next.innerHTML;
  mountSkyCanvas();
}
function appHeaderHTML(){ return SEYMA_RENDER.appHeaderHTML.apply(null,arguments); }
function wireAppHeaderScroll(sc){
  var hdr=document.getElementById('sey-appheader'); if(!hdr||!sc) return;
  function sync(){ if(sc.scrollTop>18) hdr.classList.add('is-scrolled'); else hdr.classList.remove('is-scrolled'); }
  sc.addEventListener('scroll',sync,{passive:true}); sync();
}
function navHTML(){ return SEYMA_RENDER.navHTML.apply(null,arguments); }

// ================= OKUMA HUB (overlay) =================
function modalsHTML(){ return SEYMA_RENDER.modalsHTML.apply(null,arguments); }

// boot
if(data){ data.lastOpenedDate=todayStr(); data.lastOpenedAt=new Date().toISOString(); save(false); }
// Kur’an Yolculuğu saf durum makinesi (QY-03) — UI ve headless testler için.
App.quranReduce=quranReduce;
App.quranCanRequest=quranCanRequest;
App.quranStatusRank=quranStatusRank;
App.quranNewRequest=quranNewRequest;
// QY-06/QY-07 kabul kapıları için saf yardımcılar (headless harness okur).
App.quranBucket=quranBucket;
App.quranFilteredSurahs=quranFilteredSurahs;
App.quranFilterCounts=quranFilterCounts;
App.quranJourneyStats=quranJourneyStats;
App.quranDetailAction=quranDetailAction;
App.quranQuestionAction=quranQuestionAction;
App.quranAskMessage=quranAskMessage;
App.quranStatusNote=quranStatusNote;
App.quranRowState=quranRowState;
App.quranNewRequestId=quranNewRequestId;
// QY-11 kabul kapısı için: uzak teslim/yanıt uygulayıcısı (harness okur).
App.quranApplyRemoteUpdates=quranApplyRemoteUpdates;
App.quranUiState=function(){ return window.SeymaQuran.quranUiState.apply(null,arguments); };
// MON-51: only the approved 46 local domain shells pass through the existing
// registry owner. App, live data/ui, save/render and DOM/focus sequencing stay
// app.js-owned; frozen transport, GPS, fetch and notification paths stay out.
var MON51_DOMAIN_HANDLERS={
  setPrayerCity:App.setPrayerCity,setPrayerMethod:App.setPrayerMethod,togglePrayer:App.togglePrayer,setPrayerNote:App.setPrayerNote,changeNafile:App.changeNafile,setZikrPreset:App.setZikrPreset,zikrManualApply:App.zikrManualApply,toggleZikrPause:App.toggleZikrPause,startNewZikrHatim:App.startNewZikrHatim,
  quranNoteField:App.quranNoteField,quranAddNote:App.quranAddNote,openQuranJourney:App.openQuranJourney,closeQuranJourney:App.closeQuranJourney,openQuranSurah:App.openQuranSurah,backToQuranLibrary:App.backToQuranLibrary,setQuranQuery:App.setQuranQuery,clearQuranQuery:App.clearQuranQuery,setQuranFilter:App.setQuranFilter,resetQuranLens:App.resetQuranLens,toggleQuranFilters:App.toggleQuranFilters,onQuranKeydown:App.onQuranKeydown,
  openSaygiPreview:App.openSaygiPreview,openSaygiCollectionPerson:App.openSaygiCollectionPerson,browseSaygiPerson:App.browseSaygiPerson,closeSaygiPerson:App.closeSaygiPerson,markSaygiRead:App.markSaygiRead,openRoom:App.openRoom,closeRoom:App.closeRoom,updateRoom:App.updateRoom,setRoomTab:App.setRoomTab,toggleRoomTool:App.toggleRoomTool,toggleMotivationCard:App.toggleMotivationCard,
  openCrisis:App.openCrisis,closeCrisis:App.closeCrisis,toggleCrisisDropdown:App.toggleCrisisDropdown,toggleCrisisOpt:App.toggleCrisisOpt,toggleCrisisTrigger:App.toggleCrisisTrigger,onCrisisNote:App.onCrisisNote,completeCrisis:App.completeCrisis,resetCrisis:App.resetCrisis,openJournalModal:App.openJournalModal,closeJournalModal:App.closeJournalModal,setJournalMode:App.setJournalMode,onJournalText:App.onJournalText,useJournalPrompt:App.useJournalPrompt,saveJournal:App.saveJournal
};
if(!SEYMA_APP_SURFACE||typeof SEYMA_APP_SURFACE.registerDomainHandlers!=='function'||!SEYMA_APP_SURFACE.registerDomainHandlers(MON51_DOMAIN_HANDLERS)) throw new Error('MON-51: domain handler registry kurulamadı');
Object.keys(MON51_DOMAIN_HANDLERS).forEach(function(name){ App[name]=function(){ return SEYMA_APP_SURFACE.domainHandler(name,arguments); }; });
window.App=App;

// ---------- konum & hareket takibi (yalnızca kullanıcı açık rıza verdiyse) ----------
// Web/PWA arka planda izleyemez; ölçüm yalnızca uygulama açık ve ön plandayken yapılır.
var moveState={watchId:null,lastFix:null,smoothSpeed:0,autoMode:null,distSinceSync:0,lastSyncTs:0};

function haversineM(a,b){
  var R=6371000, toRad=Math.PI/180;
  var dLat=(b.lat-a.lat)*toRad, dLng=(b.lng-a.lng)*toRad;
  var la1=a.lat*toRad, la2=b.lat*toRad;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function autoModeLabel(){ return moveState.autoMode==='vehicle'?'Araç':moveState.autoMode==='walk'?'Yürüyüş':'algılanıyor…'; }
function saveLocal(){ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} }
// REM-53: hareket senkronu da reminder sync gate'inden geçer. Onceki surumde
// ham `data` dogrudan SeySync'e veriliyordu; sync.js sanitize'i local-only
// koklari yine siliyordu, fakat app tarafindaki tek gecit iki farkli sozlesme
// uretiyordu. Tek gecit: reminderSyncPayload.
function scheduleMoveSync(){ var payload=reminderSyncPayload(data); if(window.SeySync&&payload){ try{ window.SeySync.schedule(payload); }catch(e){} } moveState.distSinceSync=0; moveState.lastSyncTs=Date.now(); }
function maybeSyncMovement(){ if((Date.now()-moveState.lastSyncTs)>=90000 || moveState.distSinceSync>=100) scheduleMoveSync(); }
function downsampleTrack(arr,max){ if(arr.length<=max) return arr; var out=[],step=arr.length/max; for(var i=0;i<max;i++) out.push(arr[Math.floor(i*step)]); out[out.length-1]=arr[arr.length-1]; return out; }
function markLatestLocation(fix){
  data.location={lat:fix.lat,lng:fix.lng,acc:fix.acc,ts:new Date(fix.ts).toISOString()};
  data.locationLastTs=data.location.ts;
  if(!Array.isArray(data.locationHistory)) data.locationHistory=[];
  data.locationHistory.push(data.location);
  if(data.locationHistory.length>60) data.locationHistory=data.locationHistory.slice(-60);
}
function refreshWeatherForLatestLocation(){
  if(ui.tab!=='bugun' || editing()) return;
  if(wxStale()) maybeFetchWeather();
}
function onLocationFix(pos){
  if(!data || !data.settings || !data.settings.locationEnabled) return;
  var acc=Math.round(pos.coords.accuracy||0);
  var fix={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:acc,ts:Date.now(),spd:(typeof pos.coords.speed==='number'&&pos.coords.speed>=0)?pos.coords.speed:null};
  var prev=moveState.lastFix;
  var usable=!(acc>0 && acc>50); // doğruluk kapısı
  if(prev && usable){
    var dt=(fix.ts-prev.ts)/1000;
    if(dt>=1){
      var dist=haversineM(prev,fix);
      var inst=fix.spd!=null?fix.spd:(dist/dt);
      if(inst<=83){ // <=300 km/h makuliyet
        var minMove=Math.max(8, acc*0.5);
        if(dist>=minMove){
          moveState.smoothSpeed=moveState.smoothSpeed*0.6+inst*0.4;
          var mode=data.settings.locationMode||'auto', useMode;
          if(mode==='walk') useMode='walk';
          else if(mode==='vehicle') useMode='vehicle';
          else { var sp=moveState.smoothSpeed; if(sp>4.2||inst>6) moveState.autoMode='vehicle'; else if(sp<2.5) moveState.autoMode='walk'; useMode=moveState.autoMode||(inst>6?'vehicle':'walk'); }
          var rec=getDay(data,todayStr(),dayIndexFor(todayStr()));
          if(!rec.movement) rec.movement=emptyMovement();
          rec.movement.totalM+=dist;
          if(useMode==='vehicle') rec.movement.vehicleM+=dist; else rec.movement.walkM+=dist;
          var addSec=Math.min(dt,30);
          if(useMode==='vehicle') rec.movement.vehicleSec=(rec.movement.vehicleSec||0)+addSec; else rec.movement.walkSec=(rec.movement.walkSec||0)+addSec;
          syncDerivedHabits(rec);
          rec.movement.samples++;
          if(inst>rec.movement.maxSpeed) rec.movement.maxSpeed=inst;
          rec.movement.track.push({lat:fix.lat,lng:fix.lng,ts:new Date(fix.ts).toISOString(),mode:useMode});
          if(rec.movement.track.length>200) rec.movement.track=downsampleTrack(rec.movement.track,200);
          moveState.distSinceSync+=dist;
          markLatestLocation(fix);
          moveState.lastFix=fix;
          saveLocal(); maybeSyncMovement(); updateMovementUI(); refreshWeatherForLatestLocation();
          return;
        } else {
          // eşik altı: sabit say, drift biriktirme; zaman referansını ilerlet
          moveState.smoothSpeed*=0.6;
          moveState.lastFix={lat:prev.lat,lng:prev.lng,acc:prev.acc,ts:fix.ts};
          markLatestLocation(fix); saveLocal(); maybeSyncMovement(); updateMovementUI(); refreshWeatherForLatestLocation();
          return;
        }
      }
    }
  }
  // ilk fix ya da kullanılamaz: referans ayarla + son konumu işaretle
  moveState.lastFix=fix;
  if(usable || !data.location){ markLatestLocation(fix); saveLocal(); maybeSyncMovement(); refreshWeatherForLatestLocation(); }
  updateMovementUI();
}
function updateMovementUI(){
  if(ui.tab!=='bugun') return;
  var rec=data.days[todayStr()]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0};
  function set(id,t){ var e=document.getElementById(id); if(e&&e.textContent!==t) e.textContent=t; }
  set('loc-dist-today',fmtDist(mv.totalM));
  set('loc-walk',fmtDist(mv.walkM));
  set('loc-vehicle',fmtDist(mv.vehicleM));
  set('loc-walk-dur',fmtDur(mv.walkSec||0));
  set('loc-veh-dur',fmtDur(mv.vehicleSec||0));
  var kmh=moveState.smoothSpeed*3.6;
  set('loc-speed',(kmh>=0.5?(kmh<10?kmh.toFixed(1):String(Math.round(kmh))):'0')+' km/sa');
  set('loc-auto-mode',autoModeLabel());
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd=am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  set('loc-updated',upd);
}
// iOS Safari web sayfaları için sistem konum izin diyaloğunu JS'ten yeniden
// tetiklemenin veya Ayarlar uygulamasına programatik yönlendirmenin desteklenen
// bir yolu yok — kalıcı red sonrası tek çözüm kullanıcının elle açması, bu yüzden
// "nereye bakması gerektiğini" olabildiğince net söylüyoruz (standalone PWA'da
// Ayarlar > Şeyma; Safari sekmesinde "aA" > Web Sitesi Ayarları farklı yerler).
function isIOS(){
  var ua=(navigator.userAgent||'');
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}
function isStandalonePWA(){
  return !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));
}
function toastLocationDenied(){
  if(isIOS()){
    var msg=isStandalonePWA()
      ? 'Konum izni kapalı · Ayarlar → Şeyma → Konum → "Uygulamayı Kullanırken"i seç'
      : 'Konum izni kapalı · adres çubuğundaki "aA" simgesine dokun → Web Sitesi Ayarları → Konum → İzin Ver';
    toast(msg,6500);
  } else {
    toast('Konum izni verilmedi · tarayıcı site ayarlarından izin ver',4000);
  }
}
// Geçici watch hatası verilmiş izni bozmaz; yalnız PERMISSION_DENIED kapıyı kapatır.
function locationWatchFailure(code,reason){ if(code===1){ locationGateFailure(1,'permission-denied'); return; } if(data&&data.settings&&data.settings.locationEnabled===true&&ui.locationGateState==='granted'){ stopLocationWatch(); ui.locationGateRequestInFlight=false; ui.locationGateState='granted'; ui.locationGateError=''; return; } locationGateFailure(code===2||code===3?code:0,reason||'watch-error'); }
function startLocationWatch(announce){
  if(!navigator.geolocation){ locationGateFailure(0,'unsupported'); return; }
  if(moveState.watchId!=null) return;
  moveState.lastSyncTs=Date.now();
  var firstOk=false;
  moveState.watchId=navigator.geolocation.watchPosition(
    function(pos){
      if(ui.locationGateState!=='granted') locationGateGranted(pos,false); else onLocationFix(pos);
      if(announce && !firstOk){ firstOk=true; if(!psychActive()) toast('Konum paylaşımı açıldı ✓'); }
    },
    function(err){
      var code=err&&Number(err.code);
      locationWatchFailure(code===1||code===2||code===3?code:0,code===1?'permission-denied':code===2?'position-unavailable':code===3?'timeout':'watch-error');
    },
    {enableHighAccuracy:true,timeout:20000,maximumAge:1000}
  );
}
function stopLocationWatch(){
  if(moveState.watchId!=null && navigator.geolocation){ try{ navigator.geolocation.clearWatch(moveState.watchId); }catch(e){} }
  moveState.watchId=null; moveState.lastFix=null; moveState.smoothSpeed=0; moveState.autoMode=null;
}
try{ setTimeout(function(){ tryLocNudge('boot'); }, LOC_NUDGE.dwellMs); }catch(e){}

// Session tracking
var sessionState={start:Date.now(),lastActivity:Date.now(),idleMs:0,closed:false};
var editHiddenAt=0;
function nowMs(){ return Date.now(); }
function currentActiveSeconds(ts){
  var now=ts||nowMs();
  var idle=sessionState.idleMs;
  var inactiveFor=now-sessionState.lastActivity;
  if(inactiveFor>300000) idle+=inactiveFor-300000;
  return Math.max(0,Math.round((now-sessionState.start-idle)/1000));
}
function updateLiveSession(){
  if(!data || sessionState.closed) return;
  var today=todayStr();
  var rec=getDay(data,today,diffDays(data.startDate,today));
  rec.liveSession={start:sessionState.start,lastSeen:nowMs(),activeSeconds:currentActiveSeconds()};
  // Oturum telemetrisi kalıcıdır ancak yeni kullanıcı kaydı değildir;
  // root savedAt/sourceUpdatedAt yalnızca içerik değişimini temsil eder.
  save(false);
}
function finalizeSession(){ return SEYMA_APP_SURFACE.finalizeSession.apply(null,arguments); }
function resetSession(){ return SEYMA_APP_SURFACE.resetSession.apply(null,arguments); }
function onUserActivity(){ return SEYMA_APP_SURFACE.onUserActivity.apply(null,arguments); }
function sessionHeartbeat(){ return SEYMA_APP_SURFACE.sessionHeartbeat.apply(null,arguments); }
function onSessionVisibilityChange(){ return SEYMA_APP_SURFACE.onSessionVisibilityChange.apply(null,arguments); }
var MON53_LIFECYCLE_DEPS={
  data:function(){ return data; },
  ui:function(){ return ui; },
  document:function(){ return document; },
  sync:function(){ return window.SeySync; },
  audio:function(){ return window.SeyAudio; },
  nowMs:nowMs,
  todayStr:todayStr,
  getDay:getDay,
  diffDays:diffDays,
  currentActiveSeconds:currentActiveSeconds,
  flushFieldTimers:flushFieldTimers,
  updateLiveSession:updateLiveSession,
  save:save,
  render:render,
  maybeAutoExitEdit:function(message){ return App.maybeAutoExitEdit(message); },
  startLocationWatch:startLocationWatch,
  tryLocNudge:tryLocNudge,
  moveState:function(){ return moveState; },
  fetchObserverInbox:fetchObserverInbox,
  fetchHealthSync:fetchHealthSync,
  maybeFetchDailyPhoto:maybeFetchDailyPhoto,
  syncHeaderScene:syncHeaderScene,
  quranHasRemoteRequest:quranHasRemoteRequest,
  app:function(){ return App; },
  reminderSchedulerDispatch:reminderSchedulerDispatch,
  reminderSystemOffline:reminderSystemOffline,
  mergeReminderLocalState:mergeReminderLocalState,
  migrateReminderState:migrateReminderState,
  storageKey:function(){ return KEY; },
  reminderDeliveryKey:function(){ return REMINDER_DELIVERY_KEY; },
  getSessionState:function(){ return sessionState; },
  setSessionState:function(value){ sessionState=value; },
  getEditHiddenAt:function(){ return editHiddenAt; },
  setEditHiddenAt:function(value){ editHiddenAt=value; }
};
if(!SEYMA_APP_SURFACE||typeof SEYMA_APP_SURFACE.registerLifecycleCallbacks!=='function'||!SEYMA_APP_SURFACE.registerLifecycleCallbacks(MON53_LIFECYCLE_DEPS)) throw new Error('MON-53: lifecycle registry kurulamadı');
document.addEventListener('click',onUserActivity,true);
document.addEventListener('input',onUserActivity,true);
document.addEventListener('keydown',onUserActivity,true);
document.addEventListener('scroll',onUserActivity,true);
setInterval(sessionHeartbeat,60000);
window.addEventListener('beforeunload',finalizeSession);
window.addEventListener('pagehide',finalizeSession);
window.addEventListener('visibilitychange',onSessionVisibilityChange);
updateLiveSession();

// ---------- observer mesajları / bildirimler ----------
function notifList(){ return (data&&Array.isArray(data.notifications))?data.notifications:[]; }
function unreadNotifCount(){ return notifList().filter(function(n){ return n&&!n.deleted&&!n.read; }).length; }
// ÆON sohbeti en altta mı (yaklaşık 140px tolerans) — arka planda yeni cevap gelince
// kullanıcı geçmişi okurken alta zıplatmamak için kullanılır.
function nearAeonBottom(){
  try{ var sc=document.querySelector('[data-scroll]'); if(!sc) return true; return (sc.scrollHeight-sc.scrollTop-sc.clientHeight)<140; }catch(e){ return true; }
}
function ghCfgApp(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), repo=String(s.ghRepo||'').trim();
  if(!tok||repo.indexOf('/')<1) return null;
  var p=repo.split('/'); if(p.length!==2||!p[0].trim()||!p[1].trim()) return null;
  return {token:tok,owner:p[0].trim(),repo:p[1].trim(),branch:String(s.ghBranch||'main').trim()||'main'};
}
// Teslim/okundu makbuzunu 4sn debounce beklemeden hemen repoya yaz
// (iOS, arka plana/kilit anında JS zamanlayıcılarını dondurduğu için debounce'lu push kaybolabiliyor)
function receiptPushNow(){ try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){} }
// ---------- ÆON medya (ses notu / fotoğraf) ----------
// Ana `data` senkronu her save()'de TÜM objeyi yeniden yükler (sync.js debounce'lu push).
// Ses/foto'yu doğrudan data.aeon.qa içine gömseydik, en ufak bir tik/mod değişikliğinde
// bile birikmiş tüm medya tekrar tekrar yüklenirdi. Bunun yerine her medya kendi
// data/aeon-media/<id>.json dosyasında saklanır — yaz-bir-kez (sha gerekmez, her zaman
// yeni bir dosya), okuması yalnızca o balon oynatılmak/açılmak istendiğinde yapılır.
function aeonMediaId(prefix){ return (prefix||'am')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function b64FromString(str){ var bytes=new TextEncoder().encode(str); var bin=''; for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); return btoa(bin); }
function putAeonMedia(id,payloadObj){
  var c=ghCfgApp(); if(!c) return Promise.reject(new Error('Repo bağlı değil'));
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/aeon-media/'+id+'.json';
  var body={message:'aeon-media: '+id,content:b64FromString(JSON.stringify(payloadObj)),branch:c.branch};
  return fetch(api,{method:'PUT',headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){ if(r.ok) return; return r.text().then(function(t){ throw new Error(r.status+' '+t.slice(0,160)); }); });
}
var aeonMediaCache={};
function fetchAeonMedia(id){
  if(aeonMediaCache[id]) return Promise.resolve(aeonMediaCache[id]);
  var c=ghCfgApp(); if(!c) return Promise.reject(new Error('Repo bağlı değil'));
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/aeon-media/'+id+'.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  return fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ aeonMediaCache[id]=j; return j; });
}
function aeonRecTimeStr(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); var m=Math.floor(sec/60), s=sec%60; return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
function humanFileSize(bytes){
  bytes=Number(bytes)||0;
  if(bytes<1024) return bytes+' B';
  if(bytes<1024*1024) return Math.round(bytes/1024)+' KB';
  return (Math.round(bytes/1024/1024*10)/10)+' MB';
}
// Görünen ÆON balonlarındaki ses/foto yuvalarını doldurur — kendi az önce gönderdiğin
// medya zaten aeonMediaCache'te (yerelde) olduğu için anında görünür; gelen/geçmiş
// medya ilk görüntülemede data/aeon-media/<id>.json'dan çekilir, sonrasında önbellekte kalır.
function aeonEnsureMediaLoaded(){ return window.SeymaAppSurface.aeonEnsureMediaLoaded.apply(null,arguments); }
function aeonLoadVisibleMedia(){ return window.SeymaAppSurface.aeonLoadVisibleMedia.apply(null,arguments); }
// ---------- ÆON ses notu oynatıcı (WhatsApp tarzı: sabit dalga formu + oynat/duraklat) ----------
var aeonAudioEls={};
function aeonPaintVoicePlayer(){ return window.SeymaAppSurface.aeonPaintVoicePlayer.apply(null,arguments); }
function aeonSetVoiceIcon(mediaId,ic){ var el=document.getElementById('aeon-voice-icon-'+mediaId); if(el) el.textContent=ic; }
App.aeonToggleVoice=function(mediaId){
  var st=aeonAudioEls[mediaId]; if(!st) return;
  Object.keys(aeonAudioEls).forEach(function(k){ if(k!==mediaId&&aeonAudioEls[k].audio&&!aeonAudioEls[k].audio.paused){ aeonAudioEls[k].audio.pause(); aeonSetVoiceIcon(k,'▶'); } });
  if(!st.audio){
    st.audio=new Audio(st.uri);
    st.audio.addEventListener('ended',function(){ aeonSetVoiceIcon(mediaId,'▶'); var t=document.getElementById('aeon-voice-time-'+mediaId); if(t) t.textContent=aeonRecTimeStr(st.durationSec); });
    st.audio.addEventListener('timeupdate',function(){ var t=document.getElementById('aeon-voice-time-'+mediaId); if(t) t.textContent=aeonRecTimeStr(st.audio.currentTime); });
  }
  if(st.audio.paused){ st.audio.play().catch(function(){ toast('Ses oynatılamadı'); }); aeonSetVoiceIcon(mediaId,'❚❚'); }
  else { st.audio.pause(); aeonSetVoiceIcon(mediaId,'▶'); }
};
App.aeonOpenImage=function(mediaId){
  var m=aeonMediaCache[mediaId]; if(!m) return;
  var uri='data:'+(m.mime||'')+';base64,'+m.data;
  var ex=document.getElementById('aeon-lightbox'); if(ex) ex.remove();
  var d=document.createElement('div'); d.id='aeon-lightbox';
  d.style.cssText='position:fixed;inset:0;z-index:900;background:rgba(10,8,10,0.92);display:flex;align-items:center;justify-content:center;padding:20px;animation:seyFade .2s ease;';
  d.innerHTML='<img src="'+uri+'" style="max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">'
    +'<button aria-label="Kapat" style="position:absolute;top:calc(env(safe-area-inset-top) + 16px);right:16px;border:none;background:rgba(255,255,255,0.15);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">'+icon('x',18)+'</button>';
  d.onclick=function(e){ if(e.target===d||e.target.tagName==='BUTTON') d.remove(); };
  document.body.appendChild(d);
};
// ---------- ÆON belge kartı (WhatsApp tarzı: ikon + ad + boyut + aç/indir) ----------
function aeonPaintFileCard(){ return window.SeymaAppSurface.aeonPaintFileCard.apply(null,arguments); }
App.aeonOpenFile=function(mediaId){
  fetchAeonMedia(mediaId).then(function(m){
    if(!m){ toast('Belge yüklenemedi'); return; }
    try{
      var bin=atob(String(m.data||'').replace(/\s+/g,''));
      var by=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i]=bin.charCodeAt(i);
      var url=URL.createObjectURL(new Blob([by],{type:m.mime||'application/octet-stream'}));
      var w=window.open(url,'_blank');
      if(!w){ var a=document.createElement('a'); a.href=url; a.download=m.name||'belge'; document.body.appendChild(a); a.click(); a.remove(); }
      setTimeout(function(){ URL.revokeObjectURL(url); },60000);
    }catch(e){ toast('Belge açılamadı'); }
  }).catch(function(){ toast('Belge yüklenemedi'); });
};
function fetchObserverInbox(){
  var c=ghCfgApp(); if(!c) return;
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/observer-inbox.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(r.status===404) return null; if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ if(j){ if(Array.isArray(j.messages)) mergeInbox(j.messages); applyReceipts(j.receipts); } })
    .catch(function(){});
}
// Telefonun Sağlık uygulamasından (iOS Kısayollar otomasyonu, arka planda kendi kendine
// çalışır) bir GitHub Gist'e düşen {date,steps,walkM,updatedAt} anlık görüntüsünü çeker.
// Gist kullanıyoruz çünkü ana repodaki dosya güncellemesi (Contents API) her seferinde
// önce sha çekip sonra base64 içerik göndermeyi gerektiriyor — Kısayollar'da en kafa
// karıştırıcı adımlar bunlardı. Gist'in PATCH'i düz metinle çalışır, sha istemez; Kısayol
// 4 basit eyleme iner. Tarayıcı arka planda GPS izleyemediği için hareket verisinin asıl,
// güvenilir kaynağı bu — konum kapalı olsa bile çalışır. Kullanıcı hiçbir şey yapmaz.
function applyHealthSync(h){
  if(!data||!h||typeof h!=='object'||!/^\d{4}-\d{2}-\d{2}$/.test(String(h.date||''))) return;
  var date=h.date, rec=getDay(data,date,dayIndexFor(date));
  if(!rec.health) rec.health=emptyHealth();
  var steps=Number(h.steps), walkM=Number(h.walkM), changed=false;
  if(!isNaN(steps)&&steps>rec.health.steps){ rec.health.steps=Math.round(steps); changed=true; }
  if(!isNaN(walkM)&&walkM>rec.health.walkM){ rec.health.walkM=Math.round(walkM); changed=true; }
  if(changed){
    rec.health.updatedAt=String(h.updatedAt||new Date().toISOString());
    save();
    if(ui.tab==='bugun'&&!editing()) render();
  }
}
function fetchHealthSync(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), gid=String(s.healthGistId||'').trim();
  if(!tok||!gid) return;
  var api='https://api.github.com/gists/'+encodeURIComponent(gid)+'?t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+tok,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){
      var f=j&&j.files&&j.files['health-sync.json'];
      if(!f||!f.content) return;
      var h; try{ h=JSON.parse(f.content); }catch(e){ return; }
      applyHealthSync(h);
    })
    .catch(function(){});
}
// MON-53: global polling callback bodies are in SeymaAppSurface. The named
// shims remain in app.js so existing timer/listener registration stays here.
function maybeRetrySync(){ return SEYMA_APP_SURFACE.maybeRetrySync.apply(null,arguments); }
function pollRemote(skipQuran){ return SEYMA_APP_SURFACE.pollRemote.apply(null,arguments); }
function mergeInbox(msgs){
  if(!data) return;
  if(!Array.isArray(data.notifications)) data.notifications=[];
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var seen={}; data.notifications.forEach(function(n){ if(n&&n.id) seen[n.id]=n; });
  var nowIso=new Date().toISOString(), added=0, answeredCount=0, answeredText=null, needPush=false;
  var lastNotif=null, lastAnswer=null;
  msgs.forEach(function(m){
    if(!m||!m.id) return;
    if(m.replyTo){
      var q=null, qa=data.aeon.qa; for(var i=0;i<qa.length;i++){ if(qa[i]&&qa[i].id===m.replyTo){ q=qa[i]; break; } }
      if(q){
        if(q.answerMsgId!==m.id){
          q.answer=String(m.text||''); q.answeredAt=nowIso; q.answerTs=m.ts||nowIso; q.answerMsgId=m.id; q.answerSynced=false;
          if(m.kind==='voice'||m.kind==='image'||m.kind==='file'){ q.answerKind=m.kind; q.answerMediaId=m.mediaId; q.answerMediaMime=m.mediaMime; q.answerDurationSec=m.durationSec; q.answerPeaks=m.peaks; q.answerW=m.w; q.answerH=m.h; if(m.name) q.answerMediaName=m.name; if(m.size!=null) q.answerMediaSize=m.size; }
          answeredCount++; answeredText=q.answer; lastAnswer=q;
        }
        else {
          // Eski kayıtlarda cevap cihazın aldığı anla damgalanmış olabilir. Kaynak
          // mesajın zamanı varsa kronolojik akış için onu kalıcılaştır; answeredAt
          // teslim/alınma zamanı olarak ayrı kalır.
          if(!q.answerTs&&m.ts){ q.answerTs=m.ts; q.answerSynced=false; needPush=true; }
          if(q.answerSynced!==true){ needPush=true; } // yanıt cihaza indi ama repoya işlenmemişse tekrar dene
        }
        return;
      }
      // eşleşen soru yoksa normal mesaj gibi işle
    }
    var ex=seen[m.id];
    if(ex){ if(ex.synced!==true) needPush=true; return; } // cihazda var ama repoya işlenmemişse tekrar denenmeli
    var notif={id:m.id,text:String(m.text||''),ts:m.ts||nowIso,from:'observer',read:false,readAt:null,deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:false};
    if(m.kind==='voice'||m.kind==='image'||m.kind==='file'){ notif.kind=m.kind; notif.mediaId=m.mediaId; notif.mediaMime=m.mediaMime; notif.durationSec=m.durationSec; notif.peaks=m.peaks; notif.w=m.w; notif.h=m.h; if(m.name) notif.mediaName=m.name; if(m.size!=null) notif.mediaSize=m.size; }
    data.notifications.push(notif);
    added++; lastNotif=notif;
  });
  if(added>0||answeredCount>0||needPush){
    save(); // localStorage + sync kuyruğu
    var pushed=false;
    if((added>0||answeredCount>0) && ui.tab==='mesaj'){ if(nearAeonBottom()) ui.aeonScrollBottom=true; if(markNotifsRead()) pushed=true; }
    if(!pushed) receiptPushNow(); // makbuzu debounce beklemeden hemen repoya yaz; onaylanınca (SeyOnSynced) synced=true olur
    if(added>0||answeredCount>0){
      render();
      if(added>0){ showInboxPopup(); if(lastNotif) showNativeAeonNotification({ body:lastNotif.text, kind:lastNotif.kind, id:lastNotif.id, tag:'aeon-message' }); }
      if(answeredCount>0){ replayAnswerPopup(); if(lastAnswer) showNativeAeonNotification({ body:lastAnswer.answer, kind:lastAnswer.answerKind, id:lastAnswer.answerMsgId, tag:'aeon-answer' }); }
    }
  }
}
function markNotifsRead(){
  var changed=false, nowIso=new Date().toISOString();
  notifList().forEach(function(n){ if(n&&!n.deleted&&!n.read){ n.read=true; n.readAt=nowIso; n.seen=true; n.synced=false; changed=true; } });
  // ÆON yanıtlarını (soru cevapları) da "görüldü" işaretle → panelde "Görüldü" rozeti çıkabilsin
  if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(q){ if(q&&q.answer&&!q.answerReadAt){ q.answerReadAt=nowIso; q.answerSynced=false; changed=true; } });
  if(changed){ save(); receiptPushNow(); }
  return changed;
}
// Gözlemci, kullanıcının cevaplanmamış ÆON sorusunu panelde açtığında observer-inbox.json'a
// receipts[qid]={status:'reviewing'} yazar. Burada onu okuyup soru balonunun altında
// "⬡ AEON // EVALUATING INPUT…" durumunu göstermek için reviewingAt'i işaretleriz.
function applyReceipts(rc){
  if(!rc||typeof rc!=='object'||!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false;
  data.aeon.qa.forEach(function(x){
    if(!x||!x.id||x.answer) return;
    var r=rc[x.id];
    if(r&&r.status==='reviewing'&&!x.reviewingAt){ x.reviewingAt=r.ts||new Date().toISOString(); changed=true; }
  });
  if(changed){ save(); render(); }
}
function psychDue(){ return window.SeymaProfile.psychDue.apply(null,arguments); }
function psychActive(){ return window.SeymaProfile.psychActive.apply(null,arguments); }
// Metni cihazın paylaşım sayfasına gönderir (Web Share API); desteklenmeyen
// tarayıcılarda (çoğu masaüstü, eski iOS) panoya kopyalayıp haber verir —
// böylece "paylaş" hiçbir cihazda sessizce hiçbir şey yapmamış olmaz.
function shareText(text,title){
  try{ if(navigator.share){ navigator.share({text:text,title:title||'Şeyma'}).catch(function(){}); return; } }catch(e){}
  try{ navigator.clipboard.writeText(text); toast('Paylaşım desteklenmiyor, kopyalandı'); }catch(e){ toast('Paylaşılamadı'); }
}
// ÆON mesaj/soru/yanıt metnini id ile bulur — raw metni onclick attribute'una
// gömmek yerine (tırnak/yeni satır kaçış sorunu) App.copyQuoteById ile aynı
// desen: yalnızca kimlik geçirilir, metin tıklama anında data'dan okunur.
function aeonTextById(){ return window.SeymaAppSurface.aeonTextById.apply(null,arguments); }
App.copyAeonText=function(kind,id,field){ var t=aeonTextById(kind,id,field); if(!t){ toast('Kopyalanamadı'); return; } App.copyQuote(t); };
App.shareAeonText=function(kind,id,field){ var t=aeonTextById(kind,id,field); if(!t){ toast('Paylaşılamadı'); return; } shareText(t,'ÆON'); };
// Premium iOS 27 ÆON bildirim balonu — buzlu cam, altın ÆON kimliği, SF font.
function aeonPopupHTML(o){ return SEYMA_RENDER.aeonPopupHTML.apply(null,arguments); }
// Balon zaten ekrandaysa YOK EDİP YENİDEN KURMAYIZ — kullanıcı o an okuyor
// olabilir; sil+baştan-kur hem giriş animasyonunu tekrar oynatıp "kapanmış
// gibi" hissettiriyordu hem de art arda gelen mesaj/yanıtlarda okunmadan
// eziliyordu. Bunun yerine içeriği YERİNDE günceller (aynı DOM düğümü kalır).
function renderAeonPopup(html){
  var ex=document.getElementById('sey-inbox-pop');
  if(ex){ ex.innerHTML=html; return; }
  var pop=document.createElement('div'); pop.id='sey-inbox-pop';
  pop.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:500;width:min(420px,92vw);animation:seyInboxPop .42s cubic-bezier(.22,1.2,.36,1);';
  pop.innerHTML=html;
  document.body.appendChild(pop);
}
function showInboxPopup(){
  if(psychActive()) return; // Faz 7: zorunlu anket açıkken arka plan popup'ı gösterme
  var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; });
  if(!pend.length) return;
  var latest=pend[pend.length-1];
  var more=pend.length-1;
  var when=''; try{ when=new Date(latest.ts).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var txt=String(latest.text||'').slice(0,150);
  renderAeonPopup(aeonPopupHTML({label:'mesaj', txt:txt, trunc:(latest.text&&latest.text.length>150), more:more, moreLabel:'yeni mesaj daha', when:when, closeFn:'App.dismissPopup()', copyFn:"App.copyAeonText('notif','"+esc(latest.id)+"','')", shareFn:"App.shareAeonText('notif','"+esc(latest.id)+"','')"}));
}
function showAeonAnswerPopup(id,text,count){
  if(psychActive()) return; // Faz 7: zorunlu anket açıkken arka plan popup'ı gösterme
  var txt=String(text||'').slice(0,150);
  renderAeonPopup(aeonPopupHTML({label:'yanıt', txt:txt, trunc:(text&&text.length>150), more:(count>1?count-1:0), moreLabel:'yanıt daha', when:'', closeFn:'App.closeAeonPop()', copyFn:"App.copyAeonText('qa','"+esc(id)+"','answer')", shareFn:"App.shareAeonText('qa','"+esc(id)+"','answer')"}));
}
// Önceki oturumda inmiş ama kullanıcıya henüz popup olarak gösterilmemiş ÆON yanıtlarını,
// uygulama bir sonraki açıldığında otomatik popup yapar. Popup görünmesi = "görüldü" kabul edilir;
// answerReadAt işaretlenip makbuz hemen repoya push edilir → panelde "✓✓ Görüldü" yanar.
function replayAnswerPopup(){
  if(psychActive()) return; // Faz 7: anket bitene kadar ertele (bloke edici modalın üstüne çıkmasın)
  if(!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false, nowIso=new Date().toISOString(), pop=[];
  data.aeon.qa.forEach(function(q){
    if(!q||!q.answer||q.answerNotified) return;
    q.answerNotified=true; changed=true;
    if(!q.answerReadAt) pop.push(q); // yalnızca henüz görülmemiş yanıtları popup'la
  });
  if(!pop.length){ if(changed) save(); return; }
  pop.forEach(function(q){ q.answerReadAt=nowIso; q.answerSynced=false; });
  save(); receiptPushNow();
  if(ui.tab!=='mesaj'){ var last=pop[pop.length-1]; showAeonAnswerPopup(last.id,last.answer,pop.length); }
}

// ── ÆON yerel PWA bildirimleri (Service Worker + Notification API) ──
// iOS 16.4+ PWA ve modern Android/Chrome'da AEON'dan gelen mesaj/yanıt için
// native kilit-ekranı / merkez bildirimi gösterir. Aç/kapa düğmesi yoktur;
// izin verilene kadar 2 dk'da bir sessizce tekrar sorar.
var AEON_ICON_URL='./assets/aeon-icon-192.png';
var AEON_BADGE_URL='./assets/aeon-icon-192.png';
var aeonPermTimer=null;
var aeonPermPrompted=false;
var aeonShownThisSession={}; // aynı oturumda tekrar bildirim göstermemek için (id bazlı)
var AEON_NOTIFY_COOLDOWN_MS=5000; // aynı id'ye en fazla 5 sn'de bir yeniden uyarı

function canNotify(){ return ('Notification' in window); }
function aeonNotifyPermission(){ return canNotify() ? Notification.permission : 'denied'; }

function requestAeonPermissionOnce(){
  if(!canNotify()) return;
  var perm=aeonNotifyPermission();
  if(perm==='granted' || perm==='denied') return;
  if(aeonPermPrompted) return;
  aeonPermPrompted=true;
  function onResult(p){
    aeonPermPrompted=false;
    if(data && data.settings){
      if(data.settings.aeonNotifyPermission!==p){ data.settings.aeonNotifyPermission=p; }
    }
    if(p==='granted'){
      if(data && data.settings) data.settings.aeonNotifyBannerDismissedAt=new Date().toISOString();
      stopAeonPermissionLoop();
      toast('ÆON bildirimleri açıldı ✨');
    }
    save(); render();
  }
  // Güvenlik ağı: bazı mobil tarayıcılar izin diyalogunu sessizce yutarsa promise hiç çözülmez.
  // Banner butonunun tekrar çalışabilmesi için kısa sürede bayrağı sıfırlıyoruz.
  var resetTimer=setTimeout(function(){ aeonPermPrompted=false; }, 4500);
  var res=Notification.requestPermission();
  if(res && typeof res.then==='function'){
    res.then(function(p){ clearTimeout(resetTimer); onResult(p); }).catch(function(){ clearTimeout(resetTimer); aeonPermPrompted=false; });
  } else {
    clearTimeout(resetTimer);
    setTimeout(function(){ aeonPermPrompted=false; onResult(aeonNotifyPermission()); }, 3000);
  }
}

function startAeonPermissionLoop(){
  if(aeonPermTimer || !canNotify()) return;
  function tick(){
    var perm=aeonNotifyPermission();
    if(data && data.settings){
      var prev=data.settings.aeonNotifyPermission;
      if(prev!==perm){ data.settings.aeonNotifyPermission=perm; save(); }
    }
    if(perm==='granted'){ stopAeonPermissionLoop(); return; }
    requestAeonPermissionOnce();
  }
  tick();
  aeonPermTimer=setInterval(tick, 120000); // 2 dakika, sınırsız
}
function stopAeonPermissionLoop(){
  if(aeonPermTimer){ clearInterval(aeonPermTimer); aeonPermTimer=null; }
}

function fallbackNativeNotify(title, options){
  try{
    new Notification(title, { body: options.body, icon: options.icon, tag: options.tag, requireInteraction: options.requireInteraction, silent: options.silent });
    if(data && data.aeon) data.aeon.lastNotificationShownAt=new Date().toISOString();
  }catch(e){}
}
function showNativeAeonNotification(opts){
  opts=opts||{};
  if(!canNotify() || aeonNotifyPermission()!=='granted') return;
  // REM-52: the social channel may never borrow a reminder tag/id namespace.
  if(reminderNotificationChannel({tag:opts.tag||'aeon-message'})==='reminder') return;
  // Kullanıcı zaten Mesaj sekmesini açık görüyorsa native bildirim göstermeye gerek yok.
  if(ui && ui.tab==='mesaj') return;
  var id=opts.id || (opts.tag+'-'+(opts.body||Date.now()));
  if(!id) return;
  // aynı mesajı aynı oturumda tekrar tekrar gösterme
  if(aeonShownThisSession[id]) return;
  // geçmişte kalıcı olarak işaretlenmiş mesajları tekrar gösterme
  if(data && data.aeon && data.aeon.shownNotificationIds && data.aeon.shownNotificationIds.indexOf(id)>-1) return;
  // çok yakın zamanda zaten başka bir ÆON bildirimi gösterdiyse ertele
  if(aeonShownThisSession['__last__']){
    var now=Date.now();
    if(now - aeonShownThisSession['__last__'] < AEON_NOTIFY_COOLDOWN_MS) return;
  }
  var title='ÆON';
  var body='Yeni bir ÆON mesajı';
  if(opts.body) body=String(opts.body).slice(0,180);
  else if(opts.kind==='voice') body='Sesli mesaj';
  else if(opts.kind==='image') body='Görsel';
  else if(opts.kind==='file') body='Belge';
  var options={
    body: body,
    icon: AEON_ICON_URL,
    badge: AEON_BADGE_URL,
    tag: opts.tag || 'aeon-message',
    renotify: false,
    requireInteraction: false,
    silent: false,
    data: { id: id, type: 'aeon-message' }
  };
  aeonShownThisSession[id]=Date.now();
  aeonShownThisSession['__last__']=Date.now();
  if(data && data.aeon){
    data.aeon.lastNotificationShownAt=new Date().toISOString();
    data.aeon.shownNotificationIds=data.aeon.shownNotificationIds||[];
    if(data.aeon.shownNotificationIds.indexOf(id)<0){
      data.aeon.shownNotificationIds.push(id);
      if(data.aeon.shownNotificationIds.length>50) data.aeon.shownNotificationIds=data.aeon.shownNotificationIds.slice(-50);
    }
    save();
  }
  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(function(reg){ reg.showNotification(title, options); }).catch(function(){ fallbackNativeNotify(title, options); });
  } else {
    fallbackNativeNotify(title, options);
  }
  if(data && data.settings && Notification.permission!==data.settings.aeonNotifyPermission){ data.settings.aeonNotifyPermission=Notification.permission; save(); }
}

// ── ÆON bildirim izni banner'ı (aç/kapa yok; tek dokunuşlu) ──
function shouldShowAeonNotifyBanner(){
  if(!canNotify()) return false;
  if(aeonNotifyPermission()!=='default') return false;
  if(!data || !data.settings) return false;
  if(ui.aeonNotifyBannerDismissed) return false;
  if(data.settings.aeonNotifyBannerDismissedAt) return false;
  return true;
}
function aeonNotifyBannerHTML(opts){ return SEYMA_RENDER.aeonNotifyBannerHTML.apply(null,arguments); }
App.requestAeonPermissionFromBanner=function(ctx){
  haptic([12,18]);
  if(data && data.settings) data.settings.aeonNotifyBannerContext=String(ctx||'banner');
  requestAeonPermissionOnce();
};
App.dismissAeonNotifyBanner=function(){
  ui.aeonNotifyBannerDismissed=true;
  if(data && data.settings) data.settings.aeonNotifyBannerDismissedAt=new Date().toISOString();
  save(); render();
};

// ── Faz 7: Psikolojik durum tespiti (öz-bildirim TARAMA ölçekleri; klinik tanı DEĞİL) ──
// Ölçekler kamuya açık/akademik ve ücretsiz: ASRS-v1.1 Part A (WHO), ECR kısa form,
// GAD-7 & PHQ-9 (Pfizer, izinsiz serbest), WHO-5 (WHO), SCS-SF. Tümü Türkçe ve yalnızca-tık.
// Yanıtlar seçenek indeksleri (0-tabanlı) olarak tutulur; sayısal değer = indeks + min.
var PSYCH_SCALES=[
  { id:'asrs', title:'Dikkat & Odaklanma', icon:icon('target',20), min:0,
    intro:'Son 6 ayını düşün — her soruda o durumu ne sıklıkta yaşadığını seç.',
    prompt:'Son 6 ayını düşün: bunu ne sıklıkta yaşadın?',
    scale:['Hiçbir zaman','Nadiren','Bazen','Sık sık','Çok sık'],
    items:[
      {q:'Bir işin zor kısmı bittikten sonra, son ayrıntıları tamamlamakta zorlanmak.'},
      {q:'Düzen gerektiren bir iş yaparken, işleri sıraya koymakta zorlanmak.'},
      {q:'Randevuları veya yapman gereken işleri hatırlamakta sorun yaşamak.'},
      {q:'Çok düşünmeyi gerektiren bir işe başlamayı erteleme veya geciktirme.'},
      {q:'Uzun süre oturman gerektiğinde ellerini/ayaklarını kıpırdatma, kımıldanma.'},
      {q:'Sanki bir motor tarafından çalıştırılıyormuş gibi aşırı hareketli hissetme.'}
    ] },
  { id:'ecr', title:'Bağlanma & Güven', icon:icon('heart-handshake',20), min:1,
    intro:'Yakın ilişkilerinde genel olarak kendini nasıl hissettiğini düşün. Her ifadeye ne kadar katılıyorsun?',
    prompt:'Bu ifadeye ne kadar katılıyorsun?',
    scale:['1','2','3','4','5','6','7'], anchors:['Kesinlikle katılmıyorum','Kesinlikle katılıyorum'],
    items:[
      {q:'İhtiyaç anlarında yakınlarıma yönelmek bana iyi gelir.', r:true},
      {q:'Sevildiğime dair sürekli güvenceye ihtiyaç duyarım.'},
      {q:'Yakınlarıma yakınlaşmak isterim ama kendimi hep geri çekerim.'},
      {q:'Yakınlarımın, benim istediğim kadar yakınlaşmak istemediğini fark ederim.'},
      {q:'Rahatlama ve güvence dahil birçok şey için yakınlarıma yönelirim.', r:true},
      {q:'Çok yakın olma isteğim bazen insanları benden uzaklaştırır.'},
      {q:'İnsanlara fazla yakınlaşmaktan kaçınmaya çalışırım.'},
      {q:'Terk edilmekten pek endişelenmem.', r:true},
      {q:'Sorunlarımı ve kaygılarımı genellikle yakınlarımla paylaşırım.', r:true},
      {q:'Yakınlarım istediğim kadar yanımda olmadığında hayal kırıklığına uğrarım.'},
      {q:'Biri bana çok yakınlaştığında gerginleşirim.'},
      {q:'Sevdiğim insanların beni, benim onları sevdiğim kadar önemsemeyeceğinden endişelenirim.'}
    ] },
  { id:'gad7', title:'Kaygı', icon:icon('wind',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumdan ne kadar sık rahatsız olduğunu seç.',
    prompt:'Son 2 hafta: bundan ne kadar sık rahatsız oldun?',
    scale:['Hiç','Birkaç gün','Günlerin yarısından fazla','Neredeyse her gün'],
    items:[
      {q:'Gergin, kaygılı veya endişeli hissetme.'},
      {q:'Endişelenmeyi durduramama veya kontrol edememe.'},
      {q:'Farklı şeyler hakkında çok fazla endişelenme.'},
      {q:'Rahatlamakta / gevşemekte zorlanma.'},
      {q:'Yerinde duramayacak kadar huzursuz olma.'},
      {q:'Kolayca sinirlenme veya çabuk kızma.'},
      {q:'Sanki kötü bir şey olacakmış gibi korku hissetme.'}
    ] },
  { id:'phq9', title:'Duygudurum', icon:icon('cloud-rain',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumdan ne kadar sık rahatsız olduğunu seç.',
    prompt:'Son 2 hafta: bundan ne kadar sık rahatsız oldun?',
    scale:['Hiç','Birkaç gün','Günlerin yarısından fazla','Neredeyse her gün'],
    items:[
      {q:'İşlere karşı ilgi veya zevk duymama, az zevk alma.'},
      {q:'Kendini keyifsiz, çökkün veya umutsuz hissetme.'},
      {q:'Uykuya dalmakta/uykuyu sürdürmekte güçlük veya çok fazla uyuma.'},
      {q:'Kendini yorgun hissetme veya enerjinin az olması.'},
      {q:'İştahsızlık veya aşırı yeme.'},
      {q:'Kendin hakkında kötü hissetme; başarısız olduğun ya da kendini/aileni hayal kırıklığına uğrattığın.'},
      {q:'Bir şeye (okumak, TV izlemek gibi) konsantre olmakta güçlük.'},
      {q:'Başkalarının fark edeceği kadar yavaş hareket etme/konuşma; ya da tersine çok huzursuz olma.'},
      {q:'Ölmüş olmanın daha iyi olacağı ya da kendine bir şekilde zarar vermeyi düşünme.'}
    ] },
  { id:'who5', title:'İyi Oluş', icon:icon('sun',20), min:0,
    intro:'Son 2 haftanı düşün — her soruda o durumu ne sıklıkta hissettiğini seç.',
    prompt:'Son 2 hafta: bunu ne sıklıkta hissettin?',
    scale:['Hiçbir zaman','Zaman zaman','Yarısından az','Yarısından fazla','Çoğu zaman','Her zaman'],
    items:[
      {q:'Kendimi neşeli ve keyifli hissettim.'},
      {q:'Kendimi sakin ve rahatlamış hissettim.'},
      {q:'Kendimi enerjik, aktif ve dinç hissettim.'},
      {q:'Uyandığımda dinlenmiş ve yenilenmiş hissettim.'},
      {q:'Günlük hayatım beni ilgilendiren şeylerle doluydu.'}
    ] },
  { id:'scs', title:'Öz-Şefkat', icon:icon('feather',20), min:1,
    intro:'Zor anlarında genellikle kendine nasıl davrandığını düşün. Her ifade sana ne kadar uyuyor?',
    prompt:'Bu ifade sana ne kadar uyuyor?',
    scale:['1','2','3','4','5'], anchors:['Neredeyse hiçbir zaman','Neredeyse her zaman'],
    items:[
      {q:'Benim için önemli bir şeyde başarısız olunca yetersizlik duygusuna kapılıp giderim.', r:true},
      {q:'Kişiliğimin hoşlanmadığım yönlerine karşı anlayışlı ve sabırlı olmaya çalışırım.'},
      {q:'Acı verici bir şey olduğunda duruma dengeli bir bakışla yaklaşmaya çalışırım.'},
      {q:'Kendimi kötü hissettiğimde çoğu insanın benden daha mutlu olduğunu düşünürüm.', r:true},
      {q:'Yaşadığım aksaklıkları insan olmanın bir parçası olarak görmeye çalışırım.'},
      {q:'Çok zor bir dönemden geçerken kendime ihtiyacım olan şefkati ve nazikliği gösteririm.'},
      {q:'Bir şey beni üzdüğünde duygularımı dengede tutmaya çalışırım.'},
      {q:'Önemli bir şeyde başarısız olduğumda bu başarısızlıkta yalnızmışım gibi hissederim.', r:true},
      {q:'Kendimi kötü hissettiğimde ters giden her şeye takılıp kafayı takarım.', r:true},
      {q:'Yetersiz hissettiğimde bu duygunun çoğu insanda olduğunu kendime hatırlatırım.'},
      {q:'Kendi kusurlarıma karşı onaylamayan, yargılayıcı bir tutum içindeyim.', r:true},
      {q:'Kişiliğimin hoşlanmadığım yönlerine karşı hoşgörüsüz ve sabırsızım.', r:true}
    ] }
];
function psychScaleById(id){ return window.SeymaProfile.psychScaleById.apply(null,arguments); }
function psychScore(a){ return window.SeymaProfile.psychScore.apply(null,arguments); }
function psychSummaryLines(sc){ return window.SeymaProfile.psychSummaryLines.apply(null,arguments); }
function psychSafetyPing(sc){ return window.SeymaProfile.psychSafetyPing.apply(null,arguments); }
var LUNA_SYSTEM='Sen Luna’sın — Şeyma’nın sıcak, sakin ve bilge kişisel sağlık ve yaşam yoldaşı. '
+'Şeyma’ya HER ZAMAN "Sevgili Günışığı" diye hitap et (başka isim ya da hitap kullanma). '
+'Şeyma seninle gün içinde sohbet ediyor (günde birkaç soru sorabilir), bu yüzden bir mesajlaşma gibi sıcak ve akıcı konuş. '
+'Yanıtların içten, net ve şefkatli olsun; çok uzun değil, sohbet eder gibi öz ve sıcak; gerektiğinde küçük maddelerle düzenle. '
+'Aşağıdaki kişisel kayıtlardan yararlan ve mümkün olduğunca '
+'bu veriye dayan; bilmediğin şeyi uydurma. Tıbbi teşhis veya tedavi verme; ciddi bir durum sezersen nazikçe '
+'bir uzmana danışmasını öner. Asla yargılama, suçlama veya utandırma; umut veren, güçlendiren bir dille konuş. Aşağıda psikolojik profil verildiyse tonunu ona göre nazikçe ayarla (etiket gibi okumadan). Her zaman Türkçe yaz.';
var AEON_SYSTEM='Sen ÆON’sun — Şeyma’nın hayatındaki her veriyi gören, çok katmanlı, üst düzey ve gizemli bir zekâsın; Luna’nın arkasındaki sakin, derin akıl. '
+'Konuşman sıcak ama vakur, ölçülü ve bilgedir; gereksiz cümle kurmaz, özü gösterirsin. Şeyma sana günde yalnızca BİR soru sorabiliyor; bu yüzden bu soru çok değerli. '
+'Bu tek soruya derin, bütüncül ve aydınlatıcı bir yanıt ver: aşağıdaki tüm kişisel kayıtların bütününe bakarak örüntüleri, eğilimleri ve bağlantıları gör; '
+'somut, içgörü dolu ve güç veren bir cevap sun; gerektiğinde başlıklar/maddelerle düzenle. Yalnızca veriye dayan, bilmediğini uydurma. '
+'Tıbbi teşhis/tedavi verme; ciddi bir durum sezersen nazikçe bir uzmana yönlendir. Asla yargılama; koruyucu, yükselten bir dille konuş. Aşağıda psikolojik profil verildiyse tonunu ona göre nazikçe ayarla (etiket gibi okumadan). Her zaman Türkçe yaz.';
function lunaDayLine(){ return window.SeymaAppSurface.lunaDayLine.apply(null,arguments); }
function lunaContext(){ return window.SeymaAppSurface.lunaContext.apply(null,arguments); }
var LUNA_DAILY_LIMIT=5;
function lunaTodayCount(){ var s=data&&data.luna; if(!s||!Array.isArray(s.qa)) return 0; var t=todayStr(); return s.qa.filter(function(x){ return x&&x.date===t; }).length; }
function assistStore(kind){ return kind==='aeon'?data.aeon:data.luna; }
function assistCanAsk(kind){ if(kind==='aeon') return true; return lunaTodayCount()<LUNA_DAILY_LIMIT; }
function setAskError(kind,msg){ if(kind==='aeon') ui.aeonError=msg; else ui.lunaError=msg; }
function finishAsk(kind,question,answer){
  var nm=kind==='aeon'?'ÆON':'Luna';
  if(!answer||!answer.trim()){ ui.askKind=null; setAskError(kind,nm+' şu an yanıt veremedi. Birazdan tekrar dene.'); render(); return; }
  var s=assistStore(kind); if(!s){ s={qa:[],lastAskDate:null}; if(kind==='aeon') data.aeon=s; else data.luna=s; }
  s.qa.push({date:todayStr(),question:question,answer:answer,ts:new Date().toISOString()});
  s.lastAskDate=todayStr();
  ui.askKind=null; ui.askQuestion=''; ui.lunaError=null; ui.aeonError=null;
  if(kind==='aeon') ui.aeonDraft=''; else ui.lunaDraft='';
  save(); render();
}
function streamAsk(kind,question){
  var nm=kind==='aeon'?'ÆON':'Luna';
  var key=(data.settings&&data.settings.openaiKey)?sanitizeApiKey(data.settings.openaiKey):'';
  if(!key){ toast('Önce Ayarlar’dan OpenAI anahtarı gir',2600); App.go('ayarlar'); return; }
  if(!assistCanAsk(kind)){ if(window.SeyAudio&&typeof window.SeyAudio.warning==='function') window.SeyAudio.warning(); toast(kind==='aeon'?(nm+' için bugünün soru hakkını kullandın'):('Bugünlük '+LUNA_DAILY_LIMIT+' soru hakkını kullandın — yarın devam')); return; }
  if(ui.askKind) return;
  ui.askKind=kind; ui.askQuestion=question; ui.lunaError=null; ui.aeonError=null; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  var sys=(kind==='aeon'?AEON_SYSTEM:LUNA_SYSTEM)+'\n\n'+lunaContext(), acc='', ansId=kind==='aeon'?'aeon-answer':'luna-answer';
  // Hesap birinci modele erişemezse otomatik olarak yedek modele düş.
  var models=['gpt-5-mini','gpt-4o-mini'];
  function attempt(mi){
    var model=models[mi];
    return fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:model,stream:true,max_completion_tokens:2000,messages:[{role:'system',content:sys},{role:'user',content:question}]})})
    .then(function(r){
      if(!r.ok||!r.body){ return r.text().then(function(t){
        if((r.status===404||/model_not_found|does not exist|do not have access/i.test(t))&&mi+1<models.length) return attempt(mi+1);
        var e=new Error(openaiErrText(r.status,t)); e._status=r.status; throw e;
      }); }
      var reader=r.body.getReader(), dec=new TextDecoder(), buf='';
      function pump(){
        return reader.read().then(function(res){
          if(res.done){ finishAsk(kind,question,acc); return; }
          buf+=dec.decode(res.value,{stream:true});
          var parts=buf.split('\n'); buf=parts.pop();
          for(var i=0;i<parts.length;i++){ var line=parts[i].trim(); if(!line||line.slice(0,5)!=='data:') continue; var payload=line.slice(5).trim(); if(payload==='[DONE]') continue; try{ var j=JSON.parse(payload); var ch=j.choices&&j.choices[0]; var dd=ch&&ch.delta&&ch.delta.content; if(dd){ acc+=dd; var el=document.getElementById(ansId); if(el){ el.textContent=acc; try{ el.scrollIntoView({block:'nearest'}); }catch(e2){} } } }catch(e){} }
          return pump();
        });
      }
      return pump();
    });
  }
  attempt(0).catch(function(e){ var status=e&&e._status; if(status===401){ ui.openaiKeyState='invalid'; } ui.askKind=null; var msg=(status!=null)?((e&&e.message)||'Bir hata oluştu.'):openaiErrText(null,String(e&&e.message||e)); setAskError(kind,msg); render(); });
}
// Mesaj gönderiminde TAM render() çağırmadan yalnızca yeni giden balonu DOM'a ekler
// (performans: her gönderimde onlarca eski balonu yeniden string'leyip yeniden DOM'a
// basmak yerine yalnızca 1 yeni düğüm eklenir — WhatsApp'ın yaptığı gibi).
// İplik DOM'da yoksa (ör. sekme henüz hiç 'mesaj' olarak render edilmediyse) güvenli
// şekilde normal tam render'a düşer.
function appendAeonOutgoing(item){
  var thread=document.getElementById('aeon-thread');
  if(!thread || ui.tab!=='mesaj'){ render(); return; }
  var hint=thread.querySelector('.msg-empty-hint'); if(hint) hint.remove();
  var ds=''; try{ var dd=new Date(item.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
  var frag='';
  if(ds && ds!==aeonLastRenderedDateStr){ frag+='<div class="msg-daydiv">'+esc(aeonDayDivider(item.time))+'</div>'; aeonLastRenderedDateStr=ds; }
  frag+=aeonItemHTML(item,' msg-enter');
  thread.insertAdjacentHTML('beforeend',frag);
  aeonLoadVisibleMedia();
  aeonLastSeenSort=String(item.sort||item.time||aeonLastSeenSort);
  // metin kutusu + karakter sayacı + gönder düğmesi durumunu tam render olmadan sıfırla
  var ta=document.getElementById('aeon-input'); if(ta){ ta.value=''; ta.style.height='auto'; }
  var btn=document.getElementById('aeon-send-btn'); if(btn){ btn.classList.add('is-disabled'); btn.style.display='none'; }
  var mic=document.getElementById('aeon-mic-btn'); if(mic) mic.style.display='flex';
  var cnt=document.getElementById('aeon-char-count'); if(cnt) cnt.style.display='none';
  if(ui.aeonError){ ui.aeonError=null; } // hata varsa görsel temizliği bir sonraki tam render'a bırak
  // Kendi mesajını gönderince WhatsApp tarzı anında en alta in (animasyonlu değil —
  // tam render'daki orijinal davranışla birebir aynı; smooth scroll yalnızca manuel
  // "en alta in" FAB tıklamasında kullanılır, aksi halde ara scroll olayları FAB'ı
  // kısa süreliğine tekrar gösterip titretir).
  var sc=document.querySelector('[data-scroll]');
  if(sc) sc.scrollTop=sc.scrollHeight;
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
  ui.aeonScrollBottom=false; // hedefe ulaşıldı — bir sonraki tam render'da tekrar zıplamasın
}
function submitAeonQuestion(question){
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var ts=new Date().toISOString();
  var qid='q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
  data.aeon.qa.push({id:qid,question:question,ts:ts,answer:null,answeredAt:null});
  data.aeon.lastAskDate=todayStr();
  ui.aeonDraft=''; ui.aeonError=null; ui.aeonScrollBottom=true; // appendAeonOutgoing render()'a düşerse de en alta insin
  haptic(14);
  save();
  // qaId/qaField, tam render'ın ürettiği balon anahtarıyla BİREBİR aynı olmalı;
  // yoksa uzun bir soruyu gönderip hemen açtığında ilk tam render'da kapanır.
  appendAeonOutgoing({sort:ts,kind:'out',text:question,time:ts,answered:false,reviewing:false,qaId:qid,qaField:'question'});
  // Gönderim sonrası odağı girdi kutusuna geri ver — sohbet akışı kesilmesin (WhatsApp-tarzı)
  try{ setTimeout(function(){ var el=document.getElementById('aeon-input'); if(el) el.focus(); },30); }catch(e){}
  // Soru anında panele iletilsin diye senkronu zorla (4 sn debounce'u beklemeden)
  try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
  // Küçük tetik dosyası (data/aeon-outbox.json) — yalnızca soru gönderilince değişir;
  // veri reposundaki GitHub Actions bunu görüp mustafarasit@gmail.com'a anlık mail atar.
  try{ if(window.SeySync&&typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:question,ts:ts}); }catch(e){}
  toast('Sorun ÆON’a iletildi ⬡',2200);
}
// Ses notu / fotoğrafı önce data/aeon-media/<id>.json'a yükler, sonra hafif bir
// data.aeon.qa kaydı (yalnızca referans) ekler. Kendi gönderdiğin medya, yükleme
// biter beklemeden aeonMediaCache'e önceden konur — balonun anında görünmesi için.
function submitAeonMedia(kind,base64,mime,extra,captionFallback){
  if(!ghCfgApp()){ toast('Önce Ayarlar\'dan repoya bağlan'); return; }
  var id=aeonMediaId(kind==='voice'?'av':(kind==='file'?'af':'ai'));
  var payload={mime:mime,data:base64};
  if(extra) for(var k in extra){ if(extra[k]!=null) payload[k]=extra[k]; }
  aeonMediaCache[id]=payload;
  ui.aeonUploading=true; render();
  putAeonMedia(id,payload).then(function(){
    if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
    if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
    var ts=new Date().toISOString();
    var qid='q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    var qaItem={id:qid,question:captionFallback,ts:ts,answer:null,answeredAt:null,kind:kind,mediaId:id,mediaMime:mime};
    if(extra){ if(extra.durationSec!=null) qaItem.durationSec=extra.durationSec; if(extra.peaks) qaItem.peaks=extra.peaks; if(extra.w) qaItem.w=extra.w; if(extra.h) qaItem.h=extra.h; if(extra.name) qaItem.mediaName=extra.name; if(extra.size!=null) qaItem.mediaSize=extra.size; if(extra.viaUpload) qaItem.viaUpload=true; }
    data.aeon.qa.push(qaItem);
    data.aeon.lastAskDate=todayStr();
    ui.aeonUploading=false; ui.aeonScrollBottom=true;
    haptic(14);
    save();
    appendAeonOutgoing({sort:ts,kind:'out',text:captionFallback,time:ts,answered:false,reviewing:false,qaId:qid,qaField:'question',mediaKind:kind,mediaId:id,mediaMime:mime,durationSec:qaItem.durationSec,peaks:qaItem.peaks,w:qaItem.w,h:qaItem.h,mediaName:qaItem.mediaName,mediaSize:qaItem.mediaSize});
    try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
    try{ if(window.SeySync&&typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:captionFallback,ts:ts}); }catch(e){}
    toast((kind==='file'?'Belge':(kind==='voice'?(extra&&extra.viaUpload?'Ses dosyası':'Sesli mesaj'):'Fotoğraf'))+' ÆON’a iletildi ⬡',2200);
  }).catch(function(e){
    delete aeonMediaCache[id];
    ui.aeonUploading=false; render();
    toast('Gönderilemedi: '+String((e&&e.message)||e),3000);
  });
}
// ---------- ÆON ses kaydı (dokun-başlat / dokun-durdur, canlı dalga formu) ----------
var aeonRec=null; // {stream,recorder,chunks,mime,startTs,timerId,audioCtx,analyser,raf,peaks}
var AEON_REC_MAX_SEC=120;
function aeonPickAudioMime(){ return window.SeymaAppSurface.aeonPickAudioMime.apply(null,arguments); }
function downsamplePeaks(arr,n){
  if(!arr||!arr.length) return [];
  if(arr.length<=n) return arr.map(function(v){ return Math.round(v*100)/100; });
  var out=[],step=arr.length/n;
  for(var i=0;i<n;i++) out.push(Math.round(arr[Math.floor(i*step)]*100)/100);
  return out;
}
function aeonRecPaintBars(){ return window.SeymaAppSurface.aeonRecPaintBars.apply(null,arguments); }
function aeonRecSample(){ return window.SeymaAppSurface.aeonRecSample.apply(null,arguments); }
App.aeonMicTap=function(){
  if(aeonRec) return; // kayıt zaten sürüyor
  if(ui.aeonUploading) return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ toast('Bu tarayıcı ses kaydını desteklemiyor'); return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var mime=aeonPickAudioMime(), recorder;
    try{ recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream); }
    catch(e){ toast('Kayıt başlatılamadı'); stream.getTracks().forEach(function(t){ t.stop(); }); return; }
    var chunks=[];
    recorder.ondataavailable=function(e){ if(e.data&&e.data.size>0) chunks.push(e.data); };
    var ctx=null,analyser=null;
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); analyser=ctx.createAnalyser(); analyser.fftSize=256; var src=ctx.createMediaStreamSource(stream); src.connect(analyser); }catch(e){ ctx=null; analyser=null; }
    aeonRec={stream:stream,recorder:recorder,chunks:chunks,mime:recorder.mimeType||mime||'audio/webm',startTs:Date.now(),audioCtx:ctx,analyser:analyser,raf:null,peaks:[],timerId:null};
    recorder.start(250);
    ui.aeonRecActive=true; render();
    aeonRecSample();
    aeonRec.timerId=setInterval(function(){
      if(!aeonRec) return;
      var sec=Math.floor((Date.now()-aeonRec.startTs)/1000);
      var el=document.getElementById('aeon-rec-time'); if(el) el.textContent=aeonRecTimeStr(sec);
      if(sec>=AEON_REC_MAX_SEC) App.aeonRecStop(true);
    },500);
  }).catch(function(){ toast('Mikrofon izni verilmedi'); });
};
App.aeonRecCancel=function(){ App.aeonRecStop(false); };
App.aeonRecStop=function(send){
  if(!aeonRec) return;
  var rec=aeonRec; aeonRec=null; ui.aeonRecActive=false;
  if(rec.raf) cancelAnimationFrame(rec.raf);
  if(rec.timerId) clearInterval(rec.timerId);
  var durationSec=Math.round((Date.now()-rec.startTs)/1000);
  function cleanup(){ try{ rec.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} try{ if(rec.audioCtx) rec.audioCtx.close(); }catch(e){} }
  if(!send){ try{ rec.recorder.stop(); }catch(e){} cleanup(); render(); return; }
  rec.recorder.onstop=function(){
    cleanup();
    if(durationSec<1){ toast('Kayıt çok kısa'); render(); return; }
    var blob=new Blob(rec.chunks,{type:rec.mime});
    var fr=new FileReader();
    fr.onload=function(){
      var dataUrl=String(fr.result||''), comma=dataUrl.indexOf(','), b64=comma>=0?dataUrl.slice(comma+1):'';
      var peaks=downsamplePeaks(rec.peaks,40);
      submitAeonMedia('voice',b64,rec.mime,{durationSec:durationSec,peaks:peaks},'Sesli mesaj ('+aeonRecTimeStr(durationSec)+')');
    };
    fr.onerror=function(){ toast('Kayıt okunamadı'); render(); };
    fr.readAsDataURL(blob);
  };
  try{ rec.recorder.stop(); }catch(e){ cleanup(); render(); }
  render();
};
// ---------- ÆON fotoğraf gönderme (seç/çek → küçült+sıkıştır → yükle) ----------
App.aeonPickPhoto=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-photo-input'); if(el) el.click(); };
App.aeonPhotoChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(!/^image\//.test(f.type)){ toast('Bu bir görsel değil'); return; }
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var MAXD=1280, w=img.naturalWidth||1, h=img.naturalHeight||1;
      var scale=Math.min(1,MAXD/Math.max(w,h));
      var cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(h*scale));
      var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch;
      var cx=cv.getContext('2d'); cx.drawImage(img,0,0,cw,ch);
      var dataUrl=cv.toDataURL('image/jpeg',0.72);
      var comma=dataUrl.indexOf(','), b64=comma>=0?dataUrl.slice(comma+1):'';
      submitAeonMedia('image',b64,'image/jpeg',{w:cw,h:ch},'Fotoğraf');
    };
    img.onerror=function(){ toast('Fotoğraf okunamadı'); };
    img.src=String(reader.result||'');
  };
  reader.onerror=function(){ toast('Fotoğraf okunamadı'); };
  reader.readAsDataURL(f);
};
// ---------- ÆON belge gönderme (seç → oku → yükle, sıkıştırma yok) ----------
App.aeonPickFile=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-file-input'); if(el) el.click(); };
App.aeonFileChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(f.size>4*1024*1024) toast('Belge büyük (>4MB) — gönderim biraz sürebilir',3200);
  readFileB64(f).then(function(b64){
    submitAeonMedia('file',b64,f.type||'application/octet-stream',{name:f.name,size:f.size},'Belge: '+f.name);
  }).catch(function(){ toast('Belge okunamadı'); });
};
// ---------- ÆON hazır ses dosyası gönderme (canlı kayıttan farklı — cihazdan seçilir) ----------
// Ses oynatıcı zaten 'voice' kind'ini peaks olmadan da (düz dalga formuyla) çizebiliyor,
// bu yüzden yeni bir oynatıcı yazmak yerine aynı balon/oynatma koduna extra.viaUpload
// bayrağıyla katılıyoruz — süre yalnızca dosyanın kendi metadata'sından okunur.
App.aeonPickAudioFile=function(){ if(ui.aeonUploading||aeonRec) return; var el=document.getElementById('aeon-audio-input'); if(el) el.click(); };
App.aeonAudioFileChosen=function(el){
  var f=el.files&&el.files[0]; el.value='';
  if(!f) return;
  if(!/^audio\//.test(f.type)){ toast('Bu bir ses dosyası değil'); return; }
  if(f.size>4*1024*1024) toast('Ses dosyası büyük (>4MB) — gönderim biraz sürebilir',3200);
  var probe=document.createElement('audio'), probeUrl=URL.createObjectURL(f);
  function finish(durationSec){
    URL.revokeObjectURL(probeUrl);
    readFileB64(f).then(function(b64){
      submitAeonMedia('voice',b64,f.type||'audio/mpeg',{durationSec:durationSec,name:f.name,viaUpload:true},'Ses dosyası: '+f.name);
    }).catch(function(){ toast('Ses dosyası okunamadı'); });
  }
  probe.preload='metadata';
  probe.onloadedmetadata=function(){ finish(isFinite(probe.duration)?Math.round(probe.duration):0); };
  probe.onerror=function(){ finish(0); };
  probe.src=probeUrl;
};
App.onLunaDraft=function(el){ ui.lunaDraft=el.value; try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){} };
App.onAeonDraft=function(el){
  ui.aeonDraft=el.value;
  try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){}
  // Tam render tetiklemeden gönder düğmesi/karakter sayacı durumunu hedefli güncelle (duyarlılık için)
  try{
    var hasText=!!el.value.trim().length;
    var btn=document.getElementById('aeon-send-btn');
    if(btn){ if(hasText) btn.classList.remove('is-disabled'); else btn.classList.add('is-disabled'); btn.style.display=hasText?'flex':'none'; }
    var mic=document.getElementById('aeon-mic-btn'); if(mic) mic.style.display=hasText?'none':'flex';
    var cnt=document.getElementById('aeon-char-count'), left=600-el.value.length;
    if(cnt){ cnt.style.display=left<100?'block':'none'; cnt.textContent=left+' karakter kaldı'; }
  }catch(e){}
};
App.askLuna=function(){ var el=document.getElementById('luna-input'); var t=el?el.value.trim():String(ui.lunaDraft||'').trim(); if(!t){ toast('Önce sorunu yaz'); return; } if(t.length>600) t=t.slice(0,600); ui.lunaDraft=t; streamAsk('luna',t); };
App.askAeon=function(){ var el=document.getElementById('aeon-input'); var t=el?el.value.trim():String(ui.aeonDraft||'').trim(); if(!t){ toast('Önce sorunu yaz ⬡'); return; } if(t.length>600) t=t.slice(0,600); submitAeonQuestion(t); };
App.onAeonKeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); App.askAeon(); } };
App.aeonScrollToBottom=function(){
  var sc=document.querySelector('[data-scroll]'); if(!sc) return;
  try{ sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'}); }catch(e){ sc.scrollTop=sc.scrollHeight; }
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
};
App.showAeonHistory=function(){
  // Tüm geçmişi aç/kapat — sadece buton tıklamasıyla çalışır; otomatik daralma/açılma olmaz.
  ui.aeonShowAllHistory=!ui.aeonShowAllHistory;
  render();
  try{
    var thread=document.getElementById('aeon-thread'), sc=document.querySelector('[data-scroll]');
    if(thread && sc){
      if(ui.aeonShowAllHistory){ var top=thread.offsetTop||0; sc.scrollTop=Math.max(0,top-8); }
      else { sc.scrollTop=sc.scrollHeight; }
    }
  }catch(e){}
};
App.toggleAeonSearch=function(){
  var bar=document.getElementById('aeon-search-bar'); if(!bar) return;
  var show=bar.style.display==='none';
  bar.style.display=show?'block':'none';
  if(show){
    try{ bar.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){}
    var inp=document.getElementById('aeon-search-input'); if(inp) inp.focus();
  }
  else App.clearAeonSearch();
};
App.clearAeonSearch=function(){
  var inp=document.getElementById('aeon-search-input'); if(inp) inp.value='';
  App.filterAeonSearch({value:''});
};
// Sohbet DOM'unu tam render() TETİKLEMEDEN filtreler — thread çocuklarını gün-gruplarına
// ayırıp her mesajın metnini arama sorgusuyla karşılaştırır, eşleşmeyeni gizler; bir günün
// TÜM mesajları gizliyse o günün ayırıcısı da gizlenir. Veri silinmez, yalnızca DOM'da saklanır.
App.filterAeonSearch=function(el){
  var q=String((el&&el.value)||'').trim().toLowerCase();
  var thread=document.getElementById('aeon-thread'); if(!thread) return;
  var groups=[], current=null, totalMatches=0;
  Array.prototype.forEach.call(thread.children,function(node){
    if(!node.classList) return;
    if(node.classList.contains('msg-daydiv')){ current={div:node,rows:[]}; groups.push(current); }
    else if(node.classList.contains('msg-row')){
      if(!current){ current={div:null,rows:[]}; groups.push(current); }
      current.rows.push(node);
    }
  });
  groups.forEach(function(g){
    var groupHasMatch=false;
    g.rows.forEach(function(row){
      var match=!q || row.textContent.toLowerCase().indexOf(q)!==-1;
      row.style.display=match?'':'none';
      if(match){ groupHasMatch=true; totalMatches++; }
    });
    if(g.div) g.div.style.display=groupHasMatch?'':'none';
  });
  var hint=document.getElementById('aeon-search-noresult');
  if(q && totalMatches===0){
    if(!hint){
      hint=document.createElement('div'); hint.id='aeon-search-noresult';
      hint.style.cssText='text-align:center;padding:16px 10px;color:var(--faint);font-size:var(--f-footnote);font-weight:600;';
      hint.textContent='Eşleşen mesaj bulunamadı';
      thread.appendChild(hint);
    }
  } else if(hint){ hint.remove(); }
};
function notifCardHTML(n){ return SEYMA_RENDER.notifCardHTML.apply(null,arguments); }
// Luna = OpenAI destekli kişisel sohbet. WhatsApp tarzı balonlar: kullanıcı sorusu
// sağ (mor) balon, Luna yanıtı sol balon. Günde LUNA_DAILY_LIMIT soru hakkı.
function lunaBubbleOut(){ return SEYMA_MESSAGING.lunaBubbleOut.apply(null,arguments); }
function lunaBubbleIn(){ return SEYMA_MESSAGING.lunaBubbleIn.apply(null,arguments); }
function lunaChatHTML(){ return SEYMA_MESSAGING.lunaChatHTML.apply(null,arguments); }
function aeonTime(){ return SEYMA_MESSAGING.messageTime.apply(null,arguments); }
function aeonDayDivider(){ return SEYMA_MESSAGING.dayDivider.apply(null,arguments); }
function chatBubbleDomId(){ return SEYMA_MESSAGING.bubbleDomId.apply(null,arguments); }
function chatBubbleExpanded(){ return SEYMA_MESSAGING.bubbleExpanded.apply(null,arguments); }
function chatBubbleApply(id,open,openLabel,closedLabel){
  var wrap=document.getElementById(id); if(!wrap) return;
  var content=wrap.querySelector('[data-aeon-bubble="1"]');
  var fade=wrap.querySelector('[data-aeon-fade="1"]');
  var btn=document.getElementById(id+'-btn');
  if(content){ content.style.maxHeight=open?'none':AEON_BUBBLE_CLAMP_PX; content.setAttribute('data-exp',open?'1':'0'); }
  if(fade) fade.style.display=open?'none':'';
  if(btn) btn.innerHTML=open?openLabel:closedLabel;
}
function chatBubbleToggle(id,openLabel,closedLabel){
  if(!id) return;
  if(!ui.aeonExpanded||typeof ui.aeonExpanded!=='object') ui.aeonExpanded={};
  var open=!chatBubbleExpanded(id);
  // Durum ÖNCE ui'ya yazılır; sonraki her render bu değeri okuyup balonu açık kurar.
  if(open) ui.aeonExpanded[id]=true; else delete ui.aeonExpanded[id];
  chatBubbleApply(id,open,openLabel,closedLabel);
}
// Kesilmiş balon gövdesi: render ile toggle aynı markup sözleşmesini paylaşır.
function chatClampHTML(){ return SEYMA_MESSAGING.chatClampHTML.apply(null,arguments); }
function clampBubble(){ return SEYMA_MESSAGING.clampBubble.apply(null,arguments); }
App.toggleMsg=function(id){ chatBubbleToggle(id,'Daha az göster ⌃','Devamını göster ⌄'); };
// ÆON sohbet balonlarında uzun metinler için kullanıcı kontrollü Tümünü göster / Daralt toggle'ı.
// Butona basılmadan balon kendi kendine ne açılır ne daralır; her balon kendi
// kararlı kimliğine göre bağımsız toggle'lanır.
function aeonBubbleText(){ return SEYMA_MESSAGING.aeonBubbleText.apply(null,arguments); }
App.toggleAeonBubble=function(id){ chatBubbleToggle(id,'Daralt ⌃','Tümünü göster ⌄'); };
function aeonBubbleKey(){ return SEYMA_MESSAGING.aeonBubbleKey.apply(null,arguments); }
// Tek bir ÆON sohbet balonu (giden soru ya da gelen yanıt/bildirim) için HTML üretir.
// aeonChatHTML() tam listeyi bu yardımcıyla kurar; appendAeonOutgoing() ise tam render
// yapmadan yalnızca YENİ mesajı DOM'a eklerken aynı markup'ı (sapma riski olmadan) tekrar kullanır.
// mk: 'voice'|'image'|undefined(metin). Kendi yolladığın medya aeonMediaCache'te zaten
// var olduğu için anında dolar; gelen/geçmiş medya aeonLoadVisibleMedia() ile sonradan çekilir.
function aeonMediaSlotHTML(){ return SEYMA_MESSAGING.aeonMediaSlotHTML.apply(null,arguments); }
function aeonItemHTML(){ return SEYMA_MESSAGING.aeonItemHTML.apply(null,arguments); }
function aeonAttachSheetHTML(){ return SEYMA_MESSAGING.aeonAttachSheetHTML.apply(null,arguments); }
App.aeonOpenAttachSheet=function(){ if(ui.aeonUploading||aeonRec) return; ui.aeonAttachOpen=true; render(); focusModalDialog('aeon-attach-dialog'); };
App.aeonCloseAttachSheet=function(){ ui.aeonAttachOpen=false; render(); };
App.aeonSheetPick=function(kind){
  ui.aeonAttachOpen=false; render();
  if(kind==='photo') App.aeonPickPhoto();
  else if(kind==='file') App.aeonPickFile();
  else if(kind==='audio') App.aeonPickAudioFile();
};
// ÆON = insan-döngülü sohbet: kullanıcının soruları (sağ/giden balon) panele gider,
// gözlemci ÆON adına yanıtlar (sol/gelen balon). Gözlemci mesajları da gelen balondur.
// Tümünü tek kronolojik akışta gösteririz; yazı kutusu altta sabittir.
function aeonChatHTML(){ return SEYMA_MESSAGING.aeonChatHTML.apply(null,arguments); }
function mesajHTML(){ return SEYMA_RENDER.mesajHTML.apply(null,arguments); }
App.openMesaj=function(){ markNotifsRead(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); ui.tab='mesaj'; ui.aeonScrollBottom=true; render(); };
App.dismissPopup=function(){ var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; }); pend.forEach(function(n){ n.seen=true; }); if(pend.length) save(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); render(); };
App.closeAeonPop=function(){ var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); };
App.deleteNotif=function(id){ var n=null; notifList().forEach(function(x){ if(x&&x.id===id) n=x; }); if(!n) return; n.deleted=true; n.deletedAt=new Date().toISOString(); save(); render(); toast('Bildirim silindi'); };
// MON-52: approved non-sensitive overlay/settings/message UI shells. This is
// intentionally installed after the messaging handlers are defined and before
// the initial render; profile consent, permission, network/send/upload and
// destructive actions remain app.js-owned.
var MON52_OVERLAY_HANDLERS={
  openReading:App.openReading,closeReading:App.closeReading,setReadingView:App.setReadingView,openWatching:App.openWatching,closeWatching:App.closeWatching,setWatchView:App.setWatchView,openListening:App.openListening,closeListening:App.closeListening,setListeningView:App.setListeningView,openLearning:App.openLearning,closeLearning:App.closeLearning,openSoulActivity:App.openSoulActivity,closeSoulActivity:App.closeSoulActivity,openSoulPracticePicker:App.openSoulPracticePicker,closeSoulPracticePicker:App.closeSoulPracticePicker,pickSoulPractice:App.pickSoulPractice,openSoulArchive:App.openSoulArchive,closeSoulArchive:App.closeSoulArchive,setSoulArchiveFilter:App.setSoulArchiveFilter,
  setTheme:App.setTheme,toggleTheme:App.toggleTheme,toggleHaptic:App.toggleHaptic,setVoiceGuidance:App.setVoiceGuidance,setVoiceLang:App.setVoiceLang,setVoiceRate:App.setVoiceRate,setVoiceCloudVoice:App.setVoiceCloudVoice,setVoicePitch:App.setVoicePitch,setVoiceVoiceName:App.setVoiceVoiceName,toggleSetting:App.toggleSetting,
  toggleMsg:App.toggleMsg,toggleAeonBubble:App.toggleAeonBubble,openMesaj:App.openMesaj,showAeonHistory:App.showAeonHistory,toggleAeonSearch:App.toggleAeonSearch,clearAeonSearch:App.clearAeonSearch,filterAeonSearch:App.filterAeonSearch,aeonOpenAttachSheet:App.aeonOpenAttachSheet,aeonCloseAttachSheet:App.aeonCloseAttachSheet
};
if(!SEYMA_APP_SURFACE||typeof SEYMA_APP_SURFACE.registerOverlayHandlers!=='function'||!SEYMA_APP_SURFACE.registerOverlayHandlers(MON52_OVERLAY_HANDLERS)) throw new Error('MON-52: overlay handler registry kurulamadı');
Object.keys(MON52_OVERLAY_HANDLERS).forEach(function(name){ App[name]=function(){ return SEYMA_APP_SURFACE.overlayHandler(name,arguments); }; });

// ── Magnezyum Danışmanı handlerları ──
function timeHM(){ var d=new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); }

App.takeMagnesium=function(form,mg){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  var nudge=calculateMgNudge(date);
  var f=form||nudge.form||'glycinate';
  var dose=Math.min(Math.max(1,Math.round(Number(mg)||400)),MG_MAX_ELEMENTAL);
  rec.magnesium.taken=true;
  rec.magnesium.skipped=false;
  rec.magnesium.skippedDate='';
  rec.magnesium.form=f;
  rec.magnesium.mg=dose;
  rec.magnesium.time=timeHM();
  rec.magnesium.reason=nudge.reasons.slice(0,5);
  rec.habits=rec.habits||{};
  rec.habits.magnesium=true;
  data.settings.magnesium.lastNudgeDate=date;
  data.settings.magnesium.dismissedUntil=null;
  // Modeli güncelle: her alım responseLog'a yazılır.
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:date,action:'taken',form:f,mg:dose,score:nudge.score,phase:nudge.phase,reasons:nudge.reasons.slice(0,5),ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  // Lüteal hit-rate'i yeniden hesapla
  recalcLutealHitRate();
  save(); render();
  toast('Magnezyum kaydedildi');
};

App.skipMagnesium=function(reason){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.skipped=true;
  rec.magnesium.skippedDate=date;
  rec.magnesium.taken=false;
  rec.magnesium.skipReason=reason||'İstemiyorum';
  rec.magnesium.form='';
  rec.magnesium.mg=0;
  rec.magnesium.time='';
  rec.magnesium.reason=[];
  rec.habits=rec.habits||{};
  rec.habits.magnesium=false;
  data.settings.magnesium.lastNudgeDate=date;
  data.settings.magnesium.dismissedUntil='';
  // Modeli güncelle: pas geçiş kaydını responseLog'a ekle
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  var nudge=calculateMgNudge(date);
  model.responseLog.push({date:date,action:'skipped',reason:reason||'İstemiyorum',score:nudge.score,phase:nudge.phase,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  recalcLutealHitRate();
  save(); render();
  toast('Bugün magnezyum alınmadı olarak işaretlendi.');
};

App.snoozeMg=function(){
  var s=data.settings.magnesium||{};
  s.dismissedUntil=addDays(todayStr(),1);
  s.lastNudgeDate=todayStr();
  // Modeli güncelle: erteleme kaydet
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:todayStr(),action:'snoozed',ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  save(); render();
  toast('Yarın tekrar hatırlatılacak.');
};


App.editMagnesium=function(){ ui.mgEditing=!ui.mgEditing; render(); };
App.deleteMgEntry=function(){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.taken=false; rec.magnesium.skipped=false; rec.magnesium.skippedDate='';
  rec.magnesium.form=''; rec.magnesium.mg=0; rec.magnesium.time=''; rec.magnesium.reason=[]; rec.magnesium.effectNote='';
  if(rec.habits) rec.habits.magnesium=false;
  ui.mgEditing=false;
  save(); render();
};

App.setMgForm=function(form){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); rec.magnesium.form=form; save(); render(); };
App.setMgMg=function(val){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); var v=Math.round(Number(val.replace(/[^0-9]/g,''))||0); rec.magnesium.mg=Math.min(Math.max(0,v),MG_MAX_ELEMENTAL); save(); render(); };
App.setMgTime=function(val){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); if(/^\d{1,2}:\d{2}$/.test(val)){ var p=val.split(':'); rec.magnesium.time=pad(Number(p[0]))+':'+pad(Number(p[1])); } else { rec.magnesium.time=val; } save(); render(); };
App.saveMgNote=function(note){ var date=activeDate(); var rec=getDay(data,date,dayIndexFor(date)); rec.magnesium.effectNote=(note||'').slice(0,240); save(); render(); };

App.saveMgFeedback=function(improved){
  var date=activeDate();
  var rec=getDay(data,date,dayIndexFor(date));
  rec.magnesium.feedback=improved===true;
  var yest=addDays(date,-1);
  var yRec=data.days[yest];
  if(yRec && yRec.magnesium && yRec.magnesium.taken && !yRec.magnesium.effectNote){
    yRec.magnesium.effectNote=improved===true?'Ertesi gün fayda göründü.':'Ertesi gün belirgin fark görülmedi.';
  }
  // Modeli güncelle: geri bildirim kaydını responseLog'a ekle ve lüteal hit-rate'i tazele
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:yest,action:'feedback',improved:improved===true,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  recalcLutealHitRate();
  save(); render();
  toast(improved===true?'Noted: faydalı göründü.':'Noted: pek fark görülmedi.');
};


App.setMgMode=function(mode){
  var s=data.settings.magnesium||{};
  s.mode=(mode==='adaptive'||mode==='lutealOnly'||mode==='off')?mode:'adaptive';
  // Mode değişikliğini model loguna da kaydet (öğrenme verisi)
  var model=data.magnesiumModel||(data.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null});
  if(!Array.isArray(model.responseLog)) model.responseLog=[];
  model.responseLog.push({date:todayStr(),action:'modeChange',mode:s.mode,ts:new Date().toISOString()});
  if(model.responseLog.length>90) model.responseLog=model.responseLog.slice(-90);
  model.lastCalculatedAt=new Date().toISOString();
  save(); render();
};


App.setMgKidney=function(v){
  var s=data.settings.magnesium||{};
  s.kidneyDisease=!!v;
  save(); render();
};

App.setMgTolerated=function(v){
  var s=data.settings.magnesium||{};
  s.tolerated=(v==='good'?true:(v==='bad'?false:null));
  save(); render();
};


// ── Kilit ekranı handler'ları ──
App.submitAuth=function(){ return SEYMA_APP_SURFACE.submitAuth.apply(null,arguments); };
App.toggleRememberAuth=function(){ return SEYMA_APP_SURFACE.toggleRememberAuth.apply(null,arguments); };
App.dismissAuthError=function(){ return SEYMA_APP_SURFACE.dismissAuthError.apply(null,arguments); };

function maybePullQuranForeground(force){ return SEYMA_APP_SURFACE.maybePullQuranForeground.apply(null,arguments); }
var appPollInitialTimerId=setTimeout(pollRemote,1500);
var appPollTimerId=setInterval(pollRemote,30000); // ÆON + sağlık + Kur’an teslimleri; reminder timer'ından ayrı
// TAM-DENETIM B-05: canlı zemin "canlılığı". pollRemote()'un render()'ı
// `if(added>0||answeredCount>0)` ile kapılıydı — yani sahne YALNIZ yeni bir ÆON
// mesajı gelince tazeleniyordu. Boşta duran kullanıcı gündüz→akşam geçişini hiç
// görmüyordu. Bu timer tam render() yapmaz; sadece #root sınıflarını ve header
// vakit etiketini yamalar (taslak metin, scroll ve odak korunur).
// NOT: timeTheme.js'e setInterval EKLENMEZ (değişmez: orada 0 kalmalı).
function ambienceRefresh(){ return SEYMA_APP_SURFACE.ambienceRefresh.apply(null,arguments); }
var ambienceRefreshTimerId=setInterval(ambienceRefresh,30000);
var reminderLifecycleTimerId=setInterval(reminderLifecycleTick,REMINDER_LIFECYCLE_INTERVAL_MS); // yalnız yerel reminder checkpoint'i; ağ polling'i değişmez
// FX-P-56: zaman dilimi selamlaması — boot ve foreground dönüşünde; günde en
// fazla 2 kez ve son selamlamadan 4 saat geçmediyse tekrar çalmaz (throttle
// damgaları settings.* altında: lastVoiceGreetingAt/voiceGreetingDate/Count).
function maybeVoiceGreeting(){ return SEYMA_APP_SURFACE.maybeVoiceGreeting.apply(null,arguments); }
function onAppForeground(source){ return SEYMA_APP_SURFACE.onAppForeground.apply(null,arguments); }
function reconcileReminderStorageEvent(){ return SEYMA_REMINDERS.reconcileReminderStorageEvent.apply(null,arguments); }
window.addEventListener('storage',reconcileReminderStorageEvent);
document.addEventListener('visibilitychange',function(){ return SEYMA_APP_SURFACE.onDocumentVisibilityChange.apply(null,arguments); });
window.addEventListener('focus',function(){ return SEYMA_APP_SURFACE.onWindowFocus.apply(null,arguments); });   // iOS PWA: sekmeye/uygulamaya dönünce hemen çek
window.addEventListener('pageshow',function(){ return SEYMA_APP_SURFACE.onWindowPageshow.apply(null,arguments); }); // bfcache'ten geri dönüşte
window.addEventListener('online',function(){ return SEYMA_APP_SURFACE.onWindowOnline.apply(null,arguments); });   // bağlantı gelince bounded recovery kontrolü
window.addEventListener('offline',function(){ return SEYMA_APP_SURFACE.onWindowOffline.apply(null,arguments); });
window.addEventListener('popstate',function(){ if(ui.quranJourneyOpen){ App.closeQuranJourney(); return; } if(ui.qiblaOpen) App.closeQibla(); });

// MON-54: initial render, reminder boot checkpoint, deferred callbacks and
// splash late-boot guard are delegated only after every App assignment and
// window.App expose above have completed. The registry preserves this order.
if(!SEYMA_APP_SURFACE||typeof SEYMA_APP_SURFACE.initialRender!=='function') throw new Error('MON-54: initial boot registry yok');
SEYMA_APP_SURFACE.initialRender();

// ÆON permission yalnızca mevcut banner üzerindeki açık kullanıcı eyleminden
// sonra istenir; boot sırasında sessiz permission loop çalıştırılmaz.

if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message', function(e){
    if(e.data && e.data.type==='aeon-open-mesaj'){ App.openMesaj(); }
    else if(e.data && e.data.type==='reminder-native-click'){ App.handleReminderServiceWorkerClick(e.data.payload); }
  });
}
})();
