// MON-49 · render core registry.
// Onboarding, Bugün, domain tabları ve Library/Terapi modal giriş kabukları
// burada; domain kart üreticileri, App handlers, root/app innerHTML, mutation/
// save/DOM ve modal ownership app.js'te kalır.
(function(){
  'use strict';

  var renderDeps=null;
  var RENDER_DEPENDENCIES=[
    'data','ui','dark','todayStr','editing','activeDate','dayIndexFor','currentStreak',
    'countRec','habitCountOn','gununHavasi','dailyPhotoCardHTML',
    'saveBanner','shouldShowAeonNotifyBanner','aeonNotifyBannerHTML','locationCardHTML',
    'vacationCardHidden','vacationCardHTML','weatherHeaderHTML','journalLightCardHTML',
    'reminderInboxCardHTML','rasitBubbleHTML','rasitContactHTML','dateLabelTR','esc',
    'icon','heroPremiumStatsHTML','heroStatsHTML','heroTargetsHTML','heroScienceLine',
    'motivationTodayEntryHTML','rasitActionsHTML','hubTilesHTML','magnesiumFeedbackHTML',
    'magnesiumBannerHTML','moodCardHTML','daily','motivationProgramV2','eveningNudge',
    'habitsCardHTML','stepReminder','beslenmeCardHTML','waterCard','reflectionCardHTML',
    'onThisDayCard','healthTabHTML','reportTabHTML','mapTabHTML','saygiTabHTML',
    'roomOverlayEntryHTML','readingOverlayEntryHTML','watchOverlayEntryHTML',
    'listeningOverlayEntryHTML','learningOverlayEntryHTML','soulPracticePickerEntryHTML',
    'soulActivityOverlayEntryHTML','soulArchiveOverlayEntryHTML','settingsTabHTML',
    'messageTabHTML','appHeaderMeta','headerSkyClassNow','saveButtonHTML',
    'headerActionHTML','headerSceneHTML','unreadNotifCount','featuresLive',
    'saygiCurrentPerson','saygiHasRead','getDay','ensurePrayerDay',
    'prayerDaySummary','zikrDayCompleted','overlayShellEntryHTML',
    'soulOverlayShellEntryHTML','aeonAttachSheetHTML','aeonLoadVisibleMedia',
    'authGateHTML','crisisModalHTML','editBanner','ensureProfileAssessment',
    'faithCornerOverlayHTML','journalModalHTML','locationGateHTML',
    'locationGateRequired','maybeFetchDailyPhoto','mountSkyCanvas','needsAuth',
    'paintAmbientShell',
    'qiblaOverlayHTML','quranJourneyOverlayHTML','reminderActiveElementId',
    'reminderCenterOverlayHTML','reminderRestoreFocus',
    'renderProfileAssessmentGate','saygiDisconnectReadObserver',
    'saygiFloatingReadHTML','saygiPersonModalHTML','wireAppHeaderScroll',
    'wireSaygiReadGate','zikroverlayHTML','locBenefits','renderState',
    'zikrV2Visible'
  ];

  function registerRender(deps){
    if(renderDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<RENDER_DEPENDENCIES.length;i++) if(typeof deps[RENDER_DEPENDENCIES[i]]!=='function') return false;
    renderDeps=deps;
    return true;
  }
  function dep(name){ return renderDeps&&typeof renderDeps[name]==='function'?renderDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaRender: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveUi(){ return call('ui',[]); }
  function liveDark(){ return call('dark',[]); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function todayStr(){ return call('todayStr',arguments); }
  function editing(){ return call('editing',arguments); }
  function activeDate(){ return call('activeDate',arguments); }
  function dayIndexFor(){ return call('dayIndexFor',arguments); }
  function currentStreak(){ return call('currentStreak',arguments); }
  function countRec(){ return call('countRec',arguments); }
  function habitCountOn(){ return call('habitCountOn',arguments); }
  function gununHavasi(){ return call('gununHavasi',arguments); }
  function dailyPhotoCardHTML(){ return call('dailyPhotoCardHTML',arguments); }
  function saveBanner(){ return call('saveBanner',arguments); }
  function shouldShowAeonNotifyBanner(){ return call('shouldShowAeonNotifyBanner',arguments); }
  function aeonNotifyBannerHTML(){ return call('aeonNotifyBannerHTML',arguments); }
  function locationCardHTML(){ return call('locationCardHTML',arguments); }
  function vacationCardHidden(){ return call('vacationCardHidden',arguments); }
  function vacationCardHTML(){ return call('vacationCardHTML',arguments); }
  function weatherHeaderHTML(){ return call('weatherHeaderHTML',arguments); }
  function journalLightCardHTML(){ return call('journalLightCardHTML',arguments); }
  function reminderInboxCardHTML(){ return call('reminderInboxCardHTML',arguments); }
  function rasitBubbleHTML(){ return call('rasitBubbleHTML',arguments); }
  function rasitContactHTML(){ return call('rasitContactHTML',arguments); }
  function dateLabelTR(){ return call('dateLabelTR',arguments); }
  function heroPremiumStatsHTML(){ return call('heroPremiumStatsHTML',arguments); }
  function heroStatsHTML(){ return call('heroStatsHTML',arguments); }
  function heroTargetsHTML(){ return call('heroTargetsHTML',arguments); }
  function heroScienceLine(){ return call('heroScienceLine',arguments); }
  function motivationTodayCardHTML(){ return call('motivationTodayEntryHTML',arguments); }
  function rasitActionsHTML(){ return call('rasitActionsHTML',arguments); }
  function hubTilesHTML(){ return call('hubTilesHTML',arguments); }
  function magnesiumFeedbackHTML(){ return call('magnesiumFeedbackHTML',arguments); }
  function magnesiumBannerHTML(){ return call('magnesiumBannerHTML',arguments); }
  function moodCardHTML(){ return call('moodCardHTML',arguments); }
  function motivationProgramV2(){ return call('motivationProgramV2',[]); }
  function eveningNudge(){ return call('eveningNudge',arguments); }
  function habitsCardHTML(){ return call('habitsCardHTML',arguments); }
  function stepReminder(){ return call('stepReminder',arguments); }
  function beslenmeCardHTML(){ return call('beslenmeCardHTML',arguments); }
  function waterCard(){ return call('waterCard',arguments); }
  function reflectionCardHTML(){ return call('reflectionCardHTML',arguments); }
  function onThisDayCard(){ return call('onThisDayCard',arguments); }
  function healthTabHTML(){ return call('healthTabHTML',arguments); }
  function reportTabHTML(){ return call('reportTabHTML',arguments); }
  function mapTabHTML(){ return call('mapTabHTML',arguments); }
  function saygiTabHTML(){ return call('saygiTabHTML',arguments); }
  function roomOverlayEntryHTML(){ return call('roomOverlayEntryHTML',arguments); }
  function readingOverlayEntryHTML(){ return call('readingOverlayEntryHTML',arguments); }
  function watchOverlayEntryHTML(){ return call('watchOverlayEntryHTML',arguments); }
  function listeningOverlayEntryHTML(){ return call('listeningOverlayEntryHTML',arguments); }
  function learningOverlayEntryHTML(){ return call('learningOverlayEntryHTML',arguments); }
  function soulPracticePickerEntryHTML(){ return call('soulPracticePickerEntryHTML',arguments); }
  function soulActivityOverlayEntryHTML(){ return call('soulActivityOverlayEntryHTML',arguments); }
  function soulArchiveOverlayEntryHTML(){ return call('soulArchiveOverlayEntryHTML',arguments); }
  function settingsTabHTML(){ return call('settingsTabHTML',arguments); }
  function messageTabHTML(){ return call('messageTabHTML',arguments); }
  function appHeaderMeta(){ return call('appHeaderMeta',arguments); }
  function headerSkyClassNow(){ return call('headerSkyClassNow',arguments); }
  function saveButtonHTML(){ return call('saveButtonHTML',arguments); }
  function headerActionHTML(){ return call('headerActionHTML',arguments); }
  function headerSceneHTML(){ return call('headerSceneHTML',arguments); }
  function unreadNotifCount(){ return call('unreadNotifCount',arguments); }
  function featuresLive(){ return call('featuresLive',arguments); }
  function saygiCurrentPerson(){ return call('saygiCurrentPerson',arguments); }
  function saygiHasRead(){ return call('saygiHasRead',arguments); }
  function getDay(){ return call('getDay',arguments); }
  function ensurePrayerDay(){ return call('ensurePrayerDay',arguments); }
  function prayerDaySummary(){ return call('prayerDaySummary',arguments); }
  function zikrDayCompleted(){ return call('zikrDayCompleted',arguments); }
  function overlayShellEntryHTML(){ return call('overlayShellEntryHTML',arguments); }
  function soulOverlayShellEntryHTML(){ return call('soulOverlayShellEntryHTML',arguments); }
  function aeonAttachSheetHTML(){ return call('aeonAttachSheetHTML',arguments); }
  function aeonLoadVisibleMedia(){ return call('aeonLoadVisibleMedia',arguments); }
  function authGateHTML(){ return call('authGateHTML',arguments); }
  function crisisModalHTML(){ return call('crisisModalHTML',arguments); }
  function editBanner(){ return call('editBanner',arguments); }
  function ensureProfileAssessment(){ return call('ensureProfileAssessment',arguments); }
  function faithCornerOverlayHTML(){ return call('faithCornerOverlayHTML',arguments); }
  function journalModalHTML(){ return call('journalModalHTML',arguments); }
  function locationGateHTML(){ return call('locationGateHTML',arguments); }
  function locationGateRequired(){ return call('locationGateRequired',arguments); }
  function maybeFetchDailyPhoto(){ return call('maybeFetchDailyPhoto',arguments); }
  function mountSkyCanvas(){ return call('mountSkyCanvas',arguments); }
  function needsAuth(){ return call('needsAuth',arguments); }
  function paintAmbientShell(){ return call('paintAmbientShell',arguments); }
  function qiblaOverlayHTML(){ return call('qiblaOverlayHTML',arguments); }
  function quranJourneyOverlayHTML(){ return call('quranJourneyOverlayHTML',arguments); }
  function reminderActiveElementId(){ return call('reminderActiveElementId',arguments); }
  function reminderCenterOverlayHTML(){ return call('reminderCenterOverlayHTML',arguments); }
  function reminderRestoreFocus(){ return call('reminderRestoreFocus',arguments); }
  function renderProfileAssessmentGate(){ return call('renderProfileAssessmentGate',arguments); }
  function saygiDisconnectReadObserver(){ return call('saygiDisconnectReadObserver',arguments); }
  function saygiFloatingReadHTML(){ return call('saygiFloatingReadHTML',arguments); }
  function saygiPersonModalHTML(){ return call('saygiPersonModalHTML',arguments); }
  function wireAppHeaderScroll(){ return call('wireAppHeaderScroll',arguments); }
  function wireSaygiReadGate(){ return call('wireSaygiReadGate',arguments); }
  function zikroverlayHTML(){ return call('zikroverlayHTML',arguments); }
  function locBenefits(){ return call('locBenefits',arguments); }
  function renderState(){ return call('renderState',arguments); }
  function zikrV2Visible(){ return call('zikrV2Visible',arguments); }

function modalsHTML(){
  var ui=liveUi(), locBenefitsValue=locBenefits(), zikrVisible=zikrV2Visible();
  var h='';
  if(ui.reminderCenterOpen){ h+=reminderCenterOverlayHTML(); }
  if(ui.crisisKind){ h+=crisisModalHTML(); }
  if(ui.journalOpen){ h+=journalModalHTML(); }
  if(ui.roomOpen){ h+=roomOverlayHTML(); }
  if(ui.readingOpen){ h+=readingOverlayHTML(); }
  if(ui.watchOpen){ h+=watchOverlayHTML(); }
  if(ui.listeningOpen){ h+=listeningOverlayHTML(); }
  if(ui.learningOpen){ h+=learningOverlayHTML(); }
  if(ui.soulPracticePicker){ h+=soulPracticePickerHTML(); }
  if(ui.soulActivityOpen){ h+=soulActivityOverlayHTML(); }
  if(ui.soulArchiveOpen){ h+=soulArchiveOverlayHTML(); }
  if(ui.faithOpen){ h+=faithCornerOverlayHTML(); }
  if(ui.zikrOpen&&zikrVisible){ h+=zikroverlayHTML(); }
  if(ui.quranJourneyOpen){ h+=quranJourneyOverlayHTML(); }
  if(ui.qiblaOpen){ h+=qiblaOverlayHTML(); }
  if(ui.saygiPersonOpen){ h+=saygiPersonModalHTML(); h+=saygiFloatingReadHTML(); }
  if(ui.aeonAttachOpen){ h+=aeonAttachSheetHTML(); }
  if(ui.emergency){
    h+='<div onclick="App.closeEmergency()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px 18px calc(18px + env(safe-area-inset-bottom));animation:seyFade .2s ease;">';
    h+='<div id="sey-emergency-dialog" role="dialog" aria-modal="true" aria-label="Zor an desteği" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeEmergency)" onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:24px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;"><div style="font-size:var(--f-title2);font-weight:800;margin-bottom:12px;">Dramatize etmiyoruz.</div><p style="margin:0 0 18px;font-size:var(--f-callout);line-height:1.6;color:var(--text2);">Olur Sevgili Günışığı. Bir gün dağıldı diye 21 gün çöpe gitmez. Şimdi sadece bir bardak su iç, sonraki öğünde normale dön. Tatlı mahkemesi kurulmadı, hayat devam ediyor.</p><div style="display:flex;flex-direction:column;gap:10px;"><button onclick="App.continueEmergency()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:var(--f-callout);font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);display:flex;align-items:center;justify-content:center;gap:6px;">Tamam, devam '+icon('sparkles',15)+'</button><button onclick="App.emergencyNote()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:var(--f-subhead);font-weight:600;color:var(--muted);background:transparent;">Bugüne minicik not düş</button></div></div></div>';
  }
  if(ui.dayDetail){
    var d=ui.dayDetail;
    h+='<div onclick="App.closeDetail()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div role="dialog" aria-modal="true" aria-label="Gün ayrıntısı" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeDetail)" onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;max-height:80vh;overflow-y:auto;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><div><div style="font-size:var(--f-title3);font-weight:800;">'+esc(d.title)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:2px;">'+esc(d.dateLabel)+' \u00b7 '+esc(d.status)+'</div></div><button onclick="App.closeDetail()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:var(--f-callout);color:var(--muted);">\u2715</button></div>';
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">';
    d.habits.forEach(function(hb){ h+='<div style="display:flex;align-items:center;gap:10px;font-size:var(--f-subhead);"><span style="font-size:var(--f-body);">'+hb.mark+'</span><span style="color:var(--text2);">'+esc(hb.label)+'</span></div>'; });
    h+='</div><div style="display:flex;gap:14px;font-size:var(--f-subhead);color:var(--muted);border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;flex-wrap:wrap;"><span>Mod: <b>'+esc(d.moodLabel)+'</b></span><span>Kriz (SOS): <b>'+d.sosCount+'</b></span></div>';
    var hl=[]; if(d.steps!=null) hl.push({i:'footprints',t:d.steps+' adım'}); if(d.mins!=null) hl.push({i:'timer',t:d.mins+' dk'}); if(d.sleepH!=null) hl.push({i:'moon',t:d.sleepH+' sa'}); if(d.flow) hl.push({i:'droplet',t:d.flow});
    if(hl.length) h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">'+hl.map(function(x){return '<span style="font-size:var(--f-footnote);background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:5px 11px;color:var(--text2);display:inline-flex;align-items:center;gap:5px;">'+icon(x.i,12)+esc(x.t)+'</span>';}).join('')+'</div>';
    if(d.syms&&d.syms.length) h+='<div style="margin-top:8px;font-size:var(--f-footnote);color:var(--muted);">Belirti: '+esc(d.syms.join(' · '))+'</div>';
    if(d.meals&&d.meals.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:10px;display:flex;flex-direction:column;gap:6px;">'; d.meals.forEach(function(m){ h+='<div style="font-size:var(--f-footnote);line-height:1.4;"><span>'+m.icon+'</span> <b style="color:var(--text2);">'+esc(m.label)+':</b> <span style="color:var(--muted);">'+esc(m.text)+'</span></div>'; }); h+='</div>'; }
    if(d.hasIntention) h+='<div style="margin-top:12px;font-size:var(--f-subhead);line-height:1.5;color:var(--text2);background:linear-gradient(160deg,rgba(255,225,154,0.24),rgba(201,184,255,0.14));border-radius:14px;padding:12px;display:flex;gap:6px;"><span style="flex-shrink:0;">'+icon('target',14)+'</span><span><b>Niyet:</b> '+esc(d.intention)+'</span></div>';
    if(d.hasNote) h+='<div style="margin-top:12px;font-size:var(--f-subhead);line-height:1.5;color:var(--text2);background:rgba(255,232,163,0.28);border-radius:14px;padding:12px;">'+esc(d.note)+'</div>';
    if(d.gratitude&&d.gratitude.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);margin-bottom:6px;display:flex;align-items:center;gap:5px;">'+icon('heart-handshake',13)+' O günün güzel şeyleri</div><div style="display:flex;flex-direction:column;gap:5px;">'+d.gratitude.map(function(g,i){return '<div style="font-size:var(--f-footnote);line-height:1.45;color:var(--text2);">'+(i+1)+'. '+esc(String(g).trim())+'</div>';}).join('')+'</div></div>'; }
    var isTod=!!d.isToday;
    h+='<button onclick="App.editDay(\''+d.date+'\')" style="margin-top:16px;border:none;cursor:pointer;width:100%;padding:14px;border-radius:16px;font-size:var(--f-subhead);font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#E9A23C,#E9899F);box-shadow:0 10px 24px rgba(233,150,90,0.38);">'+(isTod?('Bugüne git '+icon('sun',15)):(icon('pen-line',15)+' Bu günü düzenle'))+'</button>';
    if(!isTod) h+='<div style="margin-top:8px;font-size:var(--f-caption1);color:var(--faint);line-height:1.45;text-align:center;">Geçmiş günü düzenlerken üstte uyarı görürsün; işin bitince “Bugüne dön”e bas. Konum, oturum ve canlı veriler her zaman bugüne yazılır.</div>';
    h+='</div></div>';
  }
  if(ui.locationConsent){
    h+='<div onclick="App.cancelLocationConsent()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div role="dialog" aria-modal="true" aria-label="Konum paylaşımı" tabindex="-1" onkeydown="App.onModalKeydown(event,App.cancelLocationConsent)" onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;">';
    h+='<div style="font-size:var(--f-title3);font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:8px;">'+icon('map-pin',18)+' Konum paylaşımı</div>';
    h+='<p style="margin:0 0 14px;font-size:var(--f-subhead);line-height:1.55;color:var(--muted);">Açarsan konumun ve hareketlerin (yürüyüş/araç, kat edilen mesafe) <b>uygulama açıkken</b> ölçülür.</p>';
    h+='<p style="margin:0 0 18px;font-size:var(--f-footnote);line-height:1.5;color:var(--faint);">Devam edince tarayıcın ayrıca konum izni isteyecek.</p>';
    h+='<div style="display:flex;gap:10px;"><button onclick="App.cancelLocationConsent()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button data-fx="confirm" onclick="App.confirmLocationConsent()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);">Onaylıyorum</button></div>';
    h+='</div></div>';
  }
  if(ui.locNudgeOpen){
    var lnB=(ui.locNudgeShown&&ui.locNudgeShown.length)?ui.locNudgeShown:[locBenefitsValue[0]];
    h+='<div onclick="App.locNudgeDismiss()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div role="dialog" aria-modal="true" aria-label="Konum hatırlatıcısı" tabindex="-1" onkeydown="App.onModalKeydown(event,App.locNudgeDismiss)" onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;">';
    h+='<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:2px;">';
    h+='<div style="flex-shrink:0;width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#3F8A4F;background:linear-gradient(135deg,#DFF5DA,#C9E8C4);box-shadow:0 6px 16px rgba(125,190,119,0.35);">'+icon('map-pin',22)+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-headline);font-weight:800;line-height:1.25;">Hareketini görünür kılalım mı?</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:2px;">Küçük bir dokunuş, sağlığına iyi gelir.</div></div>';
    h+='<button onclick="App.locNudgeDismiss()" aria-label="Kapat" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);line-height:1;display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button>';
    h+='</div>';
    h+='<div style="display:flex;flex-direction:column;gap:9px;margin:14px 0 16px;">';
    lnB.forEach(function(b){ h+='<div style="display:flex;gap:10px;align-items:flex-start;background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.15;flex-shrink:0;color:#3F8A4F;">'+icon(b.icon||'map-pin',18)+'</span><span style="font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">'+esc(b.t)+'</span></div>'; });
    h+='</div>';
    h+='<button onclick="App.locNudgeOpenConsent()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:var(--f-callout);font-weight:800;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);box-shadow:0 10px 24px rgba(111,179,106,0.4);display:flex;align-items:center;justify-content:center;gap:8px;">Konumu aç '+icon('sparkles',15)+'</button>';
    h+='<button onclick="App.locNudgeSnooze()" style="margin-top:9px;border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:var(--text2);background:transparent;">Belki sonra</button>';
    h+='<div style="text-align:center;margin-top:10px;"><button onclick="App.locNudgeOptOut()" style="border:none;background:none;cursor:pointer;color:var(--faint);font-size:var(--f-caption1);font-weight:600;text-decoration:underline;">Bugün gösterme</button></div>';
    h+='<div style="margin-top:10px;font-size:var(--f-caption2);color:var(--faint);line-height:1.45;text-align:center;">Ölçüm yalnızca uygulama açıkken yapılır; dilediğinde kapatırsın.</div>';
    h+='</div></div>';
  }
  if(ui.resetStep>0){
    var two=ui.resetStep===2;
    h+='<div onclick="App.cancelReset()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div role="dialog" aria-modal="true" aria-label="Verileri sıfırlama onayı" tabindex="-1" onkeydown="App.onModalKeydown(event,App.cancelReset)" onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;"><div style="font-size:var(--f-title3);font-weight:800;margin-bottom:8px;">'+(two?'Son adım':'Emin misin?')+'</div><p style="margin:0 0 18px;font-size:var(--f-subhead);line-height:1.5;color:var(--muted);">'+(two?'Tüm günlük kayıtların kalıcı olarak silinecek.':'Bu işlem günlük kayıtlarını siler.')+'</p><div style="display:flex;gap:10px;"><button onclick="App.cancelReset()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button data-fx="destructive" onclick="App.resetConfirm()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:#fff;background:#C0605F;">'+(two?'Evet, sıfırla':'Devam et')+'</button></div></div></div>';
  }
  return h;
}

function render(){
  var data=liveData(), ui=liveUi(), dark=liveDark(), _renderState=renderState();
  var root=document.getElementById('root');
  root.setAttribute('data-theme', dark?'dark':'light');
  var app=document.getElementById('app');
  // Zemin her şeyden ÖNCE: aşağıdaki erken dönüşlerin hiçbiri onu atlayamaz.
  paintAmbientShell();

  // Kilit ekranı: şifre doğrulanmadan onboarding/ana arayüz görünmez.
  if(needsAuth()){
    app.innerHTML=authGateHTML();
    _renderState.lastRenderTab=null; _renderState.lastOverlay=null; _renderState.lastOverlayView=null; _renderState.lastHeaderShown=false;
    // Hatayı görselleştirdikten sonra bayrağı sıfırla; sarsıntı sınıfı CSS animasyonu kaldırır.
    if(ui.authError) setTimeout(function(){ ui.authError=false; ui.authErrorMsg=''; },300);
    return;
  }

  // Hard gate: Safari konum izni doğrulanmadan hiçbir uygulama yüzeyi açılmaz.
  if(locationGateRequired()){
    app.innerHTML=locationGateHTML();
    _renderState.lastRenderTab=null; _renderState.lastOverlay=null; _renderState.lastOverlayView=null; _renderState.lastHeaderShown=false;
    try{ var lg=document.getElementById('sey-location-gate'); if(lg&&lg.focus) lg.focus(); }catch(e){}
    return;
  }

  if(!data || ui.forceStart){ app.innerHTML=onboardingHTML(); _renderState.lastRenderTab=null; _renderState.lastOverlay=null; _renderState.lastOverlayView=null; _renderState.lastHeaderShown=false; return; }

  // Faz 05/06: ANA UYGULAMA KİLİDİ. `data.psych`'ten tamamen ayrı bir mekanizma.
  // 174/174 tamamlanana (`status==='completed'`) kadar Bugün/Sağlık/Rapor/Mesaj/Harita/
  // Saygı sekmeleri kilitli — yalnızca Ayarlar (gizlilik/veri-silme/senkron) erişilebilir
  // kalır (bkz. REPO_INTEGRATION_ARCHITECTURE.md § Erişim). Puanlama/rapor burada YOK
  // (bkz. Faz 07-09); 174. maddeden sonra yalnızca geçici tamamlanma (completedAt) yazılır.
  // 2026-07-13: Değerlendirme artık ana arayüzde inaktif; sonuçlar panelde görünür.
  // Kod ve veri korundu; settings.profileAssessmentInactive ile istenirse yeniden açılabilir.
  var pa=ensureProfileAssessment(data);
  if(!data.settings.profileAssessmentInactive && (pa.status!=='completed' || ui.profileAssessmentCompletionShown) && ui.tab!=='ayarlar'){
    app.innerHTML=renderProfileAssessmentGate()+modalsHTML();
    _renderState.lastRenderTab=null; _renderState.lastOverlay=null; _renderState.lastOverlayView=null; _renderState.lastHeaderShown=false;
    try{ var pg=document.getElementById('pa-gate'); if(pg&&pg.focus) pg.focus(); }catch(e){}
    return;
  }

  var prevScroll=document.querySelector('[data-scroll]');
  var prevTop=prevScroll?prevScroll.scrollTop:0;
  var sameTab=(_renderState.lastRenderTab===ui.tab);

  // Hub overlay (Ne okudum / Ne izledim): sekme degistirirken tam DOM yeniden kurulur;
  // acik kalan overlay'in scroll'unu yakala ki flash olmadan geri koyalim
  var prevOvBody=document.getElementById('sey-ov-body');
  var prevOvTop=prevOvBody?prevOvBody.scrollTop:0;
  // Zikirmatik v2 ortak bottom-sheet kabuğunu kullanmaz; 100dvh bağımsız ekranının
  // kendi kaydırma konumunu görünüm bazında korur.
  var prevZikrScroll=document.getElementById('zikr-scroll');
  var prevZikrTop=prevZikrScroll?prevZikrScroll.scrollTop:0;
  // Kur’an Yolculuğu (QY-06) da kendi 100dvh kabuğunu kullanır; kütüphane
  // kaydırma konumu görünüm bazında korunur (114 satırlık listede kritik).
  var prevQuranScroll=document.getElementById('quran-scroll');
  var prevQuranTop=prevQuranScroll?prevQuranScroll.scrollTop:0;
  var prevReminderScroll=document.getElementById('sey-reminder-scroll');
  var prevReminderTop=prevReminderScroll?prevReminderScroll.scrollTop:0;
  var prevReminderFocusId=ui.reminderCenterOpen?reminderActiveElementId():'';
  // Kriz modalı: etkileşimde (seçenek/tetik işaretleme) modal yeniden kurulur; gövde
  // scroll'unu yakala ki flash olmadan geri koyalım.
  var prevCrisisBody=document.getElementById('sey-crisis-body');
  var prevCrisisTop=prevCrisisBody?prevCrisisBody.scrollTop:0;
  saygiDisconnectReadObserver();
  var curOverlay=ui.reminderCenterOpen?'reminderCenter':(ui.saygiPersonOpen?'saygiPerson':(ui.quranJourneyOpen?'quranJourney':(ui.zikrOpen?'zikr':(ui.qiblaOpen?'qibla':(ui.faithOpen?'faith':(ui.soulArchiveOpen?'soulArchive':(ui.soulPracticePicker?'soulPicker':(ui.soulActivityOpen?'soulActivity':(ui.readingOpen?'reading':(ui.watchOpen?'watching':(ui.listeningOpen?'listening':(ui.learningOpen?'learning':null))))))))))));
  var curOverlayView=curOverlay==='reading'?(ui.readingView||'today'):(curOverlay==='watching'?(ui.watchView||'today'):(curOverlay==='listening'?(ui.listeningView||'today'):(curOverlay==='zikr'?(ui.zikrView||'counter'):(curOverlay==='quranJourney'?(ui.quranJourneyView||'library'):null))));

  var _painted=false;
  function paint(){
    if(_painted) return; _painted=true;
  var html=appHeaderHTML(); // başlangıç ekranı hariç her sekmenin en üstünde sabit marka başlığı
  // Flex içinde min-height:0 kritik: özellikle uzun Sağlık sayfasında içerik alanı
  // kabuğu büyütmek yerine kendi içinde kayar; sticky alt nav yerinden oynamaz.
  html+='<div data-scroll class="scroll sey-main-scroll" style="flex:1;min-height:0;overflow-y:auto;padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px;">';
  if(editing()) html+=editBanner();
  if(ui.tab==='bugun') html+=bugunHTML();
  else if(ui.tab==='saglik') html+=saglikHTML();
  else if(ui.tab==='saygi') html+=saygiHTML();
  else if(ui.tab==='harita') html+=haritaHTML();
  else if(ui.tab==='rapor') html+=raporHTML();
  else if(ui.tab==='mesaj') html+=mesajHTML();
  else if(ui.tab==='ayarlar') html+=ayarlarHTML();
  html+='</div>';
  html+=navHTML();
  html+=modalsHTML();
  app.innerHTML=html;
  if(ui.tab==='bugun' && !editing()){ maybeFetchDailyPhoto(); }
  if(ui.tab==='mesaj') aeonLoadVisibleMedia();

  var newScroll=document.querySelector('[data-scroll]');
  if(newScroll){
    wireAppHeaderScroll(newScroll);
    if(ui.tab==='saygi') wireSaygiReadGate(newScroll);
    if(ui.saygiPersonOpen){ var modalBody=document.getElementById('sey-ov-body'); if(modalBody) wireSaygiReadGate(modalBody,'-modal'); }
    if(ui.tab==='mesaj' && (!sameTab || ui.aeonScrollBottom)){
      // ÆON sohbeti: açılışta ve yeni mesaj/cevap sonrası en alta (en yeni mesaja) kaydır
      var firstM=newScroll.firstElementChild; if(firstM){ firstM.style.animation='none'; }
      newScroll.scrollTop=newScroll.scrollHeight;
      ui.aeonScrollBottom=false;
    } else if(!sameTab){
      // Sekme degisimi: per-kart giris animasyonlarini sustur ve scroll'u en uste cek.
      // Bu sayede kartlar her tab gecisinde yeniden "float-in" yapip "refresh"/parlama hissi vermez.
      // Ambient (sonsuz) animasyonlar seyShine/seyRoomGlow etkilenmez.
      var firstEl=newScroll.firstElementChild;
      if(firstEl){ firstEl.style.animation='none'; }
      try{
        var ins=newScroll.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]');
        for(var _i=0;_i<ins.length;_i++){ ins[_i].style.animation='none'; }
      }catch(e){}
      newScroll.scrollTop=0;
    } else {
      // Aynı sekmede veri kaydı sonrası: kaydırma konumunu koru ve TÜM giriş animasyonlarını
      // tekrar oynatma (tik/mod/yazı gibi kayıtlarda kartların "refresh" gibi titremesini önler).
      var firstEl=newScroll.firstElementChild;
      if(firstEl){ firstEl.style.animation='none'; }
      try{
        var ins=newScroll.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]');
        for(var _i=0;_i<ins.length;_i++){ ins[_i].style.animation='none'; }
      }catch(e){}
      newScroll.scrollTop=prevTop;
    }
    if(ui.tab==='mesaj'){
      // Yukarı kaydırılınca beliren "en alta in" düğmesi (premium WhatsApp-tarzı FAB)
      var aeonFab=document.getElementById('aeon-scroll-fab');
      if(aeonFab){
        var toggleAeonFab=function(){ var nb=(newScroll.scrollHeight-newScroll.scrollTop-newScroll.clientHeight)<160; aeonFab.style.display=nb?'none':'flex'; };
        newScroll.addEventListener('scroll',toggleAeonFab,{passive:true});
        toggleAeonFab();
      }
    }
  }

  // Overlay ayni kaldiysa (sekme degisimi veya ic veri aksiyonu): giris animasyonunu tekrar oynatma -> flash yok
  if(curOverlay && curOverlay===_renderState.lastOverlay){
    var ovBack=document.getElementById('sey-ov-back');
    var ovCard=document.getElementById('sey-ov-card');
    if(ovBack) ovBack.style.animation='none';
    if(ovCard) ovCard.style.animation='none';
    var ovBody=document.getElementById('sey-ov-body');
    // Ayni sekmede kaldiysak scroll'u koru; sekme degistiyse en uste don
    if(ovBody && curOverlayView===_renderState.lastOverlayView) ovBody.scrollTop=prevOvTop;
    var zikrScroll=document.getElementById('zikr-scroll');
    if(zikrScroll && curOverlayView===_renderState.lastOverlayView) zikrScroll.scrollTop=prevZikrTop;
    var quranScroll=document.getElementById('quran-scroll');
    if(quranScroll && curOverlayView===_renderState.lastOverlayView) quranScroll.scrollTop=prevQuranTop;
    var reminderScroll=document.getElementById('sey-reminder-scroll');
    if(reminderScroll && curOverlay==='reminderCenter'){
      reminderScroll.scrollTop=prevReminderTop;
      if(prevReminderFocusId) reminderRestoreFocus(prevReminderFocusId,'');
    }
    // Hatırlatma merkezi zaten açıkken yapılan etkileşim render'larında
    // giriş animasyonunu tekrar oynatma → parlama/flash ve "refresh" hissi yok.
    if(curOverlay==='reminderCenter' && _renderState.lastOverlay==='reminderCenter'){
      var remOverlay=document.getElementById('sey-reminder-overlay');
      var remScreen=document.getElementById('sey-reminder-screen');
      if(remOverlay) remOverlay.style.animation='none';
      if(remScreen) remScreen.style.animation='none';
    }
  }
  // Terapi Odası zaten açıkken yapılan etkileşim render'larında (ör. "Görevi küçült")
  // tek-seferlik giriş animasyonlarını (seyPop/seyFloatIn/seyFade) sustur → parlama/flash yok.
  // İlk açılışta (_renderState.lastRoomOpen=false) animasyonlar normal oynar; sürekli seyShine parıltısı etkilenmez.
  if(ui.roomOpen && _renderState.lastRoomOpen){
    var roomSheet=document.getElementById('sey-room-dialog');
    var roomBack=document.getElementById('sey-room-overlay');
    if(roomBack) roomBack.style.animation='none';
    if(roomSheet){
      roomSheet.style.animation='none';
      try{ var rin=roomSheet.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]'); for(var _r=0;_r<rin.length;_r++){ rin[_r].style.animation='none'; } }catch(e){}
    }
  }
  _renderState.lastRoomOpen=ui.roomOpen;
  // Kriz modalı zaten açıkken yapılan etkileşim render'larında giriş animasyonunu
  // tekrar oynatma → flash yok; gövde scroll'unu koru.
  if(ui.crisisKind && _renderState.lastCrisisKind===ui.crisisKind){
    var crBack=document.getElementById('sey-crisis-back');
    var crCard=document.getElementById('sey-crisis-card');
    if(crBack) crBack.style.animation='none';
    if(crCard){ crCard.style.animation='none'; try{ var cin=crCard.querySelectorAll('[style*="seyFloatIn"],[style*="seyFade"],[style*="seyPop"]'); for(var _c=0;_c<cin.length;_c++){ cin[_c].style.animation='none'; } }catch(e){} }
    var crBody=document.getElementById('sey-crisis-body');
    if(crBody){ crBody.scrollTop=prevCrisisTop; } // etkileşimde scroll konumunu koru → flash yok
  }
  _renderState.lastCrisisKind=ui.crisisKind;
  // Sabit marka başlığı: giriş animasyonunu yalnızca ilk görünümde oynat (her render'da tekrar etmesin).
  if(_renderState.lastHeaderShown){ var _hdr=document.querySelector('.sey-appheader'); if(_hdr) _hdr.style.animation='none'; }
  _renderState.lastHeaderShown=true;
  _renderState.lastOverlay=curOverlay;
  _renderState.lastOverlayView=curOverlayView;
  _renderState.lastRenderTab=ui.tab;
  }
  paint();
  // FX-P-87: yerel ses listesi popülasyonu — render SONRASI çalışmalı (eleman
  // innerHTML ile bu noktadan önce oluşur). iOS'ta getVoices async boş döner;
  // onvoiceschanged ile yeniden doldurulur. Emoji yok, ses çalınmaz.
  try{
    if(window.speechSynthesis){
      var pop=function(){ var vs=speechSynthesis.getVoices().filter(function(v){ return v.lang&&v.lang.indexOf((data.settings.voiceLang||'tr-TR').slice(0,2))===0; }); var sel=document.getElementById('sey-voice-vname'); if(!sel) return; vs.slice(0,20).forEach(function(v){ var o=document.createElement('option'); o.value=v.name; o.textContent=v.name; if(v.name===data.settings.voiceVoiceName) o.selected=true; sel.appendChild(o); }); };
      pop(); speechSynthesis.onvoiceschanged=pop;
    }
  }catch(e){}
  // İlk açılış sonrası sabit animasyon kipine geç; böylece sonraki sekme değişimlerinde
  // header shimmer, wordmark sheen veya sayfa-giriş fade'ı yeniden başlamaz.
  if(root) root.classList.add('sey-app-booted');
  // TAM-DENETIM B-02: canlı zemin boyaması artık render()'ın BAŞINDA
  // (paintAmbientShell) — kapı ekranlarında da uygulanır. Buradaki tekrar
  // çağrısı kaldırıldı; yalnız DOM'a bağımlı olanlar kaldı.
  try{ if(window.SeyFx && typeof window.SeyFx.bindAuroraParallax==='function') window.SeyFx.bindAuroraParallax(); }catch(e){}
  try{ if(window.SeyFx && typeof window.SeyFx.sweepCounters==='function') window.SeyFx.sweepCounters(); }catch(e){}
  try{ mountSkyCanvas(); }catch(e){}
  // iOS/PWA durum çubuğu rengini mevcut tema ile senkronize tut; açık/koyu geçişlerinde flaş azalır.
  // Yalnızca gerçekten tema değiştiğinde meta tag'i güncelle, her render'da değil.
  var tcm=document.querySelector('meta[name="theme-color"]');
  if(tcm){
    var targetColor=dark?'#000000':'#FFF8F3';
    if(tcm.getAttribute('content')!==targetColor) tcm.setAttribute('content',targetColor);
  }
}

  function appHeaderHTML(){
    var m=appHeaderMeta();
    var h='<header id="sey-appheader" class="sey-appheader" style="--hdr-accent:'+m.accent+';--hdr-accent2:'+m.accent2+';--hdr-ink:'+m.ink+';">';
    h+='<span class="'+headerSkyClassNow()+'" aria-hidden="true"></span>';
    h+='<div class="sey-header-top">';
    h+='<button data-fx="nav" class="sey-header-brand" onclick="App.go(\'bugun\')" aria-label="Bugüne git"><span class="sey-wordmark">Şeyma</span><span class="sey-wordmark-flam">🦩</span></button>';
    h+='<div class="sey-header-tools">'+saveButtonHTML()+'<button data-fx="toggle" class="sey-header-mini" onclick="App.toggleTheme()" aria-label="Tema" title="Tema">'+icon(liveDark()?'sun':'moon',16)+'</button></div>';
    h+='</div>';
    h+='<div class="sey-header-main">';
    h+='<span class="sey-header-icon">'+icon(m.icon,21)+'</span>';
    h+='<div class="sey-header-copy"><div class="sey-header-kicker">'+esc(m.kicker||'Şeyma')+'</div><div class="sey-header-title">'+esc(m.title||'Bugün')+'</div><div class="sey-header-sub">'+esc(m.sub||'')+'</div></div>';
    h+=headerActionHTML(m.action);
    h+='</div>';
    h+=headerSceneHTML();
    h+='</header>';
    return h;
  }

  function navHTML(){
    // Alt bar, aktif sayfanın header aksanını paylaşır: iki yüzey tek bir uygulama kabuğu gibi okunur.
    var defs=[
      ['bugun','sun','Bugün','#7B5E2F','#3E433B'],
      ['saglik','flower-2','Sağlık','#2F6B63','#60695D'],
      ['mesaj','hexagon','Aeon','#A88444','#30343A'],
      ['saygi','trophy','İlham·İbadet','#826936','#36454B',true],
      ['harita','map','Takvim','#59695E','#8A734E'],
      ['rapor','chart-column','Rapor','#3A4048','#A4824C'],
      ['ayarlar','settings','Ayarlar','#4A4852','#787064']
    ];
    var state=liveUi(), root=liveData(), unread=unreadNotifCount();
    // Saygı + İman köşesinde tamamlanmamış görev rozeti hesabı.
    var saygiPending=0;
    if(featuresLive()){
      var person=saygiCurrentPerson();
      if(person&&!saygiHasRead(person)) saygiPending++;
    }
    try{
      var date=todayStr(), day=getDay(root,date,dayIndexFor(date));
      var p=ensurePrayerDay(day), s=prayerDaySummary(p);
      if(s.performed<6) saygiPending++;
      // Zikir: aktif preset hedefi henüz dolmadıysa manevi disiplin bekleniyor
      if(!zikrDayCompleted(date)) saygiPending++;
    }catch(e){}
    var current=defs[0];
    for(var di=0;di<defs.length;di++){ if(defs[di][0]===state.tab){ current=defs[di]; break; } }
    var h='<nav class="sey-bottomnav" aria-label="Ana gezinme" style="--nav-active:'+current[3]+';--nav-active2:'+current[4]+';--nav-count:'+defs.length+';">';
    h+='<div class="sey-bottomnav-surface">';
    defs.forEach(function(n){
      var active=state.tab===n[0];
      var badge='';
      if(n[0]==='mesaj'&&unread>0) badge='<span class="sey-bottomnav-badge">'+(unread>9?'9+':unread)+'</span>';
      else if(n[0]==='saygi'&&saygiPending>0) badge='<span class="sey-bottomnav-badge saygi">'+saygiPending+'</span>';
      var clickFn=n[0]==='mesaj'?'App.openMesaj()':'App.go(\''+n[0]+'\')';
      h+='<button data-fx="nav" class="sey-bottomnav-item'+(active?' is-active':'')+(n[5]?' is-saygi':'')+'" style="--nav-item-accent:'+n[3]+';--nav-item-accent2:'+n[4]+';" onclick="'+clickFn+'" aria-label="'+n[2]+'"'+(active?' aria-current="page"':'')+'>';
      h+='<span class="sey-bottomnav-icon"><span class="sey-bottomnav-indicator"></span><span class="sey-bottomnav-glyph">'+icon(n[1],20)+'</span>'+badge+'</span>';
      h+='<span class="sey-bottomnav-label">'+n[2]+'</span>';
      h+='</button>';
    });
    h+='</div></nav>';
    return h;
  }

  function onboardingHTML(){
    var dark=liveDark();
  // v2.0 boot screen: dark → mevcut super-black, light → sıcak "delight" karşılığı.
  // Yalnızca onboarding tema-duyarlıdır; uygulamanın geri kalan tema sistemi değişmez.
  var MONO="'SF Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace";
  var P=dark?{
    mode:'super-black',page:'radial-gradient(125% 85% at 50% -5%,#12121B 0%,#0A0A0F 46%,#060608 100%)',text:'#E8E8EE',grid:'rgba(255,255,255,0.028)',strip:'#54545F',
    topGlow:'rgba(230,193,90,0.15)',sideGlow:'rgba(233,137,159,0.16)',themeBg:'rgba(255,255,255,0.045)',themeBd:'rgba(255,255,255,0.10)',themeText:'#A2A2AD',
    wordGrad:'linear-gradient(110deg,#FBE7CB,#F4B9CE 42%,#D9C2FF 66%,#FBE7CB)',wordShadow:'drop-shadow(0 2px 16px rgba(230,193,90,0.32))',
    superGrad:'linear-gradient(110deg,#B6B6C1,#F3F3F8 38%,#7E7E8B 60%,#D4D4DD)',superShadow:'drop-shadow(0 1px 2px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(200,205,222,0.20))',metal:'rgba(210,210,220,0.5)',tag:'#8A8A95',
    panelBd:'rgba(255,255,255,0.09)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))',panelShadow:'0 24px 56px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06)',titleBg:'rgba(255,255,255,0.02)',titleBd:'rgba(255,255,255,0.07)',titleText:'#7C7C88',desc:'#777782',
    dash:'rgba(255,255,255,0.07)',specLabel:'#5F5F69',specVal:'#A2A2AD',status:'#5E5E68',statusSep:'#33333B',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.045),transparent)',aeonBd:'rgba(255,255,255,0.08)',aeonWord:'#F7F7FA',aeonSub:'#8B8B96',privacy:'#5A5A65'
  }:{
    mode:'delight',page:'radial-gradient(125% 88% at 50% -5%,#FFFFFF 0%,#FFF8F1 48%,#F4EEFF 100%)',text:'#2B2630',grid:'rgba(84,66,92,0.050)',strip:'#817783',
    topGlow:'rgba(246,193,119,0.30)',sideGlow:'rgba(233,137,159,0.20)',themeBg:'rgba(255,255,255,0.72)',themeBd:'rgba(91,72,98,0.14)',themeText:'#5F5662',
    wordGrad:'linear-gradient(110deg,#6D4652,#B76683 42%,#7864A6 68%,#6D4652)',wordShadow:'drop-shadow(0 2px 10px rgba(183,102,131,0.16))',
    superGrad:'linear-gradient(110deg,#28252C,#625D68 40%,#3B3741 66%,#28252C)',superShadow:'drop-shadow(0 1px 0 rgba(255,255,255,0.85))',metal:'rgba(81,73,86,0.34)',tag:'#766D78',
    panelBd:'rgba(91,72,98,0.14)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.90),rgba(255,250,247,0.76))',panelShadow:'0 24px 56px rgba(91,65,78,0.14),inset 0 1px 0 rgba(255,255,255,0.95)',titleBg:'rgba(92,72,99,0.035)',titleBd:'rgba(91,72,98,0.10)',titleText:'#756B77',desc:'#766D78',
    dash:'rgba(91,72,98,0.12)',specLabel:'#918792',specVal:'#49424C',status:'#756C77',statusSep:'#C9C0CA',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.60),rgba(246,238,255,0.34))',aeonBd:'rgba(91,72,98,0.11)',aeonWord:'#29252D',aeonSub:'#6F6672',privacy:'#716873'
  };
  // modüller — boot-log satırları (ad · açıklama · accent)
  var mods=[
    ['#E9899F','icsel_pusula','duygu takibi · notlar · içgörü'],
    ['#7BA7D0','saglik.sys','uyku · su · kafein · döngü'],
    ['#E0A93C','kriz_odasi','10 dk erteleme · güvenli çıkış'],
    ['#9B7FC9','motivasyon','120 gün · görev · günlük yansıma'],
    ['#E6C15A','aeon.link','mesaj · ses · fotoğraf · gözlemci'],
    ['#6E9C6A','medya.log','kitap · film/dizi · müzik günlüğü']
  ];
  var h='<div data-onboarding-theme="'+(dark?'dark':'light')+'" style="position:relative;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;font-family:'+MONO+';color:'+P.text+';background:'+P.page+';padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 16px);animation:seyFade .45s ease;">';
  // ── iOS-27 ambient: teknik grid (kenarlarda sönümlenir) + sıcak glow'lar ──
  h+='<div style="position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient('+P.grid+' 1px,transparent 1px),linear-gradient(90deg,'+P.grid+' 1px,transparent 1px);background-size:27px 27px;-webkit-mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);"></div>';
  h+='<div style="position:absolute;top:-9%;left:50%;transform:translateX(-50%);width:min(480px,150%);height:320px;background:radial-gradient(closest-side,'+P.topGlow+',transparent 74%);pointer-events:none;z-index:0;"></div>';
  h+='<div style="position:absolute;top:20%;right:-16%;width:240px;height:240px;background:radial-gradient(circle,'+P.sideGlow+',transparent 70%);pointer-events:none;z-index:0;"></div>';
  // ── üst: build strip ──
  h+='<div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;font-size:var(--f-caption2);letter-spacing:1px;color:'+P.strip+';animation:seyFloatIn .5s ease both;">';
  h+='<span>SEYMA_OS</span><span style="display:inline-flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;border-radius:50%;background:#3F9E63;box-shadow:0 0 6px rgba(63,158,99,.42);animation:seyTwinkle 1.6s ease-in-out infinite;"></span>build · aeon</span><button onclick="App.toggleTheme()" aria-label="Başlangıç temasını değiştir" style="border:1px solid '+P.themeBd+';background:'+P.themeBg+';color:'+P.themeText+';border-radius:999px;padding:5px 8px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-family:'+MONO+';font-size:var(--f-caption2);font-weight:800;letter-spacing:.35px;">'+icon(dark?'moon':'sun',11)+' '+P.mode+'</button></span>';
  h+='</div>';
  // ── orta blok (dikey ortalı): hero + terminal paneli ──
  h+='<div style="position:relative;z-index:1;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:15px;">';
  // HERO — Şeyma rozeti (korunur) + imza + "super-black" alt-imza + v2.0 vurgusu
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
  h+='<div style="position:relative;width:90px;height:90px;border-radius:28px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#FFE8A3,#F7DDE5 52%,#E9CBFF);box-shadow:0 22px 52px rgba(230,193,90,0.28),0 0 0 1px rgba(255,255,255,0.10),inset 0 1.5px 0 rgba(255,255,255,0.7);overflow:hidden;animation:seyPop .6s var(--ease-premium,ease) both;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 3.8s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;font-size:48px;line-height:1;filter:drop-shadow(0 8px 14px rgba(190,108,139,0.4));">🦩</span></div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;animation:seyFloatIn .5s .06s ease both;"><span class="sey-wordmark" style="font-size:44px;background:'+P.wordGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.wordShadow+';">Şeyma</span><span class="sey-wordmark-flam" style="font-size:var(--f-title1);">🦩</span></div>';
  // "super-black" — imza fontunda metalik gümüş alt-imza
  h+='<div style="display:flex;align-items:center;gap:9px;margin-top:-4px;animation:seyFloatIn .5s .09s ease both;"><span style="width:26px;height:1px;background:linear-gradient(90deg,transparent,'+P.metal+');"></span><span class="sey-wordmark" style="font-size:var(--f-title1);background:'+P.superGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.superShadow+';">'+P.mode+'</span><span style="width:26px;height:1px;background:linear-gradient(90deg,'+P.metal+',transparent);"></span></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-top:2px;animation:seyFloatIn .5s .12s ease both;"><span style="font-size:var(--f-caption1);letter-spacing:1.5px;color:'+P.tag+';text-transform:uppercase;">minik denge günlüğü</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.5px;color:#140C10;background:linear-gradient(135deg,#F2D98C,#E9AEC6);border-radius:999px;padding:3px 11px;box-shadow:0 6px 18px rgba(230,193,90,0.20);">v2.0</span></div>';
  h+='</div>';
  // TERMINAL PANEL — modüller boot-log + ÆON imzası
  h+='<div style="border:1px solid '+P.panelBd+';border-radius:18px;overflow:hidden;background:'+P.panelBg+';box-shadow:'+P.panelShadow+';animation:seyFloatIn .5s .16s ease both;">';
  // titlebar
  h+='<div style="display:flex;align-items:center;gap:7px;padding:10px 13px;border-bottom:1px solid '+P.titleBd+';background:'+P.titleBg+';">';
  ['#FF5F57','#FEBC2E','#28C840'].forEach(function(c){ h+='<span style="width:9px;height:9px;border-radius:50%;background:'+c+';box-shadow:0 0 6px '+c+'66;"></span>'; });
  h+='<span style="margin-left:7px;font-size:var(--f-caption2);color:'+P.titleText+';">seyma — denge.sys</span>';
  h+='<span style="margin-left:auto;font-size:var(--f-caption2);color:#3F9E63;letter-spacing:.5px;">● ready</span>';
  h+='</div>';
  // body: modül satırları
  h+='<div style="padding:11px 14px;display:flex;flex-direction:column;gap:8px;">';
  mods.forEach(function(m,i){
    var delay=(0.24+i*0.05).toFixed(2);
    h+='<div style="display:grid;grid-template-columns:7px 1fr auto;column-gap:9px;row-gap:2px;align-items:center;animation:seyFloatIn .5s '+delay+'s ease both;">';
    h+='<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:'+m[0]+';box-shadow:0 0 8px '+m[0]+';"></span>';
    h+='<span style="min-width:0;color:'+m[0]+';font-size:var(--f-caption1);line-height:1.2;font-weight:700;">'+m[1]+'</span>';
    h+='<span style="color:#3F9E63;font-size:var(--f-caption2);">ok</span>';
    h+='<span style="grid-column:2 / 4;min-width:0;color:'+P.desc+';font-size:var(--f-caption2);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+m[2]+'</span>';
    h+='</div>';
  });
  h+='</div>';
  // teknik özet — saklama ve eşlik modelini kısa, açık ve doğru anlatır.
  h+='<div style="padding:10px 14px 9px;border-top:1px dashed '+P.dash+';display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;font-size:var(--f-caption2);animation:seyFloatIn .5s .44s ease both;">';
  [['günlük','önce bu cihazda'],['yedek','sen bağlarsan GitHub'],['program','120 gün · 4 faz'],['eşlik','Luna + ÆON']].forEach(function(s){
    h+='<div style="min-width:0;"><div style="color:'+P.specLabel+';margin-bottom:2px;">'+s[0]+'</div><div style="color:'+P.specVal+';line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s[1]+'</div></div>';
  });
  h+='</div>';
  // hazır göstergesi
  h+='<div style="display:flex;align-items:center;gap:7px;padding:2px 14px 10px;font-size:var(--f-caption2);letter-spacing:.2px;color:'+P.status+';white-space:nowrap;animation:seyFloatIn .5s .48s ease both;"><span style="color:#3F9E63;">▷</span><span>store·local</span><span style="color:'+P.statusSep+';">·</span><span>sync·github</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:#3F9E63;flex-shrink:0;">hazır <span style="width:26px;height:4px;border-radius:999px;overflow:hidden;background:'+(dark?'rgba(255,255,255,0.08)':'rgba(91,72,98,0.10)')+';display:inline-block;"><span style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#E6C15A,#E9899F,#9B7FC9);"></span></span> 100%</span></div>';
  // ÆON imzası — terminali ezmeyen küçük, beyaz ve sakin güven rozeti.
  h+='<div style="display:flex;align-items:center;gap:12px;padding:12px 14px 13px;border-top:1px solid '+P.aeonBd+';background:'+P.aeonBg+';animation:seyFloatIn .5s .54s ease both;">';
  h+='<div style="position:relative;width:52px;height:52px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#101017;background:linear-gradient(145deg,#FFFFFF,#E9E9EF);border:1px solid '+(dark?'rgba(255,255,255,0.10)':'rgba(91,72,98,0.12)')+';box-shadow:'+(dark?'0 10px 25px rgba(255,255,255,0.12)':'0 10px 25px rgba(91,65,78,0.14)')+',inset 0 1px 0 #FFFFFF,inset 0 -2px 5px rgba(40,40,55,0.12);overflow:hidden;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.9) 50%,transparent 70%);animation:seyShine 4s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;display:inline-flex;">'+icon('hexagon',25)+'</span></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-family:-apple-system,system-ui,\'Segoe UI\',sans-serif;font-size:var(--f-headline);font-weight:850;letter-spacing:3px;color:'+P.aeonWord+';">ÆON</div>';
  h+='<div style="font-size:var(--f-caption2);letter-spacing:.25px;color:'+P.aeonSub+';line-height:1.45;margin-top:2px;">Paylaştığın kayıtları anlamlandırır; mesaj, ses ve fotoğraflarında güvenilir bir gözlemci eşlik eder.</div></div>';
  h+='</div>';
  h+='</div>'; // terminal panel
  h+='</div>'; // orta blok
  // ── alt: CTA + gizlilik ──
  h+='<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:9px;animation:seyFloatIn .5s .56s ease both;">';
  h+='<button onclick="App.start()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:16px;border-radius:16px;font-family:'+MONO+';font-size:var(--f-subhead);font-weight:800;letter-spacing:.3px;color:#180D14;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 18px 40px rgba(233,137,159,0.30),inset 0 1px 0 rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;gap:8px;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.5) 50%,transparent 65%);animation:seyShine 4.2s ease-in-out infinite;"></span><span style="position:relative;">❯ Tamam Raşit, başlayalım</span></button>';
  h+='<p style="margin:0;text-align:center;font-size:var(--f-caption2);line-height:1.5;color:'+P.privacy+';">Günlüğün önce bu cihazda saklanır. Yedekleme ancak sen bağlarsan açılır; kontrol her zaman sende kalır. 🔒</p>';
  h+='</div>';
  h+='</div>';
  return h;

  }

  function bugunHTML(){
    var data=liveData();
    var DAILY=call('daily',[]);
  var today=todayStr();
  var ed=editing();
  var viewDate=activeDate();
  var curRaw=dayIndexFor(viewDate);
  var curIdx=Math.max(1,curRaw);
  var streak=currentStreak();
  var rec=data.days[viewDate]||null;
  var completed=countRec(rec);
  var circ=2*Math.PI*42;
  var ht=habitCountOn(viewDate);
  var badge=gununHavasi(completed, ht, curIdx);
  var pct=Math.round(completed/ht*100);
  var off=circ*(1-completed/ht);
  var _hr=new Date().getHours();
  var _greet=(_hr>=5&&_hr<11)?'Günaydın':(_hr<18)?'İyi günler':(_hr<22)?'İyi akşamlar':'İyi geceler';

  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  // ── En üst: repoya bağlan şeridi → hava (Günışığı) → Raşit'in sözü → konum → hero ──
  if(!ed){
    h+=dailyPhotoCardHTML(); // Günün Fotoğrafı — günün ilk kartı, her zaman açık
    h+=saveBanner();
    if(shouldShowAeonNotifyBanner()) h+=aeonNotifyBannerHTML({context:'bugun'});
    h+=locationCardHTML(); // Konum & Hareket: repoya bağlan şeridinin hemen altında
    if(!vacationCardHidden()) h+=vacationCardHTML(); // Tatil Modu — kullanıcı isterse Ayarlar'dan geri getirir
    h+=weatherHeaderHTML(_greet);
    h+=journalLightCardHTML(rec, streak); // Günlük Işığı — Günışığı hava kartının hemen altında
    h+=reminderInboxCardHTML(); // REM-12 — native kanal olmadan bugünün sakin inbox yüzeyi
    h+=rasitBubbleHTML(curIdx);
    h+=rasitContactHTML(); // Raşit'e yaz / ara — notlar kartının hemen altında (premium ikili)
  }
  // ── HERO: bugünün canlı özeti (dashboard) · niyet vurgulu ──
  h+='<div class="surface" style="border-radius:26px;padding:18px;box-shadow:0 10px 28px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:15px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  h+='<div><div style="font-size:var(--f-footnote);letter-spacing:1px;color:var(--faint);font-weight:700;">ŞEYMA 🦩</div><div style="font-size:var(--f-subhead);color:var(--muted);margin-top:3px;">'+(ed?esc(dateLabelTR(viewDate)):'Minik Denge Günlüğü')+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<div style="background:rgba(201,184,255,0.28);color:var(--choc);font-weight:700;font-size:var(--f-footnote);padding:7px 13px;border-radius:999px;white-space:nowrap;display:flex;align-items:center;gap:5px;">Gün '+curIdx+(!ed&&streak>1?('<span style="display:inline-flex;align-items:center;gap:2px;">'+icon('flame',13)+streak+'</span>'):'')+'</div></div></div>';
  h+='<div style="display:flex;align-items:center;gap:18px;">';
  h+='<div id="sey-habits-ring-wrap" style="position:relative;width:96px;height:96px;flex-shrink:0;"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="9"></circle><circle class="sey-ring-seg" cx="48" cy="48" r="42" fill="none" stroke="#E9AFC1" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)"></circle></svg>';
  h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:var(--f-title1);font-weight:800;line-height:1;">'+pct+'%</div><div style="font-size:var(--f-caption2);color:var(--faint);margin-top:2px;">'+(ed?'o gün':'bugün')+'</div></div></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);color:var(--faint);margin-bottom:6px;">'+(ed?'O günün havası':'Bugünün havası')+'</div><div style="font-size:var(--f-title3);font-weight:800;line-height:1.25;">'+esc(badge)+'</div><div style="font-size:var(--f-caption1);color:var(--muted);margin-top:5px;font-weight:600;">'+completed+'/'+ht+' tik bugün</div></div></div>';
  // premium istatistik şeridi (seri · 7 günlük ritim · mod eğilimi · en güçlü/zayıf tik)
  h+=heroPremiumStatsHTML(viewDate);
  // bugünkü girdi özeti (Mod · Su · Uyku · Adım)
  h+=heroStatsHTML(rec);
  // en önemli hedeflerin özet görünümü (Kalori · Protein · Su · Adım)
  h+=heroTargetsHTML(rec);
  // ── Niyet + bilimsel mikro-bilgi — hafif, üstten ayraçlı (fazla çerçeve yok) ──
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:13px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;flex-direction:column;gap:7px;">';
  h+='<div style="display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('target',15)+'</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:1px;color:var(--accent-ink);">'+(ed?'O GÜNÜN NİYETİ':'BUGÜNÜN NİYETİ')+'</span></div>';
  h+='<input type="text" value="'+esc(rec&&rec.intention?rec.intention:'')+'" oninput="App.onIntention(this)" placeholder="'+(ed?'O günün niyeti…':'örn. Bugün kendime nazik olacağım')+'" maxlength="140" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px 13px;font-size:var(--f-subhead);font-weight:700;outline:none;color:var(--text);">';
  h+='</div>';
  h+=heroScienceLine(rec);
  h+='</div>';
  h+='</div>';

  // Terapi Odası — hero'nun hemen altında
  if(!ed){ h+=motivationTodayCardHTML(); }

  // Raşit'in Kriz Odaları — üçlü buton (tatlı · yemek · kahve), her biri modal açar
  if(!ed) h+=rasitActionsHTML();

  // Zihnini besleyen hub kutucukları — bugünün modu kartının hemen üstünde
  if(!ed) h+=hubTilesHTML();

  // Dünkü magnezyum etkisi geri bildirimi
  if(!ed) h+=magnesiumFeedbackHTML(viewDate);

  // Magnezyum Danışmanı — bugünün modu kartının hemen üstünde
  if(!ed) h+=magnesiumBannerHTML(viewDate);

  // Bugünün modu
  h+=moodCardHTML(rec);

  // daily banner (distinct) — Motivasyon V2.1 devredeyken bu eski kart tekrar
  // eden bir "gunun mesaji" olarak kafa karistirmasin diye gosterilmez; DAILY
  // dizisi ve render kodu silinmedi, yalnizca V2 yokken devrede kalan bir
  // yedek (fallback) haline geldi.
  if(!motivationProgramV2()){
    h+='<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#FFE19A,#FFC9A3 55%,#F7B7C9);border-radius:24px;padding:22px 22px 20px;box-shadow:0 12px 28px rgba(255,180,140,0.32);">';
    h+='<div style="position:absolute;top:-26px;right:10px;font-size:130px;line-height:1;font-weight:800;color:#fff;opacity:0.22;">\u201d</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;position:relative;"><span style="display:inline-flex;">'+icon('sun',16)+'</span><span style="font-size:var(--f-caption1);letter-spacing:1.5px;font-weight:800;color:#9A5A3C;">GÜNÜN MESAJI</span></div>';
    h+='<div style="position:relative;font-size:var(--f-title3);font-weight:800;line-height:1.36;color:#5A2E2A;">'+esc(DAILY[(curIdx-1)%DAILY.length])+'</div></div>';
  }

  // günün niyeti artık hero kartının içinde (yukarıda).


  if(!ed){
  // akşam nudge (yalnızca gece, okuma eklenmediyse)
  h+=eveningNudge(rec);
  }

  // Bugünün tikleri (açılır kart)
  h+=habitsCardHTML(rec);

  // akşam adım hatırlatması (yalnızca akşam, bugünün adımı boşsa)
  if(!ed) h+=stepReminder(rec);

  // Beslenme — özet (makro) + "ne yedim" birleşik açılır kart
  h+=beslenmeCardHTML(rec);

  // su
  h+=waterCard(rec);

  // Günün yansıması — kendine not + 3 güzel şey, birleşik premium açılır kart
  h+=reflectionCardHTML(rec);

  // dağıldı
  if(!ed) h+=onThisDayCard();
  if(!ed) h+='<button data-fx="open" onclick="App.openEmergency()" style="border:1px dashed rgba(150,110,120,0.3);background:var(--card);cursor:pointer;width:100%;padding:14px;border-radius:18px;font-size:var(--f-subhead);font-weight:600;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:6px;">Bugün biraz dağıldı '+icon('heart-handshake',15)+'</button>';
  h+='</div>';
  return h;

  }

  // Domain registry gövdeleri burada yeniden üretilmez. app.js resolverları domain
  // kayıtlarını sabitler; modal/focus sahipliği ile app-owned writerlar app.js'te kalır.
  function saglikHTML(){ return healthTabHTML.apply(null,arguments); }
  function raporHTML(){ return reportTabHTML.apply(null,arguments); }
  function haritaHTML(){ return mapTabHTML.apply(null,arguments); }
  function saygiHTML(){ return saygiTabHTML.apply(null,arguments); }
  function roomOverlayHTML(){ return roomOverlayEntryHTML.apply(null,arguments); }
  function readingOverlayHTML(){ return readingOverlayEntryHTML.apply(null,arguments); }
  function watchOverlayHTML(){ return watchOverlayEntryHTML.apply(null,arguments); }
  function listeningOverlayHTML(){ return listeningOverlayEntryHTML.apply(null,arguments); }
  function learningOverlayHTML(){ return learningOverlayEntryHTML.apply(null,arguments); }
  function soulPracticePickerHTML(){ return soulPracticePickerEntryHTML.apply(null,arguments); }
  function soulActivityOverlayHTML(){ return soulActivityOverlayEntryHTML.apply(null,arguments); }
  function soulArchiveOverlayHTML(){ return soulArchiveOverlayEntryHTML.apply(null,arguments); }
  function ayarlarHTML(){ return settingsTabHTML.apply(null,arguments); }
  function mesajHTML(){ return messageTabHTML.apply(null,arguments); }

  window.SeymaRender={
    registerRender:registerRender,
    onboardingHTML:onboardingHTML,
    bugunHTML:bugunHTML,
    saglikHTML:saglikHTML,
    raporHTML:raporHTML,
    haritaHTML:haritaHTML,
    saygiHTML:saygiHTML,
    motivationTodayCardHTML:motivationTodayCardHTML,
    roomOverlayHTML:roomOverlayHTML,
    readingOverlayHTML:readingOverlayHTML,
    watchOverlayHTML:watchOverlayHTML,
    listeningOverlayHTML:listeningOverlayHTML,
    learningOverlayHTML:learningOverlayHTML,
    soulPracticePickerHTML:soulPracticePickerHTML,
    soulActivityOverlayHTML:soulActivityOverlayHTML,
    soulArchiveOverlayHTML:soulArchiveOverlayHTML,
    ayarlarHTML:ayarlarHTML,
    mesajHTML:mesajHTML,
    appHeaderHTML:appHeaderHTML,
    navHTML:navHTML,
    overlayShell:overlayShellEntryHTML,
    soulOverlayShell:soulOverlayShellEntryHTML,
    modalsHTML:modalsHTML,
    render:render
  };
})();
