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
    'zikrV2Visible',
    // MON2-05: taşınan *HTML gövdelerinin sabit/yardımcı bağımlılıkları
    'AEON_ICON_URL','DERIVED_ACCENT','DERIVED_HABITS','HABITS','MOODS','NOTES','QURAN_DEFAULT_SURAH_ID','QURAN_FILTERS','QURAN_VIDEO_ID_RE','REFLECT_PROMPTS','SHORT_HABIT','TEL','VACATION_WATER_GOAL','WA','addDays','allDays','calGoal','carbsGoal','cardOpen','collapsibleCardHTML','dayNutrition','derivedProgText','diffDays','effSteps','energyStressBlock','ensureQuranJourney','ensureVacationSettings','ensureZikrRoot','fmtDateNice','getStats','habitProgress','heroStatTile','hexA','isIOS','isStandalonePWA','isVacationDay','moodInterp','proteinGoal','psychFlat','psychMotiv','psychOptions','quranActiveFilter','quranActiveVerse','quranCanRequest','quranCatalog','quranDetailAction','quranEmbedOrigin','quranFilterCounts','quranFilterLabel','quranFilteredSurahs','quranJourneyCardCopy','quranJourneyStats','quranNoteDraftFor','quranNoteKindMeta','quranNoteTimeLabel','quranPlaceDisputed','quranPlaceLabel','quranPreviewToneOf','quranQuestionAction','quranRequestOf','quranRowState','quranSortNotes','quranStatusNote','quranSurah','quranTotal','quranVideoThumbUrl','quranViewBodyHTML','rasitNoteIdx','shortDate','sleepGoalHours','stepsGoal','waterGoalCups','weekBlock','zikrActivePreset','zikrViewBodyHTML','find'
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
  function locationCardHTML(){ return call('locationCardHTML',arguments); }
  function vacationCardHidden(){ return call('vacationCardHidden',arguments); }
  function weatherHeaderHTML(){ return call('weatherHeaderHTML',arguments); }
  function journalLightCardHTML(){ return call('journalLightCardHTML',arguments); }
  function reminderInboxCardHTML(){ return call('reminderInboxCardHTML',arguments); }
  function dateLabelTR(){ return call('dateLabelTR',arguments); }
  function heroScienceLine(){ return call('heroScienceLine',arguments); }
  function motivationTodayCardHTML(){ return call('motivationTodayEntryHTML',arguments); }
  function rasitActionsHTML(){ return call('rasitActionsHTML',arguments); }
  function magnesiumFeedbackHTML(){ return call('magnesiumFeedbackHTML',arguments); }
  function magnesiumBannerHTML(){ return call('magnesiumBannerHTML',arguments); }
  function motivationProgramV2(){ return call('motivationProgramV2',[]); }
  function eveningNudge(){ return call('eveningNudge',arguments); }
  function stepReminder(){ return call('stepReminder',arguments); }
  function beslenmeCardHTML(){ return call('beslenmeCardHTML',arguments); }
  function waterCard(){ return call('waterCard',arguments); }
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
  function crisisModalHTML(){ return call('crisisModalHTML',arguments); }
  function editBanner(){ return call('editBanner',arguments); }
  function ensureProfileAssessment(){ return call('ensureProfileAssessment',arguments); }
  function faithCornerOverlayHTML(){ return call('faithCornerOverlayHTML',arguments); }
  function journalModalHTML(){ return call('journalModalHTML',arguments); }
  function locationGateRequired(){ return call('locationGateRequired',arguments); }
  function maybeFetchDailyPhoto(){ return call('maybeFetchDailyPhoto',arguments); }
  function mountSkyCanvas(){ return call('mountSkyCanvas',arguments); }
  function needsAuth(){ return call('needsAuth',arguments); }
  function paintAmbientShell(){ return call('paintAmbientShell',arguments); }
  function qiblaOverlayHTML(){ return call('qiblaOverlayHTML',arguments); }
  function reminderActiveElementId(){ return call('reminderActiveElementId',arguments); }
  function reminderCenterOverlayHTML(){ return call('reminderCenterOverlayHTML',arguments); }
  function reminderRestoreFocus(){ return call('reminderRestoreFocus',arguments); }
  function renderProfileAssessmentGate(){ return call('renderProfileAssessmentGate',arguments); }
  function saygiDisconnectReadObserver(){ return call('saygiDisconnectReadObserver',arguments); }
  function saygiFloatingReadHTML(){ return call('saygiFloatingReadHTML',arguments); }
  function saygiPersonModalHTML(){ return call('saygiPersonModalHTML',arguments); }
  function wireAppHeaderScroll(){ return call('wireAppHeaderScroll',arguments); }
  function wireSaygiReadGate(){ return call('wireSaygiReadGate',arguments); }
  function locBenefits(){ return call('locBenefits',arguments); }
  function renderState(){ return call('renderState',arguments); }
  function zikrV2Visible(){ return call('zikrV2Visible',arguments); }
  // MON2-05: taşınan gövdelerin app.js tarafındaki yardımcı çağrıları
  function addDays(){ return call('addDays',arguments); }
  function allDays(){ return call('allDays',arguments); }
  function calGoal(){ return call('calGoal',arguments); }
  function carbsGoal(){ return call('carbsGoal',arguments); }
  function cardOpen(){ return call('cardOpen',arguments); }
  function collapsibleCardHTML(){ return call('collapsibleCardHTML',arguments); }
  function dayNutrition(){ return call('dayNutrition',arguments); }
  function derivedProgText(){ return call('derivedProgText',arguments); }
  function diffDays(){ return call('diffDays',arguments); }
  function effSteps(){ return call('effSteps',arguments); }
  function energyStressBlock(){ return call('energyStressBlock',arguments); }
  function ensureQuranJourney(){ return call('ensureQuranJourney',arguments); }
  function ensureVacationSettings(){ return call('ensureVacationSettings',arguments); }
  function ensureZikrRoot(){ return call('ensureZikrRoot',arguments); }
  function fmtDateNice(){ return call('fmtDateNice',arguments); }
  function getStats(){ return call('getStats',arguments); }
  function habitProgress(){ return call('habitProgress',arguments); }
  function heroStatTile(){ return call('heroStatTile',arguments); }
  function hexA(){ return call('hexA',arguments); }
  function isIOS(){ return call('isIOS',arguments); }
  function isStandalonePWA(){ return call('isStandalonePWA',arguments); }
  function isVacationDay(){ return call('isVacationDay',arguments); }
  function moodInterp(){ return call('moodInterp',arguments); }
  function proteinGoal(){ return call('proteinGoal',arguments); }
  function psychFlat(){ return call('psychFlat',arguments); }
  function psychMotiv(){ return call('psychMotiv',arguments); }
  function psychOptions(){ return call('psychOptions',arguments); }
  function quranActiveFilter(){ return call('quranActiveFilter',arguments); }
  function quranActiveVerse(){ return call('quranActiveVerse',arguments); }
  function quranCanRequest(){ return call('quranCanRequest',arguments); }
  function quranCatalog(){ return call('quranCatalog',arguments); }
  function quranDetailAction(){ return call('quranDetailAction',arguments); }
  function quranEmbedOrigin(){ return call('quranEmbedOrigin',arguments); }
  function quranFilterCounts(){ return call('quranFilterCounts',arguments); }
  function quranFilterLabel(){ return call('quranFilterLabel',arguments); }
  function quranFilteredSurahs(){ return call('quranFilteredSurahs',arguments); }
  function quranJourneyCardCopy(){ return call('quranJourneyCardCopy',arguments); }
  function quranJourneyStats(){ return call('quranJourneyStats',arguments); }
  function quranNoteDraftFor(){ return call('quranNoteDraftFor',arguments); }
  function quranNoteKindMeta(){ return call('quranNoteKindMeta',arguments); }
  function quranNoteTimeLabel(){ return call('quranNoteTimeLabel',arguments); }
  function quranPlaceDisputed(){ return call('quranPlaceDisputed',arguments); }
  function quranPlaceLabel(){ return call('quranPlaceLabel',arguments); }
  function quranPreviewToneOf(){ return call('quranPreviewToneOf',arguments); }
  function quranQuestionAction(){ return call('quranQuestionAction',arguments); }
  function find(){ return call('find',arguments); }
  function quranRequestOf(){ return call('quranRequestOf',arguments); }
  function quranRowState(){ return call('quranRowState',arguments); }
  function quranSortNotes(){ return call('quranSortNotes',arguments); }
  function quranStatusNote(){ return call('quranStatusNote',arguments); }
  function quranSurah(){ return call('quranSurah',arguments); }
  function quranTotal(){ return call('quranTotal',arguments); }
  function quranVideoThumbUrl(){ return call('quranVideoThumbUrl',arguments); }
  function quranViewBodyHTML(){ return call('quranViewBodyHTML',arguments); }
  function rasitNoteIdx(){ return call('rasitNoteIdx',arguments); }
  function shortDate(){ return call('shortDate',arguments); }
  function sleepGoalHours(){ return call('sleepGoalHours',arguments); }
  function stepsGoal(){ return call('stepsGoal',arguments); }
  function waterGoalCups(){ return call('waterGoalCups',arguments); }
  function weekBlock(){ return call('weekBlock',arguments); }
  function zikrActivePreset(){ return call('zikrActivePreset',arguments); }
  function zikrViewBodyHTML(){ return call('zikrViewBodyHTML',arguments); }

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
  // v3.0 boot screen: dark → mevcut super-black, light → sıcak "delight" karşılığı.
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
  // HERO — Şeyma rozeti (korunur) + imza + "super-black" alt-imza + v3.0 vurgusu
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
  h+='<div style="position:relative;width:90px;height:90px;border-radius:28px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#FFE8A3,#F7DDE5 52%,#E9CBFF);box-shadow:0 22px 52px rgba(230,193,90,0.28),0 0 0 1px rgba(255,255,255,0.10),inset 0 1.5px 0 rgba(255,255,255,0.7);overflow:hidden;animation:seyPop .6s var(--ease-premium,ease) both;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 3.8s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;font-size:48px;line-height:1;filter:drop-shadow(0 8px 14px rgba(190,108,139,0.4));">🦩</span></div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;animation:seyFloatIn .5s .06s ease both;"><span class="sey-wordmark" style="font-size:44px;background:'+P.wordGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.wordShadow+';">Şeyma</span><span class="sey-wordmark-flam" style="font-size:var(--f-title1);">🦩</span></div>';
  // "super-black" — imza fontunda metalik gümüş alt-imza
  h+='<div style="display:flex;align-items:center;gap:9px;margin-top:-4px;animation:seyFloatIn .5s .09s ease both;"><span style="width:26px;height:1px;background:linear-gradient(90deg,transparent,'+P.metal+');"></span><span class="sey-wordmark" style="font-size:var(--f-title1);background:'+P.superGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.superShadow+';">'+P.mode+'</span><span style="width:26px;height:1px;background:linear-gradient(90deg,'+P.metal+',transparent);"></span></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-top:2px;animation:seyFloatIn .5s .12s ease both;"><span style="font-size:var(--f-caption1);letter-spacing:1.5px;color:'+P.tag+';text-transform:uppercase;">minik denge günlüğü</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.5px;color:#140C10;background:linear-gradient(135deg,#F2D98C,#E9AEC6);border-radius:999px;padding:3px 11px;box-shadow:0 6px 18px rgba(230,193,90,0.20);">v3.0</span></div>';
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

// MON2-05: app.js'ten taşınan >2 satırlık *HTML builder gövdeleri (app.js 1-liner shim ile çağırır).

function habitRowHTML(o){
  var dark=liveDark();
  var bg=o.done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):(o.locked?hexA(o.accent,dark?0.07:0.05):'var(--card)');
  var bd=o.done?'rgba(233,175,193,0.9)':(o.warn?'var(--warn)':(o.locked?hexA(o.accent,0.4):'var(--card-bd)'));
  var sh=o.done?'0 10px 26px rgba(233,175,193,0.4)':(o.locked?'0 6px 16px '+hexA(o.accent,0.12):'0 6px 16px rgba(108,74,58,0.06)');
  var h='';
  h+='<button onclick="'+esc(o.onclick)+'"'+(o.warn?' class="sey-habit-warn"':'')+' style="display:flex;align-items:center;gap:13px;padding:14px;width:100%;text-align:left;cursor:pointer;border-radius:20px;color:var(--text);border:1px solid '+bd+';background:'+bg+';box-shadow:'+sh+';transform:scale('+(o.pulsing?'1.03':'1')+');transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,background .25s,border-color .25s;">';
  h+='<div style="width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:'+(o.locked?hexA(o.accent,0.12):'var(--icon)')+';color:'+(o.locked?o.accent:'var(--text)')+';">'+o.icon+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:700;line-height:1.25;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+esc(o.title)+(o.derived?'<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.6px;color:'+(o.done?'#3F8A4F':o.accent)+';background:'+(o.done?'rgba(143,191,138,0.2)':hexA(o.accent,0.14))+';border-radius:6px;padding:1.5px 5px;">OTO</span>':'')+'</div>';
  if(o.done){ h+='<div style="font-size:var(--f-footnote);color:var(--accent-ink);font-weight:600;margin-top:4px;line-height:1.35;">'+esc(o.msg)+'</div>'; }
  else if(o.locked){ var pct=Math.min(100,Math.max(0,Math.round(((o.prog.cur||0)/o.prog.goal)*100))); h+='<div style="font-size:var(--f-footnote);color:'+o.accent+';font-weight:600;margin-top:3px;line-height:1.35;">'+esc(derivedProgText(o.key,o.prog))+'</div>'; if(!o.prog.binary){ h+='<div style="height:6px;border-radius:999px;background:'+hexA(o.accent,0.16)+';overflow:hidden;margin-top:7px;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,'+hexA(o.accent,0.65)+','+o.accent+');transition:width .45s cubic-bezier(.34,1.2,.64,1);"></div></div>'; } }
  else { h+='<div style="font-size:var(--f-footnote);color:'+(o.warn?'var(--warn)':'var(--faint)')+';margin-top:3px;line-height:1.35;">'+esc(o.sub)+'</div>'; }
  h+='</div>';
  if(o.done){ h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">'+icon('check',15)+'</div>'; }
  else if(o.locked){ h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:'+hexA(o.accent,0.85)+';border:2px solid '+hexA(o.accent,0.4)+';background:'+hexA(o.accent,0.06)+';">'+icon('lock',12)+'</div>'; }
  else { h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:transparent;border:2px solid '+(o.warn?'var(--warn)':'var(--field-bd)')+ ';"></div>'; }
  h+='</button>';
  return h;
}

function reportHTML(){
  var data=liveData(), MOODS=call('MOODS',[]);
  var st=getStats(); var days=allDays();
  var range=shortDate(data.startDate)+' – '+shortDate(todayStr());
  var h='';
  h+='<div style="text-align:center;padding:30px 0 24px;border-bottom:2px solid #F2E1DA;margin-bottom:26px;">';
  h+='<div style="font-size:var(--f-large);font-weight:800;">Şeyma 🦩</div>';
  h+='<div style="font-size:var(--f-callout);color:#7A6B70;margin-top:6px;">Minik Denge Günlüğü</div>';
  h+='<div style="font-size:var(--f-subhead);color:#9C8C92;margin-top:12px;">'+range+'</div>';
  h+='<div style="font-size:var(--f-subhead);color:#6B4A3A;margin-top:10px;font-style:italic;">Diyet değil. Küçük kontrol notları.</div></div>';
  h+='<div style="font-size:var(--f-title3);font-weight:800;margin:0 0 14px;">Özet</div>';
  var stats=[['Toplam tamamlanan tik',st.total],['Tatlı kontrolü günü',st.tot.sweetManaged],['Akşam kontrolü günü',st.tot.eveningControl],['Yürüyüş günü',st.tot.walked20],['Protein günü',st.tot.protein],['Su günü',st.tot.water],['D₃K₂ damla günü',st.tot.vitaminD],['Kendine iyi davranma günü',st.tot.selfKind],['En iyi seri',st.best+' gün'],['En sık mod',st.mood]];
  h+='<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;">';
  stats.forEach(function(s){ h+='<div style="flex:1 1 30%;min-width:150px;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:12px 14px;"><div style="font-size:var(--f-caption1);color:#9C8C92;">'+esc(s[0])+'</div><div style="font-size:var(--f-title3);font-weight:800;margin-top:3px;">'+esc(s[1])+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:var(--f-title3);font-weight:800;margin:0 0 14px;">İlk 3 Hafta</div><div style="display:flex;gap:12px;margin-bottom:26px;">';
  [0,1,2].forEach(function(w){ var b=weekBlock(w,days); h+='<div style="flex:1;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:14px;"><div style="font-size:var(--f-subhead);font-weight:800;margin-bottom:8px;">'+esc(b.title)+'</div>'; b.rows.forEach(function(r){ h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-caption1);margin-bottom:5px;"><span style="color:#5A4D52;">'+esc(r.label)+'</span><b>'+esc(r.val)+'</b></div>'; }); h+='<div style="font-size:var(--f-caption2);color:#7A6B70;margin-top:6px;border-top:1px solid #F2E1DA;padding-top:6px;">Ort. '+esc(b.avg)+' · Seri '+esc(b.best)+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:var(--f-title3);font-weight:800;margin:0 0 14px;">Günlük Tablo (tüm kayıt)</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:var(--f-caption1);margin-bottom:24px;"><thead><tr style="background:#F7DDE5;">';
  ['Gün','Tarih','Tik','Mod','Adım','Uyku','Kriz','Kısa not'].forEach(function(x){ h+='<th style="text-align:left;padding:7px 9px;border:1px solid #F2E1DA;">'+x+'</th>'; });
  h+='</tr></thead><tbody>';
  days.forEach(function(o){ var rec=o.rec; var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null; var esr=effSteps(rec); var st=esr.steps!=null?(esr.steps.toLocaleString('tr-TR')+(esr.source==='tracked'?'~':'')):'—'; var sh=(rec&&rec.sleep&&rec.sleep.hours!=null)?(rec.sleep.hours+' sa'):'—'; h+='<tr><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+o.i+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+shortDate(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+countRec(rec)+'/'+habitCountOn(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(mood?esc(mood.short):'—')+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(st)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(sh)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(rec?rec.cravingSOSCount||0:0)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc((rec&&rec.note)?String(rec.note).slice(0,42):'')+'</td></tr>'; });
  h+='</tbody></table>';
  h+='<div style="background:#FFE8A3;border-radius:12px;padding:18px;text-align:center;font-size:var(--f-subhead);font-weight:600;color:#6B4A3A;">Küçük seçimler görünmez gibi durur ama birikince ritim olur.</div>';
  return h;
}

function authGateHTML(){
  var data=liveData(), ui=liveUi();
  var remember=!!ui.authRemember;
  var preview=(data&&data.settings&&data.settings.auth&&data.settings.auth.usernameMask)?data.settings.auth.usernameMask:'';
  var shake=ui.authError?' sey-auth-shake':'';
  var errorBlock=ui.authError?('<div id="sey-auth-error" class="sey-auth-error" style="display:block;">'+esc(ui.authErrorMsg||'Kullanıcı adı veya parola eşleşmedi. Tekrar dene, gözün korkmasın.')+'</div>'):'';
  var rememberIcon=remember?'☑':'☐';
  var previewBlock=preview?'<div class="sey-auth-preview">Hatırlatma: kullanıcı adın <b>'+esc(preview)+'</b></div>':'';
  return '<div class="sey-auth-backdrop'+shake+'">'
    +'<div class="sey-auth-glow"></div>'
    +'<div class="sey-auth-card">'
      +'<div class="sey-auth-mascot">🦩</div>'
      +'<h1 class="sey-auth-title">Sevgili Günışığı</h1>'
      +'<p class="sey-auth-subtitle">Günışığı kapısı seni bekliyor</p>'
      +previewBlock
      +'<div class="sey-auth-field">'
        +'<label for="sey-auth-user">Kullanıcı adı</label>'
        +'<input id="sey-auth-user" type="text" autocomplete="username" placeholder="Kullanıcı adın" />'
      +'</div>'
      +'<div class="sey-auth-field">'
        +'<label for="sey-auth-pass">Parola</label>'
        +'<input id="sey-auth-pass" type="password" autocomplete="current-password" placeholder="Parolan" />'
      +'</div>'
      +'<div class="sey-auth-options">'
        +'<span class="sey-auth-remember" onclick="App.toggleRememberAuth()">'+rememberIcon+' Beni hatırla</span>'
        +'<span class="sey-auth-hint">Aynı değer her iki alana da yazılır</span>'
      +'</div>'
      +errorBlock
      +'<button class="sey-auth-btn" onclick="App.submitAuth()">Giriş yap ✨</button>'
      +'<p class="sey-auth-footer">Unutursan parola kullanıcı adınla aynıdır.</p>'
    +'</div>'
  +'</div>';
}

function locationGateHTML(){
  var ui=liveUi();
  var state=ui.locationGateState||'required';
  var busy=state==='requesting';
  var title=state==='denied'?'Safari’de konum izni kapalı':state==='unavailable'?'Konum doğrulanamadı':state==='unsupported'?'Konum desteği gerekli':state==='checking'?'Konum izni doğrulanıyor…':'Şeyma için konum izni gerekli';
  var detail=state==='denied'?'Şeyma’nın ana ekranını açmak için Safari’de bu siteye konum izni vermelisin.':state==='unavailable'?'İzin süreci açık görünüyor ama cihazdan geçerli bir konum alınamadı.':state==='unsupported'?'Bu cihaz veya tarayıcı konum hizmetini sunmadan Şeyma devam edemez.':'Konum izni olmadan günlük, sağlık ve diğer uygulama bölümleri açılmaz.';
  var copy=ui.locationGateError||'Konum yalnızca Şeyma açıkken ölçülür; dilediğinde Safari ayarlarından kapatabilirsin.';
  var help='';
  if(state==='denied'){
    var steps=isIOS()?(isStandalonePWA()?'Ayarlar → Şeyma → Konum → “Uygulamayı Kullanırken”':'Safari’de aA → Web Sitesi Ayarları → Konum → İzin Ver'):'Tarayıcı site ayarları → Konum → İzin Ver';
    help='<div style="margin-top:16px;border:1px solid var(--field-bd);background:var(--field);border-radius:16px;padding:12px 13px;text-align:left;"><div style="font-size:var(--f-caption2);letter-spacing:.7px;font-weight:800;color:var(--faint);margin-bottom:5px;">SAFARİ AYARLARI</div><div style="font-size:var(--f-footnote);line-height:1.45;color:var(--text2);">'+esc(steps)+'</div><div style="font-size:var(--f-caption2);line-height:1.45;color:var(--faint);margin-top:5px;">Ayarı değiştirdikten sonra buraya dönüp tekrar dene.</div></div>';
  }
  var button=busy?'Safari izin ekranı bekleniyor…':state==='checking'?'Konum iznini yeniden doğrula':state==='denied'?'İzin verildi, tekrar dene':state==='unsupported'?'Safari desteğini yeniden kontrol et':'Safari’de konum iznini aç';
  return '<div id="sey-location-gate" data-location-gate-state="'+esc(state)+'" role="dialog" aria-modal="true" aria-labelledby="sey-location-gate-title" tabindex="-1" style="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;background:var(--page);color:var(--text);">'
    +'<div style="width:100%;max-width:410px;border:1px solid var(--card-bd);border-radius:28px;padding:26px 22px 22px;background:var(--modal);box-shadow:0 24px 70px rgba(0,0,0,.22);text-align:center;backdrop-filter:blur(18px);">'
      +'<div style="font-size:42px;line-height:1;margin-bottom:13px;">📍</div>'
      +'<div style="font-size:var(--f-caption2);letter-spacing:1.3px;font-weight:900;color:var(--faint);margin-bottom:8px;">ŞEYMA · GÜVENLİ BAŞLANGIÇ</div>'
      +'<h1 id="sey-location-gate-title" style="margin:0;font-size:var(--f-title2);line-height:1.2;font-weight:850;color:var(--text);">'+esc(title)+'</h1>'
      +'<p style="margin:12px 0 0;font-size:var(--f-subhead);line-height:1.55;color:var(--muted);">'+esc(detail)+'</p>'
      +'<div style="margin-top:15px;padding:12px 13px;border-radius:15px;background:color-mix(in srgb,#8FBF8A 14%,var(--modal));border:1px solid color-mix(in srgb,#6FB36A 28%,var(--card-bd));font-size:var(--f-footnote);line-height:1.5;color:var(--text2);text-align:left;">Konum ve hareket ölçümü yalnızca uygulama açıkken yapılır. Safari’nin izin penceresinde <b>İzin Ver</b> seçilmeden devam edilemez.</div>'
      +(state==='denied'||state==='unavailable'||state==='unsupported'?'<div role="alert" style="margin-top:12px;font-size:var(--f-footnote);line-height:1.45;color:#A34F4D;">'+esc(copy)+'</div>':'')
      +help
      +'<button type="button" onclick="App.requestLocationGatePermission()" '+(busy?'disabled':'')+' style="margin-top:19px;border:none;cursor:'+(busy?'wait':'pointer')+';width:100%;padding:15px 16px;border-radius:16px;font-size:var(--f-subhead);font-weight:850;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);box-shadow:0 10px 24px rgba(111,179,106,.34);">'+esc(button)+'</button>'
      +'<div style="margin-top:12px;font-size:var(--f-caption2);line-height:1.45;color:var(--faint);">Bu izin verilmeden günlük kayıtların ve diğer bölümlerin içeriği açılmaz.</div>'
    +'</div>'
  +'</div>';
}

function psychSosHTML(){
  var ui=liveUi();
  var sent=!!ui.psychSosSent;
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center;padding:6px 6px 12px;">';
  h+='<div style="width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:38px;background:linear-gradient(135deg,#FFD9E1,#C9B8FF);box-shadow:0 12px 30px rgba(233,175,193,0.45);animation:seyPop .35s ease;display:flex;align-items:center;justify-content:center;">'+(sent?icon('heart',34):icon('heart-handshake',34))+'</div>';
  if(!sent){
    h+='<h2 style="margin:0;font-size:var(--f-title2);font-weight:800;">Yalnız değilsin</h2>';
    h+='<p style="margin:0;font-size:var(--f-callout);line-height:1.6;color:var(--text2);max-width:350px;">Şu an zorlanıyorsan bunu tek başına taşımak zorunda değilsin. Aşağıdaki butona dokunursan Raşit’e <b>doğrudan</b> haber gider ve en kısa sürede yanında olur.</p>';
    h+='<button onclick="App.psychReachCreator()" style="border:none;cursor:pointer;width:100%;max-width:360px;padding:16px 18px;border-radius:20px;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:var(--f-callout);font-weight:800;">Zor hissediyorum Raşit</span><span style="font-size:var(--f-caption1);font-weight:600;opacity:0.92;">Bu buton yaratıcıya — Raşit’in tüm cihazlarını — doğrudan tetikler</span></button>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:360px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:var(--f-callout);font-weight:800;box-shadow:0 6px 14px rgba(233,175,193,0.2);">'+icon('phone',16)+' Raşit’i ara</a>';
    h+='<div class="surface" style="border-radius:20px;padding:14px 16px;max-width:360px;"><p style="margin:0;font-size:var(--f-footnote);line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>’yi ara. Tek başına taşımak zorunda değilsin.</p></div>';
  } else {
    h+='<h2 style="margin:0;font-size:var(--f-title2);font-weight:800;">Raşit’e haber verildi</h2>';
    h+='<p style="margin:0;font-size:var(--f-callout);line-height:1.6;color:var(--text2);max-width:350px;">Doğrudan bir bildirim gönderildi — birazdan yanında olacak. Derin bir nefes al; buradayım.</p>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:360px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:var(--f-callout);font-weight:800;box-shadow:0 6px 14px rgba(233,175,193,0.2);">'+icon('phone',16)+' Raşit’i ara</a>';
    h+='<div class="surface" style="border-radius:20px;padding:14px 16px;max-width:360px;"><p style="margin:0;font-size:var(--f-footnote);line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>’yi ara. Tek başına taşımak zorunda değilsin.</p></div>';
  }
  h+='</div>';
  return h;
}

function psychHTML(){
  var ui=liveUi();
  if(!ui.psychAnswers) ui.psychAnswers={};
  if(ui.psychStep==null) ui.psychStep=0;
  var flat=psychFlat(), T=flat.length;
  if(ui.psychSOS){
    var hs='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 14px) 16px calc(env(safe-area-inset-bottom) + 24px);display:flex;flex-direction:column;gap:14px;">';
    hs+='<button onclick="App.psychSOSClose()" style="align-self:flex-start;border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:9px 15px;font-size:var(--f-subhead);font-weight:700;color:var(--muted);">‹ Ankete dön</button>';
    hs+=psychSosHTML();
    hs+='</div>';
    return hs;
  }
  if(ui.psychStep===0){
    var srcOpen=!!ui.psychShowSrc;
    var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;justify-content:flex-start;padding:calc(env(safe-area-inset-top) + 24px) 22px calc(env(safe-area-inset-bottom) + 26px);gap:17px;">';
    h+='<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:11px;animation:seyFloatIn .5s ease both;">';
    h+='<div style="position:relative;width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;color:#8A6A2E;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);box-shadow:0 14px 34px rgba(233,175,193,0.45);overflow:hidden;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.6s ease-in-out infinite;"></span>'+icon('brain',36)+'</div>';
    h+='<h1 style="margin:0;font-size:var(--f-title1);font-weight:800;letter-spacing:-0.5px;">Seni biraz tanıyalım</h1>';
    h+='<div style="font-size:var(--f-subhead);color:var(--muted);line-height:1.5;">İki haftada bir tekrarlanır — tamamen dokunmayla, hiç yazı yok.</div></div>';
    h+='<div class="surface" style="border-radius:22px;padding:16px 17px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .06s ease both;">';
    h+='<div style="display:flex;gap:12px;align-items:flex-start;">';
    h+='<div style="flex-shrink:0;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,var(--aeon2,#E6C15A),var(--aeon,#C99A3A));display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 6px 15px rgba(201,160,60,0.4);">'+icon('hexagon',19)+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;letter-spacing:0.5px;color:#8A6A2E;">ÆON HAZIRLADI</div>';
    h+='<p style="margin:5px 0 0;font-size:var(--f-subhead);line-height:1.6;color:var(--text2);">Bu anketi senin için ben hazırladım — dünyada yaygın kullanılan, <b>bilimsel olarak geçerli</b> tarama araçlarından yararlanarak. Yaratıcımdan bunun için onay aldım.</p></div></div>';
    h+='<button onclick="App.psychToggleSrc()" style="margin-top:12px;width:100%;border:1px solid rgba(201,160,60,0.4);cursor:pointer;background:rgba(230,193,90,0.12);border-radius:12px;padding:9px 12px;font-size:var(--f-footnote);font-weight:700;color:#8A6A2E;display:flex;align-items:center;justify-content:center;gap:6px;">'+(srcOpen?('Kaynakları gizle '+icon('chevron-up',13)):('Kullanılan bilimsel kaynaklar '+icon('chevron-down',13)))+'</button>';
    if(srcOpen){
      var srcs=['ASRS-v1.1 · Dünya Sağlık Örgütü','ECR · Brennan, Clark & Shaver','GAD-7 · Spitzer ve ark.','PHQ-9 · Kroenke ve ark.','WHO-5 · Dünya Sağlık Örgütü','SCS-SF · Kristin Neff'];
      h+='<div style="margin-top:11px;display:flex;flex-direction:column;gap:7px;animation:seyFade .25s ease;">';
      srcs.forEach(function(sr){ h+='<div style="display:flex;gap:9px;align-items:baseline;font-size:var(--f-footnote);line-height:1.4;"><span style="flex-shrink:0;color:#C99A3A;">◆</span><span style="color:var(--text2);flex:1;font-weight:600;">'+esc(sr)+'</span></div>'; });
      h+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:4px;line-height:1.5;">Hepsi kamuya açık / akademik kullanımı serbest, doğrulanmış tarama ölçekleridir.</div></div>';
    }
    h+='</div>';
    h+='<div class="surface" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .12s ease both;">';
    h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.65;color:var(--text2);">Dikkat, yakın ilişkilerde güven, ruh hâli ve kendine şefkat gibi alanlarda seni daha iyi tanımam için. Böylece sana daha isabetli ve nazik eşlik edebilirim.</p>';
    h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.65;color:var(--text2);">Doğru ya da yanlış cevap yok; aklına ilk geleni seç, yeter. Her soru için bir seçeneğe dokunman kâfi — yaklaşık 5 dakika.</p></div>';
    h+='<div style="display:flex;gap:11px;align-items:flex-start;background:rgba(201,184,255,0.14);border:1px solid rgba(201,184,255,0.35);border-radius:16px;padding:13px 14px;animation:seyFloatIn .5s .18s ease both;"><span style="display:inline-flex;">'+icon('heart',16)+'</span><div style="font-size:var(--f-footnote);line-height:1.55;color:var(--text2);"><b>Yanıtların, seni daha iyi tanıyıp sana nazikçe eşlik edebilmem için bana yardımcı olur.</b> Bir karne gibi ortaya dökülüp yargılanmaz; doğru ya da yanlış cevap yok. Bu bir tıbbi teşhis değil, seni tanımaya yarayan bir tarama aracıdır.</div></div>';
    h+='<button onclick="App.psychBegin()" style="border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:var(--f-body);font-weight:800;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);animation:seyFloatIn .5s .24s ease both;display:flex;align-items:center;justify-content:center;gap:6px;">Başlayalım '+icon('sparkles',15)+'</button>';
    h+='<button onclick="App.psychSOS()" style="border:none;cursor:pointer;background:transparent;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum Raşit</button>';
    h+='</div>';
    return h;
  }
  if(ui.psychStep>T) return psychResultHTML();
  var idx=ui.psychStep-1, node=flat[idx], s=node.s, qi=node.qi;
  var cur=(ui.psychAnswers[s.id]&&ui.psychAnswers[s.id][qi]!=null)?ui.psychAnswers[s.id][qi]:null;
  var pct=Math.round(idx/T*100);
  var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 12px) 18px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column;gap:15px;animation:seyFade .22s ease;">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<button onclick="App.psychSOS()" style="flex-shrink:0;border:1px solid rgba(233,175,193,0.5);cursor:pointer;background:rgba(247,221,229,0.4);border-radius:12px;padding:7px 11px;font-size:var(--f-footnote);font-weight:700;color:#B5566A;">Zor an</button>';
  h+='<div style="flex:1;height:9px;border-radius:999px;background:rgba(150,110,120,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9899F,#C9B8FF);transition:width .35s cubic-bezier(.4,1.2,.5,1);position:relative;overflow:hidden;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);animation:seyShine 2.4s ease-in-out infinite;"></span></div></div>';
  h+='<div style="flex-shrink:0;font-size:var(--f-caption1);font-weight:800;color:var(--faint);font-variant-numeric:tabular-nums;">'+(idx+1)+'/'+T+'</div>';
  h+='</div>';
  h+='<div style="font-size:var(--f-footnote);font-weight:700;color:var(--accent-ink);text-align:center;margin-top:-4px;animation:seyFade .45s ease;">'+psychMotiv(idx,T)+'</div>';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-top:2px;"><span style="font-size:var(--f-title3);">'+s.icon+'</span><span style="font-size:var(--f-footnote);font-weight:800;letter-spacing:0.5px;color:var(--accent-ink);text-transform:uppercase;">'+esc(s.title)+'</span></div>';
  if(qi===0) h+='<div style="font-size:var(--f-footnote);line-height:1.5;color:var(--muted);margin-top:-6px;">'+esc(s.intro)+'</div>';
  h+='<div style="animation:seyFloatIn .32s ease both;">';
  h+='<div style="font-size:var(--f-title3);font-weight:700;line-height:1.45;color:var(--text);margin:2px 0 10px;">'+esc(node.item.q)+'</div>';
  h+='<div style="display:inline-flex;align-items:center;gap:7px;background:rgba(233,175,193,0.16);border:1px solid rgba(233,175,193,0.4);border-radius:999px;padding:6px 13px;margin-bottom:11px;font-size:var(--f-footnote);font-weight:700;color:#B5566A;display:inline-flex;align-items:center;gap:5px;">'+icon('search',13)+' '+esc(s.prompt||s.intro)+'</div>';
  h+=psychOptions(s.id,qi,s,cur);
  h+='</div>';
  h+='<div style="margin-top:auto;padding-top:16px;display:flex;align-items:center;">';
  h+='<button onclick="App.psychBack()" style="border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:11px 18px;font-size:var(--f-subhead);font-weight:700;color:var(--muted);">‹ Geri</button>';
  if(cur!=null) h+='<button onclick="App.psychFwd()" style="margin-left:auto;border:none;cursor:pointer;border-radius:14px;padding:11px 22px;font-size:var(--f-subhead);font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 6px 14px rgba(233,175,193,0.35);">İleri ›</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function psychResultHTML(){
  // Sonuçlar Şeyma'ya GÖSTERİLMEZ; yalnızca nazik bir teşekkür + ÆON'un değerlendirdiği bilgisi.
  var h='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 26px) 22px calc(env(safe-area-inset-bottom) + 26px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:18px;animation:seyFade .35s ease;">';
  h+='<div style="position:relative;width:82px;height:82px;border-radius:26px;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);box-shadow:0 14px 34px rgba(233,175,193,0.45);overflow:hidden;animation:seyPop .4s ease;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.6s ease-in-out infinite;"></span>'+icon('flower-2',36)+'</div>';
  h+='<h1 style="margin:0;font-size:var(--f-title1);font-weight:800;letter-spacing:-0.5px;animation:seyFloatIn .5s .05s ease both;display:flex;align-items:center;justify-content:center;gap:8px;">Teşekkürler '+icon('flower-2',22)+'</h1>';
  h+='<div class="surface" style="border-radius:22px;padding:18px;max-width:400px;display:flex;flex-direction:column;gap:13px;box-shadow:0 10px 26px rgba(108,74,58,0.07);animation:seyFloatIn .5s .12s ease both;">';
  h+='<div style="display:flex;gap:11px;align-items:flex-start;text-align:left;">';
  h+='<div style="flex-shrink:0;width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--aeon2,#E6C15A),var(--aeon,#C99A3A));display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 6px 15px rgba(201,160,60,0.4);">'+icon('hexagon',18)+'</div>';
  h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.65;color:var(--text2);">Yanıtlarını aldım. Şimdi bunları senin için sessizce değerlendiriyorum — sana daha iyi eşlik edebilmem için.</p></div>';
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;font-size:var(--f-footnote);line-height:1.6;color:var(--muted);text-align:left;">Bu küçük tanışmayı <b>iki haftada bir</b> tekrarlayacağız; böylece değişimleri birlikte nazikçe fark edebiliriz.</div></div>';
  h+='<button onclick="App.psychFinish()" style="border:none;cursor:pointer;width:100%;max-width:400px;padding:17px;border-radius:20px;font-size:var(--f-body);font-weight:800;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);animation:seyFloatIn .5s .2s ease both;display:flex;align-items:center;justify-content:center;gap:6px;">Uygulamaya dön '+icon('sun',15)+'</button>';
  h+='<button onclick="App.psychSOS()" style="border:none;cursor:pointer;background:transparent;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum Raşit</button>';
  h+='</div>';
  return h;
}

function moodCardHTML(rec){
  var MOODS=call('MOODS',[]);
  var curMood=rec?rec.mood:null, en=rec?rec.energy:null, st=rec?rec.stress:null;
  var allSet=!!(curMood&&en!=null&&st!=null);
  var open=cardOpen('mood', !allSet);
  var ed=editing();
  var mo0=curMood?find(MOODS,'id',curMood):null;
  var badge=mo0?('<span style="display:inline-flex;color:var(--accent-ink);">'+icon(mo0.icon,22)+'</span>'):'';
  var subParts=[];
  if(mo0) subParts.push(esc(mo0.short));
  if(en!=null) subParts.push('Enerji '+en);
  if(st!=null) subParts.push('Stres '+st);
  var subtitle=subParts.length?(subParts.join(' · ')+(allSet?'':' — tamamla')):'modunu, enerji ve stresini paylaş';
  var b='<div style="display:flex;gap:6px;">';
  MOODS.forEach(function(m){
    var sel=curMood===m.id;
    var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 8px 18px rgba(233,175,193,0.4);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
    b+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:11px 4px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;'+style+'"><span style="display:inline-flex;">'+icon(m.icon,22)+'</span><span style="font-size:var(--f-caption2);font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>';
  });
  b+='</div>';
  if(mo0) b+='<div style="font-size:var(--f-subhead);color:var(--text2);background:rgba(255,232,163,0.3);border-radius:14px;padding:10px 12px;line-height:1.4;">'+esc(mo0.resp)+'</div>';
  b+=energyStressBlock(rec);
  var interp=moodInterp(curMood,en,st);
  if(interp) b+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.45;background:linear-gradient(160deg,rgba(201,184,255,0.12),transparent);border-radius:12px;padding:10px 12px;display:flex;gap:7px;"><span style="flex-shrink:0;display:inline-flex;color:var(--accent-ink);">'+icon('lightbulb',14)+'</span><span>'+esc(interp)+'</span></div>';
  return collapsibleCardHTML({key:'mood', id:'card-mood', icon:icon('cloud-sun',18), accent:'var(--pause)', title:(ed?'O günün modu':'Bugünün modu'), subtitle:subtitle, badge:badge, open:open, body:b, hint:'modunu işaretle'});
}

function reflectionCardHTML(rec){
  var REFLECT_PROMPTS=call('REFLECT_PROMPTS',[]);
  var ed=editing();
  var note=(rec&&rec.note)?rec.note:'';
  var gratArr=(rec&&Array.isArray(rec.gratitude))?rec.gratitude:[];
  var gratFilled=gratArr.filter(function(g){return String(g||'').trim();}).length;
  var filled=(String(note).trim()?1:0)+gratFilled;
  var open=cardOpen('reflection', filled===0);
  var badge=filled>0?'<span style="font-size:var(--f-caption2);font-weight:800;color:var(--accent-ink);">'+filled+'</span>':'';
  var refParts=[]; if(String(note).trim()) refParts.push('not'); if(gratFilled>0) refParts.push(gratFilled+' güzel şey');
  var refSub=refParts.length?refParts.join(' · '):'birkaç cümle bırak, kendine iyi gelsin';
  var prompt=REFLECT_PROMPTS[(Math.max(1,dayIndexFor(activeDate()))-1)%REFLECT_PROMPTS.length]||REFLECT_PROMPTS[0];
  var gratPh=['örn. Sabah kahvem','örn. Bir arkadaşın mesajı','örn. Güneşli hava'];
  var b='';
  b+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.5;">Duyguları yazıya dökmek ve minnet, ruh hâlini toparlamanın en kanıtlı iki yoludur. Birkaç cümle bile bugüne iyi gelir.</div>';
  b+='<div style="display:flex;gap:8px;align-items:flex-start;background:linear-gradient(160deg,rgba(255,225,154,0.20),rgba(201,184,255,0.10));border-radius:14px;padding:11px 12px;"><span style="flex-shrink:0;display:inline-flex;color:var(--accent-ink);">'+icon('feather',15)+'</span><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.4;font-style:italic;">'+esc(prompt)+'</div></div>';
  var hasJournal=rec&&rec.journal&&String(rec.journal.text||'').trim();
  b+='<button onclick="App.openJournalModal()" style="border:none;cursor:pointer;width:100%;padding:14px 15px;border-radius:16px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--journal),var(--journal2));box-shadow:0 10px 24px color-mix(in srgb,var(--journal-glow) 65%,transparent),inset 0 1px 0 rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .12s ease,box-shadow .2s ease;">'+(hasJournal?'<span>Bugünün ışığı yazıldı ✨</span>':'<span>Günlük Işığı\'nı aç 🦩</span>')+'</button>';
  b+='<div><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);margin-bottom:6px;">'+(ed?'O gün kendine notun':'Bugün kendime notum')+'</div>';
  b+='<textarea oninput="App.onNote(this)" placeholder="Aklından geçeni serbestçe yaz…" rows="3" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:var(--f-subhead);resize:none;outline:none;line-height:1.5;color:var(--text);">'+esc(note)+'</textarea></div>';
  b+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('heart-handshake',16)+'</span><div><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+(ed?'O günün 3 güzel şeyi':'Bugünün 3 güzel şeyi')+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">Küçük de olsa minnet duyduğun 3 şey</div></div></div>';
  for(var i=0;i<3;i++){ var gv=(gratArr[i]!=null)?gratArr[i]:''; b+='<div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;"><span style="width:24px;height:24px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#F6C177,#E9AFC1);color:#fff;font-size:var(--f-footnote);font-weight:800;display:flex;align-items:center;justify-content:center;">'+(i+1)+'</span><input type="text" value="'+esc(gv)+'" oninput="App.onGratitude('+i+',this)" placeholder="'+gratPh[i]+'" maxlength="160" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);"></div>'; }
  b+='</div>';
  return collapsibleCardHTML({key:'reflection', id:'card-reflection', icon:icon('pen-line',18), accent:'var(--sun)', title:(ed?'O günün yansıması':'Günün yansıması'), subtitle:refSub, badge:badge, open:open, body:b, hint:'yansımanı yaz', cardStyle:'background:linear-gradient(160deg,rgba(246,193,119,0.10),rgba(233,175,193,0.06));'});
}

function habitsCardHTML(rec){
  var data=liveData(), ui=liveUi(), dark=liveDark(), DERIVED_ACCENT=call('DERIVED_ACCENT',[]), DERIVED_HABITS=call('DERIVED_HABITS',[]), HABITS=call('HABITS',[]);
  var ed=editing();
  var viewDate=activeDate();
  var completed=countRec(rec);
  var ht=habitCountOn(viewDate);
  var allDone=ht>0&&completed>=ht;
  var open=cardOpen('habits', !allDone);
  var circ=2*Math.PI*11;
  var off=circ*(1-(ht>0?completed/ht:0));
  var ring='<div id="sey-habits-ring-mini" style="position:relative;width:30px;height:30px;flex-shrink:0;"><svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="3.5"></circle><circle cx="15" cy="15" r="11" fill="none" stroke="#E9AFC1" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 15 15)"></circle></svg></div>';
  var badge='<div style="display:flex;align-items:center;gap:7px;">'+ring+'<span style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+completed+'/'+ht+'</span></div>';
  var b='';
  HABITS.forEach(function(hb){
    var derived=!!DERIVED_HABITS[hb.key];
    var prog=derived?habitProgress(rec,hb.key):null;
    var done=derived?!!(prog&&prog.met):!!(rec&&rec.habits[hb.key]);
    var pulsing=ui.pulse===hb.key;
    var accent=DERIVED_ACCENT[hb.key];
    var locked=(derived&&!done);
    var warn=(!done && !derived && (hb.key==='vitaminD'||hb.key==='protein'));
    var bg=done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):(locked?hexA(accent,dark?0.07:0.05):'var(--card)');
    var bd=done?'rgba(233,175,193,0.9)':(warn?'var(--warn)':(locked?hexA(accent,0.4):'var(--card-bd)'));
    var sh=done?'0 10px 26px rgba(233,175,193,0.4)':(locked?'0 6px 16px '+hexA(accent,0.12):'0 6px 16px rgba(108,74,58,0.06)');
    // Magnezyum için alt-metin doz/form bilgisine göre dinamik olsun
    var sub=hb.sub;
    if(hb.key==='magnesium'){
      var mg=(rec&&rec.magnesium)||{};
      sub=(mg.taken)?('Form: '+esc(mg.form||'glisinat')+' · '+esc((mg.mg||200)+' mg')):'Destek gününü tamamlamak için dokun.';
    }
    if(hb.key==='vitaminD'){
      var vdForm=esc((data.settings&&data.settings.vitaminDForm)||'D₃K₂ damla');
      var vdDose=esc((data.settings&&data.settings.vitaminDDose)||'1 damla (D3 1000 IU + K2 100 mcg)');
      var vdStart='2026-07-20', today=todayStr();
      sub=(today<vdStart)?('20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla’ya geçiyoruz.'):('Form: '+vdForm+' · '+vdDose);
    }
    b+=habitRowHTML({key:hb.key,title:hb.title,sub:sub,msg:hb.msg,icon:hb.icon,derived:derived,prog:prog,done:done,pulsing:pulsing,accent:accent,locked:locked,warn:warn,onclick:'App.toggleHabit(\''+hb.key+'\')'});
  });
  completed=countRec(rec); ht=habitCountOn(viewDate); allDone=ht>0&&completed>=ht;
  var badge2='<div style="display:flex;align-items:center;gap:7px;">'+ring+'<span style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+completed+'/'+ht+'</span></div>';
  return collapsibleCardHTML({key:'habits', id:'card-habits', icon:icon('circle-check',18), accent:'var(--ok)', title:(ed?'O günün tikleri':'Bugünün tikleri'), subtitle:(allDone?'hepsi tamam, harika':completed+'/'+ht+' tamamlandı'), badge:badge2, open:open, body:b, hint:'tikleri gör'});
}

function healthSetupCardHTML(connectedHealth){
  var data=liveData(), ui=liveUi();
  var open=!!ui.healthSetupOpen;
  var h='<div style="border:1px solid rgba(143,191,138,0.32);border-radius:16px;overflow:hidden;background:rgba(143,191,138,0.05);">';
  h+='<button onclick="App.toggleHealthSetup()" style="width:100%;border:none;cursor:pointer;background:none;display:flex;align-items:center;gap:10px;padding:12px;text-align:left;">';
  h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',20)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+(connectedHealth?'Sağlık senkronu':'Sağlık\'tan otomatik veri ekle')+(connectedHealth?' <span style="font-size:var(--f-caption2);font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.22);padding:1px 8px;border-radius:999px;margin-left:2px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>':'')+'</div>';
  h+='<div style="font-size:var(--f-caption1);color:var(--muted);">'+(connectedHealth?'Kurulum adımlarını gör':'Arka planda çalışır · pil dostu · tek seferlik kurulum')+'</div>';
  h+='</div>';
  h+='<span style="font-size:var(--f-footnote);color:var(--faint);flex-shrink:0;display:inline-flex;align-items:center;gap:3px;">'+(open?('Gizle '+icon('chevron-up',13)):('Göster '+icon('chevron-down',13)))+'</span>';
  h+='</button>';
  if(open){
    var sg=data.settings||{};
    var gid=(sg.healthGistId||'').trim();
    function chip(id,label,hint){ return '<button onclick="App.'+id+'()" style="text-align:left;border:1px solid var(--field-bd);background:var(--field);cursor:pointer;border-radius:10px;padding:9px 11px;font-size:var(--f-caption1);color:var(--text2);display:flex;align-items:center;gap:8px;width:100%;"><span style="flex:1;min-width:0;"><b style="color:var(--text);">'+label+'</b><br><span style="color:var(--faint);font-size:var(--f-caption2);">'+hint+'</span></span><span style="flex-shrink:0;display:inline-flex;">'+icon('copy',14)+'</span></button>'; }
    function step(n,text){ return '<div style="display:flex;gap:9px;align-items:flex-start;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:rgba(143,191,138,0.3);color:#2F7A3F;font-size:var(--f-caption1);font-weight:800;display:flex;align-items:center;justify-content:center;">'+n+'</span><span style="flex:1;font-size:var(--f-footnote);line-height:1.55;color:var(--text2);padding-top:2px;">'+text+'</span></div>'; }
    h+='<div style="padding:0 14px 14px;display:flex;flex-direction:column;gap:11px;">';
    h+='<div style="display:flex;flex-direction:column;gap:6px;font-size:var(--f-footnote);color:var(--text2);line-height:1.4;">';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('battery-low',14)+'</span><span><b>Pil dostu</b> — GPS\'i sürekli açık tutmaz, telefonun kendi adım sayacını kullanır.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('moon',14)+'</span><span><b>Gerçekten arka planda</b> — uygulama kapalıyken, ekran kilitliyken bile veri toplanmaya devam eder.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('target',14)+'</span><span><b>Daha doğru</b> — Sağlık\'ın hassas pedometresi, GPS tahmininden daha güvenilir.</span></div>';
    h+='<div style="display:flex;align-items:flex-start;gap:6px;"><span style="flex-shrink:0;margin-top:1px;">'+icon('lock',14)+'</span><span><b>Gizli kalır</b> — veriler doğrudan senin GitHub hesabında tutulur, başka bir sunucuya gitmez.</span></div>';
    h+='</div>';

    h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--text);">Bölüm 1 — Küçük bir kutu oluştur (tarayıcıda, bir kere):</div>';
    h+=step('1','<a href="https://gist.github.com" target="_blank" style="color:#2F7A3F;font-weight:700;">gist.github.com</a> adresini aç (GitHub hesabınla giriş yapmış ol).');
    h+=step('2','"Filename" kutusuna yaz: <b>health-sync.json</b>');
    h+=step('3','Büyük metin kutusuna aşağıdaki "Başlangıç içeriği" çipine dokunup yapıştır.');
    h+=chip('copyHealthStarter','Başlangıç içeriği','Dokun, panoya kopyalanır');
    h+=step('4','Yeşil <b>"Create secret gist"</b> butonuna bas.');
    h+=step('5','Açılan sayfanın adres çubuğundaki son parçayı (uzun kod) kopyala, aşağıya yapıştır:');
    h+='<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(gid)+'" oninput="App.setHealthGistId(this)" placeholder="Gist ID (adres çubuğunun sonundaki kod)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-footnote);outline:none;">';

    h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--text);margin-top:2px;">Bölüm 2 — Kısayolu kur (Kısayollar uygulamasında, bir kere):</div>';
    h+=step('1','Kısayollar → + (yeni kısayol) → isim ver: <b>Şeyma Sağlık</b>');
    h+=step('2','Eylem ekle: <i>Sağlık Örneği Al</i> → Adım Sayısı, bugün, toplam.');
    h+=step('3','Eylem ekle: <i>Sağlık Örneği Al</i> → Yürüme + Koşu Mesafesi, bugün, toplam, birim metre.');
    h+=step('4','Eylem ekle: <i>Metin</i> → aşağıdaki şablonu yapıştır, sonra köşeli parantez içindeki her ismi silip yerine bir önceki adımların mor sonucunu (dokunarak) koy.');
    h+=chip('copyHealthTemplate','Metin şablonu','Dokun, panoya kopyalanır');
    h+=step('5','Eylem ekle: <i>URL İçeriğini Al</i> → Yöntem: <b>PATCH</b>. Aşağıdaki URL ve Yetki değerlerini kopyala-yapıştır; İstek Gövdesi: JSON → Sözlük → anahtar <b>files</b> → içine anahtar <b>health-sync.json</b> → içine anahtar <b>content</b> → değer olarak 4. adımdaki Metin\'i seç.');
    h+=chip('copyHealthUrl','URL','Dokun, panoya kopyalanır');
    h+=chip('copyHealthAuth','Yetki (Authorization)','Dokun, jetonun panoya kopyalanır — ekranda hiç görünmez');

    h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--text);margin-top:2px;">Bölüm 3 — Otomatik çalışsın (bir kere):</div>';
    h+=step('1','Kısayollar → Otomasyon → + → Kişisel Otomasyon → <i>Saatin Zamanı</i> (günde birkaç kez tekrarlı).');
    h+=step('2','"Şeyma Sağlık" kısayolunu çalıştır olarak seç, <b>"Çalıştırmadan Önce Sor"u kapat</b>. Bitti — bundan sonra kimse hiçbir şey yapmaz.');

    h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.5;background:var(--field);border-radius:10px;padding:8px 10px;">Not: Bu jetonun "gist" iznine de sahip olması gerekir. İnce ayarlı (fine-grained) jetonlar Gist\'i desteklemiyor — Ayarlar\'da <b>classic</b> bir jeton (repo + gist izinli) kullan.</div>';
    h+='<a href="shortcuts://" style="text-align:center;text-decoration:none;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:6px;">Kısayollar\'ı Aç '+icon('link-2',15)+'</a>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function vacationCardHTML(rec){
  var ui=liveUi(), dark=liveDark(), VACATION_WATER_GOAL=call('VACATION_WATER_GOAL',[]);
  var v=ensureVacationSettings();
  var active=v.enabled&&isVacationDay(activeDate());
  var planned=v.enabled&&!active;
  var open=!!(ui.cards&&ui.cards['vacation']);
  var presets=[
    {id:'active',label:'Aktif',icon:'footprints'}
  ];
  var accent='var(--vacation)';
  var accentHex=dark?'#5ED4B4':'#2A9D8F';
  var frame=open
    ? 'border:1px solid color-mix(in srgb,'+accent+' 38%, var(--card-bd));box-shadow:0 14px 34px rgba(42,157,143,0.14),inset 0 1px 0 rgba(255,255,255,0.4);'
    : 'border:1px solid color-mix(in srgb,'+accent+' 16%, var(--card-bd));box-shadow:0 6px 18px rgba(42,157,143,0.08),inset 0 1px 0 rgba(255,255,255,0.28);';
  var h='<div class="surface sey-vacation-card" data-cardkey="vacation" data-open="'+(open?'1':'0')+'" style="position:relative;overflow:hidden;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;'+frame+'">';
  h+='<span class="sey-vacation-sheen" style="position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);animation:seyShimmer 3.2s ease-in-out infinite;pointer-events:none;"></span>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:9px;">';
  h+='<button type="button" class="sey-asbtn" onclick="App.toggleVacationCard()" aria-expanded="'+(open?'true':'false')+'" style="flex:1;min-width:0;cursor:pointer;display:flex;align-items:center;gap:11px;">';
  h+='<span style="display:inline-flex;color:'+accent+';">'+icon('plane',20)+'</span>';
  var badgeColor=active?accentHex:(planned?hexA(accentHex,0.85):(dark?'rgba(169,160,155,0.85)':'rgba(120,113,108,0.8)'));
  var badgeBg=active?hexA(accentHex,0.14):(planned?hexA(accentHex,0.09):(dark?'rgba(169,160,155,0.18)':'rgba(120,113,108,0.12)'));
  var badgeText=active?'AKTİF':(planned?'Planlandı':'Kapalı');
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:700;color:var(--text);display:flex;align-items:center;gap:7px;">Tatil Modu <span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.6px;color:'+badgeColor+';background:'+badgeBg+';border-radius:6px;padding:1.5px 5px;">'+badgeText+'</span></div>';
  var sub;
  if(active) sub='Tatildesin — su hedefi '+VACATION_WATER_GOAL+' bardak · seri duraklatıldı';
  else if(planned) sub='Tatil planlandı — belirttiğin günlerde su 10 bardak, seri duraklar';
  else sub='Tatil günlerinde su hedefi 10 bardak, seri duraklar';
  if(v.startAt&&v.endAt) sub+=' · '+esc(shortDate(v.startAt))+'–'+esc(shortDate(v.endAt))+(v.reason?' · '+esc(v.reason):'');
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+sub+'</div></div>';
  h+='<span style="color:'+accent+';transition:transform .2s;display:inline-flex;transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',14)+'</span>';
  h+='</button>';
  h+='<button type="button" onclick="App.hideBugunCard(\'vacation\')" aria-label="Tatil Modu kartını gizle" title="Gizle" style="flex-shrink:0;min-height:44px;border:none;cursor:pointer;background:rgba(150,110,120,0.12);color:var(--muted);font-size:var(--f-caption2);font-weight:800;letter-spacing:.2px;padding:6px 12px;border-radius:999px;line-height:1;">Gizle</button>';
  h+='</div>';
  if(open){
    h+='<div style="position:relative;display:flex;flex-direction:column;gap:12px;animation:seyFade .2s ease;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text2);">Tatil modunu aç</div><button onclick="App.setVacationEnabled('+(v.enabled?'false':'true')+')" style="border:none;cursor:pointer;border-radius:999px;padding:7px 13px;font-size:var(--f-footnote);font-weight:800;color:'+(v.enabled?'#fff':'var(--text2)')+';background:'+(v.enabled?'linear-gradient(135deg,'+accentHex+','+hexA(accentHex,0.75)+')':'var(--field)')+';" data-on="'+(v.enabled?'1':'0')+'">'+(v.enabled?'Kapat':'Aç')+'</button></div>';
    h+='<div style="display:flex;gap:8px;">';
    h+='<div style="flex:1;display:flex;flex-direction:column;gap:4px;"><label style="font-size:var(--f-caption2);font-weight:700;color:var(--faint);">Başlangıç</label><input type="date" value="'+esc(v.startAt)+'" onchange="App.setVacationStart(this.value)" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);font-weight:700;outline:none;color:var(--text);"></div>';
    h+='<div style="flex:1;display:flex;flex-direction:column;gap:4px;"><label style="font-size:var(--f-caption2);font-weight:700;color:var(--faint);">Bitiş</label><input type="date" value="'+esc(v.endAt)+'" onchange="App.setVacationEnd(this.value)" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);font-weight:700;outline:none;color:var(--text);"></div>';
    h+='</div>';
    h+='<div style="display:flex;gap:8px;">';
    for(var i=0;i<presets.length;i++){ var p=presets[i],sel=v.preset===p.id; h+='<button data-fx="destructive" onclick="App.setVacationPreset(\''+p.id+'\')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;border:none;cursor:pointer;border-radius:12px;padding:10px 6px;font-size:var(--f-footnote);font-weight:700;color:'+(sel?'#fff':'var(--text2)')+';background:'+(sel?'linear-gradient(135deg,'+accentHex+','+hexA(accentHex,0.75)+')':'var(--field)')+';border:1px solid '+(sel?hexA(accentHex,0.4):'var(--field-bd)')+';" data-preset="'+p.id+'">'+icon(p.icon,14)+p.label+'</button>'; }
    h+='</div>';
    h+='<div style="display:flex;flex-direction:column;gap:4px;"><label style="font-size:var(--f-caption2);font-weight:700;color:var(--faint);">Nereye / not</label><input type="text" value="'+esc(v.reason)+'" oninput="App.setVacationReason(this.value)" placeholder="örn. Bodrum, aile tatili" maxlength="80" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);font-weight:700;outline:none;color:var(--text);"></div>';
    var vacInfoAccent='var(--vacation)';
    var sleepG=String(sleepGoalHours(activeDate())).replace('.',',');
    var stepG=stepsGoal(activeDate()).toLocaleString('tr-TR');
    h+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.55;background:var(--icon);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:7px;">';
    h+='<div style="font-weight:800;color:'+vacInfoAccent+';display:flex;align-items:center;gap:6px;">'+icon('info',13)+' Tatilde neler esnetildi?</div>';
    h+='<div>'+icon('droplet',13)+' Su hedefi <b>'+VACATION_WATER_GOAL+' bardak</b> · seri sayacı duraklar</div>';
    h+='<div>'+icon('coffee',13)+' Kafein limiti %25 yukarı · Standart 400→500 mg</div>';
    h+='<div>'+icon('bed',13)+' Uyku hedefi <b>'+sleepG+' saat</b></div>';
    h+='<div>'+icon('footprints',13)+' Adım hedefi <b>'+stepG+' adım</b></div>';
    h+='<div>'+icon('heart-handshake',13)+' Kriz odası butonları dinleniyor</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:2px;">💡 Yatmadan 6 saat önce son kafein tavsiyesi hâlâ geçerli.</div>';
    h+='</div>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function hubTilesHTML(){
  var data=liveData(), dark=liveDark();
  // "Zihnimi Besledim" — tek, bağımsız, premium beslenme kartı.
  // Okuma / izleme / dinleme / öğrenme / pratik beş kategori tek satırda.
  // Herhangi biri doldurulunca mediaFed tiki otomatik yeşillenir.
  var day=(data&&data.days)?data.days[todayStr()]:null;
  var cnt=function(sec){ var e=(day&&day[sec]&&Array.isArray(day[sec].entries))?day[sec].entries:[]; return e.length; };
  var soulN=(day&&Array.isArray(day.soulActivities))?day.soulActivities.length:0;
  var cats=[
    {key:'reading',label:'Okudum',icon:'book-open',col:'var(--read)',bg:'var(--read-bg)',fn:'openReading',n:cnt('reading')},
    {key:'watching',label:'İzledim',icon:'clapperboard',col:'var(--watch)',bg:'var(--watch-bg)',fn:'openWatching',n:cnt('watching')},
    {key:'listening',label:'Dinledim',icon:'headphones',col:'var(--listen)',bg:'var(--listen-bg)',fn:'openListening',n:cnt('listening')},
    {key:'learning',label:'Öğrendim',icon:'graduation-cap',col:'var(--learn)',bg:'var(--learn-bg)',fn:'openLearning',n:cnt('learning')},
    {key:'soul',label:'Pratik',icon:'heart-handshake',col:'var(--soul)',bg:'var(--soul-bg)',fn:'openSoulActivity',n:soulN}
  ];
  var filled=cats.filter(function(c){ return c.n>0; }).length;
  var allFed=filled>0;
  var mc='#C77D93';
  var h='<div class="surface"'+(dark?' data-dark-variant="mind"':'')+' style="border-radius:26px;padding:18px;display:flex;flex-direction:column;gap:14px;'+(dark?'background:linear-gradient(145deg,#111013,#0B0B0D);':'')+'border:1px solid color-mix(in srgb,'+mc+' '+(dark?'34':'24')+'%, var(--card-bd));box-shadow:'+(dark?'none':'0 14px 34px color-mix(in srgb,'+mc+' 16%, transparent)')+';">';
  // premium gradient header: ikon, başlık, 5/5 progress
  h+='<div style="display:flex;align-items:center;gap:12px;">';
  h+='<span style="width:44px;height:44px;border-radius:14px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:'+(dark?'linear-gradient(135deg,#9B5A73,#8B7CBF)':'linear-gradient(135deg,'+mc+',#E9AFC1,#9B7FC3)')+';box-shadow:'+(dark?'none':'0 8px 22px color-mix(in srgb,'+mc+' 40%, transparent)')+';position:relative;overflow:hidden;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%);animation:seyShimmer 2.8s linear infinite;"></span>';
  h+=icon('sparkles',21);
  h+='</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-body);font-weight:800;line-height:1.15;color:var(--text);">Zihnimi Besledim</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">Okudum · İzledim · Dinledim · Öğrendim · Pratik</div></div>';
  h+='</div>';
  // alt başlık satırı: bugün X/5 + durum chip
  var chip=allFed
    ? '<span style="flex-shrink:0;font-size:var(--f-caption2);font-weight:800;letter-spacing:.2px;color:#3F8A4F;background:rgba(143,191,138,0.2);border:1px solid rgba(143,191,138,0.4);border-radius:999px;padding:3px 9px;display:inline-flex;align-items:center;gap:4px;">'+icon('check',11)+' Bugün beslendim</span>'
    : '<span style="flex-shrink:0;font-size:var(--f-caption2);font-weight:800;letter-spacing:.2px;color:'+mc+';background:color-mix(in srgb,'+mc+' 12%, transparent);border:1px solid color-mix(in srgb,'+mc+' 30%, transparent);border-radius:999px;padding:3px 9px;">birini doldur → tik yeşil</span>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
  h+='<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.45px;color:var(--muted);">BUGÜN '+filled+'/5 ALAN</span>';
  h+='<button data-fx="open" onclick="App.openSoulArchive()" style="border:none;background:transparent;cursor:pointer;font-size:var(--f-caption2);font-weight:700;color:var(--soul);display:inline-flex;align-items:center;gap:3px;padding:2px 4px;border-radius:6px;">Arşiv '+icon('archive',12)+'</button>';
  h+=chip;
  h+='</div>';
  // 5 kategori butonu: 3+2 grid (mobilde otomatik wrap)
  h+='<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;">';
  cats.forEach(function(c){
    var done=c.n>0;
    var badge=done?'<span style="position:absolute;top:5px;right:5px;min-width:18px;height:18px;padding:0 4px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:var(--f-caption2);font-weight:800;color:#fff;background:'+c.col+';box-shadow:'+(dark?'none':'0 2px 6px rgba(108,74,58,0.28)')+';z-index:2;">'+(c.n>1?c.n:icon('check',10))+'</span>':'';
    var surface=dark?'color-mix(in srgb,'+c.col+' '+(done?'18':'10')+'%, #0B0B0E)':c.bg;
    var borderOp=done?'58':(dark?'30':'22');
    var sh=done?'0 8px 20px color-mix(in srgb,'+c.col+' 28%, transparent)':(dark?'none':'0 4px 12px rgba(108,74,58,0.06)');
    var click=(c.key==='soul')?'App.openSoulPracticePicker()':'App.'+c.fn+'()';
    h+='<button onclick="'+click+'" style="position:relative;min-width:0;cursor:pointer;padding:12px 3px 10px;border-radius:18px;display:flex;flex-direction:column;align-items:center;gap:6px;background:'+surface+';border:1.5px solid color-mix(in srgb,'+c.col+' '+borderOp+'%, transparent);box-shadow:'+sh+';transition:transform .18s var(--ease-premium,ease),border-color .2s,box-shadow .25s;">';
    h+=badge;
    h+='<span style="width:36px;height:36px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:'+c.col+';background:color-mix(in srgb,'+c.col+' '+(dark?'16':'19')+'%, transparent);box-shadow:'+(dark?'none':'inset 0 1px 0 rgba(255,255,255,0.35)')+';">'+icon(c.icon,17)+'</span>';
    h+='<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.1px;white-space:nowrap;color:'+(done?c.col:'var(--muted)')+';">'+c.label+'</span>';
    h+='</button>';
  });
  h+='</div>';
  h+='</div>';
  return h;
}

function rasitBubbleHTML(curIdx){
  var NOTES=call('NOTES',[]);
  var h='<button type="button" class="sey-asbtn" onclick="App.cycleRasit()" aria-label="Raşit\'in sözü — dokun, değişsin" style="cursor:pointer;display:flex;align-items:flex-start;gap:11px;">';
  h+='<div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 6px 16px var(--room-glow);">'+icon('heart',20)+'</div>';
  h+='<div class="surface" style="position:relative;flex:1;min-width:0;border-radius:6px 20px 20px 20px;padding:12px 15px;border:1px solid color-mix(in srgb,var(--room) 28%, var(--card-bd));box-shadow:0 8px 22px var(--room-glow);">';
  h+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;"><span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:0.8px;color:var(--room);">RAŞİT</span><span style="font-size:var(--f-caption1);">🦩</span><span style="margin-left:auto;font-size:var(--f-caption2);color:var(--faint);font-weight:700;display:inline-flex;align-items:center;gap:3px;">dokun '+icon('sparkles',10)+'</span></div>';
  h+='<div id="sey-rasit-note" style="font-size:var(--f-subhead);line-height:1.5;color:var(--text2);transition:opacity .18s ease;">'+esc(NOTES[rasitNoteIdx(curIdx)])+'</div>';
  h+='</div></button>';
  return h;
}

function heroStatsHTML(rec){
  var MOODS=call('MOODS',[]);
  var mo=(rec&&rec.mood)?find(MOODS,'id',rec.mood):null;
  var water=rec?(Number(rec.water)||0):0;
  var wg=waterGoalCups(activeDate());
  var sh=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null;
  var es=effSteps(rec);
  var stepTxt='—';
  if(es.steps!=null){ stepTxt=es.steps>=1000?((es.steps/1000).toFixed(es.steps%1000===0?0:1).replace('.',',')+'B'):String(es.steps); }
  var h='<div style="display:flex;gap:7px;">';
  h+=heroStatTile(mo?mo.icon:'smile', mo?esc(mo.short):'—', 'Mod', 'var(--accent)', false);
  h+=heroStatTile('droplet', (water>0?water+'/'+wg:'—'), 'Su', '#5EA9E6', water>=wg);
  h+=heroStatTile('moon', (sh!=null?(String(sh).replace('.',',')+'s'):'—'), 'Uyku', '#9B7FC9', sh!=null&&sh>=sleepGoalHours(activeDate()));
  h+=heroStatTile('footprints', stepTxt, 'Adım', '#5BA85B', es.steps!=null&&es.steps>=stepsGoal(activeDate()));
  h+='</div>';
  return h;
}

function heroTargetsHTML(rec){
  var data=liveData();
  var nu=dayNutrition(rec);
  var t=data.settings.targets||{};
  var calG=(typeof t.calories==='number'&&!isNaN(t.calories))?t.calories:calGoal();
  var proG=(typeof t.protein==='number'&&!isNaN(t.protein))?t.protein:proteinGoal();
  var carbG=(typeof t.carbs==='number'&&!isNaN(t.carbs))?t.carbs:(carbsGoal()||0);

  // SVG halka: r=18, çevre = 2πr.
  var ring=function(cur,goal,label,accent,icName,icSize){
    var has=(typeof cur==='number'&&!isNaN(cur));
    var pct=(goal>0)?Math.min(100,Math.round(cur/goal*100)):0;
    var met=has&&pct>=100;
    var r=18, c=Math.round(2*Math.PI*r*100)/100;
    var off=Math.round(c*(1-pct/100)*100)/100;
    var col=met?'#3F8A4F':accent;
    var curTxt=has?('<span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);letter-spacing:-0.3px;">'+Math.round(cur)+'</span><span style="font-size:var(--f-caption2);color:var(--faint);font-weight:700;">/'+Math.round(goal)+'</span>'):('<span style="font-size:var(--f-subhead);font-weight:800;color:var(--faint);">—</span>');
    var grad='linear-gradient(180deg,'+accent+'22 0%,'+accent+'08 100%)';
    return '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 2px 10px;border-radius:20px;background:'+grad+';border:1px solid '+accent+'33;box-shadow:0 4px 14px '+accent+'1A;">'
      +'<div style="position:relative;width:52px;height:52px;filter:drop-shadow(0 2px 4px '+accent+'26);">'
      +'<svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg);">'
      +'<circle cx="26" cy="26" r="'+r+'" fill="none" stroke="var(--card-bd)" stroke-width="4" opacity="0.7"/>'
      +'<circle class="sey-ring-seg" cx="26" cy="26" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'"/>'
      +'</svg>'
      +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">'
      +'<span style="display:inline-flex;color:'+col+';">'+icon(icName,icSize||13)+'</span>'
      +'</div></div>'
      +'<div style="display:flex;align-items:baseline;gap:2px;line-height:1;white-space:nowrap;">'+(has?('<span data-countup="'+Math.round(cur)+'" data-countup-key="hero-target-'+label+'" style="font-size:var(--f-subhead);font-weight:800;color:var(--text);letter-spacing:-0.3px;">'+Math.round(cur)+'</span><span style="font-size:var(--f-caption2);color:var(--faint);font-weight:700;">/'+Math.round(goal)+'</span>'):curTxt)+'</div>'
      +'<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.35px;color:var(--faint);text-transform:uppercase;">'+label+'</span>'
      +'</div>';
  };

  var header='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">'
    +'<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:1.2px;color:var(--faint);text-transform:uppercase;">Hedeflerim</span>'
    +'<span style="font-size:var(--f-caption2);font-weight:700;color:var(--muted);">Bugün · makro üçlü</span></div>';
  var h='<div style="display:flex;flex-direction:column;gap:7px;">';
  h+=header;
  if(isVacationDay(activeDate())){
    h+='<div style="display:flex;flex-direction:column;gap:8px;background:var(--icon);border:1px solid var(--vacation);border-radius:18px;padding:13px 12px;">';
    h+='<div style="display:flex;align-items:center;gap:7px;font-size:var(--f-caption1);font-weight:800;color:var(--vacation);">'+icon('sun',14)+' Tatil modunda beslenme hedefleri esnetildi</div>';
    h+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.5;">Bugün yemekleri <b>keyif notu</b> olarak kaydetmek yeterli; kalori/protein/karbonhidrat halkaları dinleniyor.</div>';
    if(nu.calories>0||nu.protein>0||nu.carbs>0){
      h+='<div style="display:flex;gap:10px;font-size:var(--f-caption2);color:var(--muted);">';
      if(nu.calories>0) h+='<span>'+Math.round(nu.calories)+' kcal</span>';
      if(nu.protein>0) h+='<span>'+Math.round(nu.protein)+' g protein</span>';
      if(nu.carbs>0) h+='<span>'+Math.round(nu.carbs)+' g karb</span>';
      h+='</div>';
    }
    h+='</div>';
  } else {
    h+='<div style="display:flex;gap:8px;">';
    h+=ring(nu.calories, calG, 'Kalori', '#E8894A', 'flame', 14);
    h+=ring(nu.protein, proG, 'Protein', '#C2453A', 'beef', 14);
    h+=ring(nu.carbs, carbG, 'Karbonhidrat', '#6E9C6A', 'apple', 14);
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function heroPremiumStatsHTML(viewDate){
  var data=liveData(), HABITS=call('HABITS',[]), MOODS=call('MOODS',[]), SHORT_HABIT=call('SHORT_HABIT',[]);
  // 7 günlük tamamlanma ritmi
  var sum=0,max=0;
  for(var i=0;i<7;i++){ var d=addDays(viewDate,-i); if(diffDays(data.startDate,d)<0) break; sum+=countRec(data.days[d]); max+=habitCountOn(d); }
  var wpct=max>0?Math.round(sum/max*100):0;
  var streak=currentStreak();
  // mod eğilimi (son 7 gün, eski → yeni)
  var moodDots='';
  for(var j=6;j>=0;j--){ var dd=addDays(viewDate,-j); if(diffDays(data.startDate,dd)<0) continue; var r=data.days[dd]; var m=r&&r.mood?r.mood:null; if(m){ var moo=find(MOODS,'id',m); moodDots+='<span style="display:inline-flex;color:var(--accent-ink);">'+icon(moo?moo.icon:'circle',13)+'</span>'; } else { moodDots+='<span style="width:6px;height:6px;border-radius:50%;background:var(--field-bd);display:inline-block;"></span>'; } }
  if(!moodDots) moodDots='<span style="font-size:var(--f-caption1);color:var(--faint);">—</span>';
  // son 14 günün tik başarımı → en güçlü / destek isteyen
  var win=14,stt={};
  for(var k=0;k<win;k++){ var d2=addDays(viewDate,-k); if(diffDays(data.startDate,d2)<0) break; var r2=data.days[d2]; HABITS.forEach(function(hb){ if(hb.since&&d2<hb.since) return; if(!stt[hb.key]) stt[hb.key]={done:0,act:0,icon:hb.icon}; stt[hb.key].act++; if(r2&&r2.habits&&r2.habits[hb.key]) stt[hb.key].done++; }); }
  var best=null,worst=null;
  for(var key in stt){ var s=stt[key]; if(s.act<1) continue; var rate=s.done/s.act; if(best===null||rate>best.rate||(rate===best.rate&&s.done>best.done)) best={key:key,rate:rate,done:s.done,icon:s.icon}; if(worst===null||rate<worst.rate||(rate===worst.rate&&s.done<worst.done)) worst={key:key,rate:rate,done:s.done,icon:s.icon}; }
  var cell=function(ic,val,label,col){ return '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;">'
    +'<div style="display:flex;align-items:center;gap:4px;color:'+(col||'var(--text)')+';">'+(ic?'<span style="display:inline-flex;color:'+(col||'var(--muted)')+';">'+ic+'</span>':'')+'<span style="font-size:var(--f-callout);font-weight:800;line-height:1;color:var(--text);white-space:nowrap;">'+val+'</span></div>'
    +'<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">'+label+'</span></div>'; };
  var vline='<span style="width:1px;align-self:stretch;background:var(--card-bd);margin:2px 0;"></span>';
  var h='<div style="background:var(--icon);border-radius:16px;padding:12px 8px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;">';
  h+=cell(icon('flame',14),'<span data-countup="'+streak+'" data-countup-key="hero-streak">'+streak+'</span> gün','Seri','#E8894A');
  h+=vline;
  h+=cell(null,'%<span data-countup="'+wpct+'" data-countup-key="hero-weekly-rhythm">'+wpct+'</span>','7 Günlük ritim');
  h+=vline;
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;"><div class="sey-tiny-hit" style="display:flex;align-items:center;gap:3px;min-height:16px;">'+moodDots+'</div><span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">Mod · 7 gün</span></div>';
  h+='</div>';
  if(best&&worst&&best.key!==worst.key){
    h+='<div style="display:flex;gap:8px;border-top:1px solid var(--card-bd);padding-top:9px;font-size:var(--f-caption2);">';
    h+='<div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;color:var(--muted);"><span style="display:inline-flex;color:#3F8A4F;flex-shrink:0;">'+best.icon+'</span><span style="min-width:0;"><b style="color:var(--text);font-weight:800;">'+esc(SHORT_HABIT[best.key]||best.key)+'</b> en güçlü <span style="color:#3F8A4F;font-weight:800;">%'+Math.round(best.rate*100)+'</span></span></div>';
    h+='<div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;color:var(--muted);"><span style="display:inline-flex;color:var(--accent-ink);flex-shrink:0;">'+worst.icon+'</span><span style="min-width:0;"><b style="color:var(--text);font-weight:800;">'+esc(SHORT_HABIT[worst.key]||worst.key)+'</b>\'e destek <span style="color:var(--accent-ink);font-weight:800;">%'+Math.round(worst.rate*100)+'</span></span></div>';
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function rasitContactHTML(){
  var TEL=call('TEL',[]), WA=call('WA',[]);
  var btn=function(href,attr,ic,label,sub){
    return '<a href="'+href+'"'+attr+' style="text-decoration:none;flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--room) 14%, var(--card)),color-mix(in srgb,var(--room) 6%, var(--card)));border:1px solid color-mix(in srgb,var(--room) 34%, var(--card-bd));box-shadow:0 8px 20px color-mix(in srgb,var(--room) 16%, transparent);color:var(--room);">'
      +'<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 4px 12px var(--room-glow);">'+icon(ic,17)+'</span>'
      +'<span style="min-width:0;display:flex;flex-direction:column;line-height:1.15;"><span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);white-space:nowrap;">'+label+'</span><span style="font-size:var(--f-caption2);font-weight:600;color:var(--faint);white-space:nowrap;">'+sub+'</span></span></a>';
  };
  var h='<div style="display:flex;gap:9px;margin-top:-4px;">';
  h+=btn(WA,' target="_blank" rel="noopener"','send-horizontal','Raşit\'e yaz','WhatsApp\'tan mesaj');
  h+=btn(TEL,'','phone','Raşit\'i ara','Bir tık uzağında');
  h+='</div>';
  return h;
}

function zikroverlayHTML(){
  var ui=liveUi();
  var z=ensureZikrRoot(), p=zikrActivePreset(), view=ui.zikrView||'counter';
  var body=zikrViewBodyHTML(view,p,z);
  // ZP-07: İÇ NAVİGASYON — Sayaç/Esmâ/Hatimlerim/Geçmiş/Ayarlar (5 sekme, hepsi
  // kısa Türkçe etiket). Eski tek "Özet" sekmesi Geçmiş (istatistik/ısı) ve
  // Ayarlar (tüm toggle'lar) olarak ikiye ayrıldı — her ekranın tek bir işi var.
  var tabs=[['counter','Sayaç'],['presets','Esmâ'],['hatims','Hatimlerim'],['history','Geçmiş'],['settings','Ayarlar']];
  var head='<header class="zikr-v2-header"><div class="brand"><span>'+icon('sparkles',18)+'</span><div><strong>Zikirmatik</strong><small>Kalıcı, odaklı ve sana ait</small></div></div><button data-fx="close" class="close" onclick="App.closeZikr()" aria-label="Zikirmatiği kapat">'+icon('x',18)+'</button></header>';
  // ZP-08.2: paylaşımlı segTabs() aktif sekmeye INLINE `background:linear-
  // gradient(...)` yazıyordu; inline stil sınıf seçicisini yendiği için
  // ZP-08'in opak/gradientsiz kuralı bu tek noktada UYGULANAMIYORDU (gerçek
  // bir hata). Zikirmatik artık kendi sınıf-tabanlı sekmelerini üretir.
  head+='<nav id="zikr-tabs" class="zikr-v2-tabs" aria-label="Zikirmatik bölümleri"><div class="seg" role="tablist">';
  tabs.forEach(function(d){
    head+='<button role="tab" data-zikr-view="'+d[0]+'" aria-selected="'+(view===d[0])+'" class="'+(view===d[0]?'on':'')+'" onclick="App.setZikrView(\''+d[0]+'\')">'+d[1]+'</button>';
  });
  head+='</div></nav>';
  return '<div id="zikr-overlay" class="zikr-v2-overlay'+(z.settings.reducedMotion?' is-reduced':'')+'" role="dialog" aria-modal="true" aria-label="Tam ekran Zikirmatik"><div id="zikr-screen" class="zikr-v2-screen" tabindex="-1" onkeydown="App.onZikrKeydown(event)">'+head+'<main id="zikr-scroll" class="scroll zikr-v2-scroll">'+body+'</main></div></div>';
}

function quranJourneyHubCardHTML(){
  var data=liveData(), QURAN_DEFAULT_SURAH_ID=call('QURAN_DEFAULT_SURAH_ID',[]);
  var q=ensureQuranJourney(data);
  var surah=quranSurah(q.activeSurahId);
  var id=surah?surah.id:(q.activeSurahId||QURAN_DEFAULT_SURAH_ID);
  var order=surah?surah.revelationOrder:1;
  var total=quranTotal();
  var req=quranRequestOf(q,id);
  var status=req.status||'idle';
  var copy=quranJourneyCardCopy(status,quranCanRequest(req),req,order,total);
  var stats=quranJourneyStats();
  var tone=quranPreviewToneOf(status);
  var verse=quranActiveVerse();

  var h='<button data-fx="open" id="quran-journey-card" class="quran-v2-preview is-'+tone+'" onclick="App.openQuranJourney()" aria-label="Kur’an Yolculuğu kütüphanesini aç">';
  h+='<div class="quran-v2-preview-top"><span class="quran-v2-preview-icon" aria-hidden="true">'+icon('book',20)+'</span><div class="quran-v2-preview-copy"><strong>Kur’an Yolculuğu</strong><small>'+esc(copy.line)+'</small></div><span class="quran-v2-preview-status '+tone+'">'+esc(copy.statusLabel)+'</span></div>';

  // Vitrin: çarpıcı âyet modülü yüklüyse döner; yüklü değilse (statik denetim/
  // eski derleme) aktif sûrenin adına düşülür — kart hiçbir zaman boş kalmaz.
  if(verse){
    h+='<div class="quran-v2-preview-focus"><div><span class="eyebrow">ÇARPICI ÂYET</span><strong>'+esc(verse.surahNameTr)+' · '+esc(verse.ayetNo)+'</strong><p>'+esc(verse.meal)+'</p></div><span class="arabic" lang="ar" dir="rtl">'+esc(verse.arabic)+'</span></div>';
  } else if(surah){
    h+='<div class="quran-v2-preview-focus"><div><span class="eyebrow">AKTİF SÛRE</span><strong>'+esc(surah.nameTr)+'</strong><p>'+esc(copy.line)+'</p></div><span class="arabic" lang="ar" dir="rtl">'+esc(surah.nameAr)+'</span></div>';
  }

  h+='<div class="quran-v2-preview-metric">';
  h+='<div><span>Nüzul</span><strong>'+order+' / '+total+'</strong><small>'+esc(surah?surah.nameTr:id)+'</small></div>';
  h+='<div><span>İstenen</span><strong>'+stats.requested+'</strong><small>'+total+' sûreden</small></div>';
  h+='<div><span>İzlenen</span><strong>'+stats.watched+'</strong><small>%'+stats.pct+'</small></div>';
  h+='</div>';
  h+='<div class="quran-v2-preview-bar"><i style="width:'+stats.pct+'%"></i></div>';
  h+='<div class="quran-v2-preview-foot"><span>'+order+'. durak · '+total+' sûrelik yolculuk</span>';
  if(copy.ctaAction) h+='<b onclick="event.stopPropagation();'+copy.ctaAction+'">'+esc(copy.ctaLabel)+' '+icon('chevron-right',13)+'</b>';
  else h+='<b class="is-disabled" aria-disabled="true">'+esc(copy.ctaLabel)+'</b>';
  h+='</div>';
  h+='</button>';
  return h;
}

function quranJourneyOverlayHTML(){
  var ui=liveUi();
  var head='<header class="quran-v2-header"><div id="quran-head-lead" class="lead">'+quranHeadLeadHTML()+'</div>';
  head+='<button id="quran-refresh-button" class="refresh'+(ui.quranRefreshing?' is-spinning':'')+'" onclick="App.refreshQuranUpdates()" aria-label="Güncellemeleri kontrol et" aria-busy="'+(!!ui.quranRefreshing)+'"'+(ui.quranRefreshing?' disabled':'')+'>'+icon('rotate-ccw',17)+'</button>';
  head+=quranRemoteStatusHTML();
  head+='<button data-fx="close" class="close" onclick="App.closeQuranJourney()" aria-label="Kur’an Yolculuğunu kapat">'+icon('x',18)+'</button></header>';
  return '<div id="quran-overlay" class="quran-v2-overlay" role="dialog" aria-modal="true" aria-label="Raşit ile Kur’an Yolculuğu">'
    +'<div id="quran-screen" class="quran-v2-screen" tabindex="-1" onkeydown="App.onQuranKeydown(event)">'
    +head+'<main id="quran-scroll" class="scroll quran-v2-scroll">'+quranViewBodyHTML()+'</main></div></div>';
}

function quranRemoteStatusHTML(){
  var ui=liveUi();
  var status=String(ui.quranRemoteStatus||'idle'), label='Uzak kayıt hazır', tone='idle';
  if(status==='checking'){ label='Kontrol ediliyor…'; tone='checking'; }
  else if(status==='updated'){ label='Yeni cevap alındı'; tone='updated'; }
  else if(status==='updated_delivery'){ label='Yeni teslim kaydı'; tone='updated'; }
  else if(status==='updated_warning'){ label='Cevap alındı · kaynak uyarısı'; tone='warning'; }
  else if(status==='unchanged'){ label='Güncel'; tone='idle'; }
  else if(status==='error'){ label='Kontrol başarısız'; tone='error'; }
  return '<span id="quran-remote-status" class="quran-v2-remote-status is-'+tone+'" role="status" aria-live="polite" title="'+esc(ui.quranRemoteError||label)+'">'+esc(label)+'</span>';
}

function quranHeadLeadHTML(){
  var ui=liveUi();
  if(ui.quranJourneyView==='detail'){
    var x=quranSurah(ui.quranDetailId);
    return '<button class="back" onclick="App.backToQuranLibrary()" aria-label="Sûre kütüphanesine dön">'+icon('chevron-left',18)+'</button>'
      +'<span class="copy"><strong>'+esc(x?(x.nameTr+' Sûresi'):'Sûre')+'</strong><small>'+esc(x?(x.revelationOrder+'. durak · '+quranTotal()+' sûrelik yolculuk'):'Kur’an Yolculuğu')+'</small></span>';
  }
  return '<span class="mark" aria-hidden="true"><span>'+icon('book-open',20)+'</span><i></i></span><span class="copy"><strong>Kur’an Yolculuğu</strong><small>Raşit’in anlatımıyla · nüzul arşivi</small></span>';
}

function quranLibraryViewHTML(){
  var ui=liveUi();
  var s=quranJourneyStats(), cat=quranCatalog();
  var h='<section class="quran-v2-library">';
  h+='<div class="quran-v2-library-hero"><div class="quran-v2-section-head"><span>NÜZUL ARŞİVİ · İLMÎ YOLCULUK</span><h2>İniş sırasıyla '+s.total+' sûre</h2><p>Her sûre bir durak. Raşit’ten anlatım iste; geldiğinde bu listede açılır.</p></div><div class="quran-v2-hero-seal" aria-hidden="true"><i></i><b>114</b><span>DURAK</span></div></div>';
  h+='<div class="quran-v2-progress" role="group" aria-label="Yolculuk ilerlemesi">';
  h+='<div class="quran-v2-progress-head"><span>YOLCULUK İLERLEMESİ</span><b>Nüzul sırası</b></div>';
  h+='<i aria-hidden="true"><b style="width:'+s.pct+'%"></b></i>';
  h+='<span><strong>'+s.watched+' / '+s.total+'</strong> izlendi · '+s.requested+' sûre için istek açıldı</span>';
  h+='</div>';
  h+='<div class="quran-v2-method-note" role="note"><span class="method-icon" aria-hidden="true">'+icon('scale',16)+'</span><span><strong>Katalog yöntemi</strong><small>Yaygın nüzul tertibi · sûreler tek tek doğrulanabilir · durumlar kullanıcı ilerlemesinden hesaplanır.</small></span><b aria-hidden="true">'+icon('chevron-right',14)+'</b></div>';
  h+='<label class="quran-v2-search">'+icon('search',16)+'<input id="quran-search-input" value="'+esc(ui.quranQuery||'')+'" oninput="App.setQuranQuery(this)" placeholder="Sûre adı, Arapça ad, mushaf no veya konu" aria-label="Sûre ara">';
  h+='<button id="quran-search-clear" class="clear" onclick="App.clearQuranQuery()" aria-label="Aramayı temizle"'+(ui.quranQuery?'':' hidden')+'>'+icon('x',13)+'</button></label>';
  h+='<div id="quran-library-results">'+quranLibraryResultsHTML()+'</div>';
  h+='<p class="quran-v2-disclaimer">'+esc((cat&&cat.methodologyTr)||'Sıralama yaygın nüzul tertibine dayanır; klasik kaynaklar arasında bazı sûrelerin yeri ihtilaflıdır.')+'</p>';
  h+='</section>';
  return h;
}

function quranLibraryResultsHTML(){
  var data=liveData(), ui=liveUi(), QURAN_FILTERS=call('QURAN_FILTERS',[]);
  var counts=quranFilterCounts(), filter=quranActiveFilter(), rows=quranFilteredSurahs();
  var query=String(ui.quranQuery||'').trim();
  var h='<section class="quran-v2-filter-expander'+(ui.quranFiltersOpen?' is-open':'')+'">';
  h+='<button class="quran-v2-filter-summary" onclick="App.toggleQuranFilters()" aria-expanded="'+(!!ui.quranFiltersOpen)+'" aria-controls="quran-filter-panel">';
  h+='<span class="filter-icon" aria-hidden="true">'+icon('settings',17)+'</span>';
  h+='<span class="filter-copy"><small>DURUM FİLTRESİ</small><strong>'+esc(quranFilterLabel(filter))+'</strong></span>';
  h+='<span class="filter-count">'+rows.length+' sûre</span>';
  h+='<span class="filter-chevron" aria-hidden="true">'+icon('chevron-down',16)+'</span></button>';
  h+='<div id="quran-filter-panel" class="quran-v2-filter-panel"'+(ui.quranFiltersOpen?'':' hidden')+'>';
  h+='<div class="quran-v2-chips" role="group" aria-label="Sûre durum filtresi">';
  QURAN_FILTERS.forEach(function(f){
    h+='<button class="'+(filter===f[0]?'on':'')+'" onclick="App.setQuranFilter(\''+f[0]+'\')" aria-pressed="'+(filter===f[0])+'">'+esc(f[1])+'<b>'+(counts[f[0]]||0)+'</b></button>';
  });
  h+='</div></div></section>';
  h+='<div class="quran-v2-result-note" role="status" aria-live="polite"><span><strong>'+rows.length+'</strong> sûre'+(filter!=='all'?' · '+esc(quranFilterLabel(filter)):'')+(query?' · “'+esc(query)+'”':'')+'</span><span class="result-context">'+((filter==='all'&&!query)?'NÜZUL SIRASIYLA':'EŞLEŞEN DURAKLAR')+'</span></div>';
  if(!rows.length){
    h+='<div class="quran-v2-empty"><strong>Bu mercekte eşleşme yok.</strong><span>Aramayı temizleyebilir veya filtreyi “Tümü” yapabilirsin.</span><button data-fx="destructive" onclick="App.resetQuranLens()">Filtreyi sıfırla</button></div>';
    return h;
  }
  var q=ensureQuranJourney(data);
  h+='<div class="quran-v2-list">';
  rows.forEach(function(x){ h+=quranRowHTML(x,q); });
  h+='</div>';
  return h;
}

function quranRowHTML(x,q){
  var req=quranRequestOf(q,x.id), st=req.status||'idle', state=quranRowState(st);
  var active=(q.activeSurahId===x.id), place=quranPlaceLabel(x);
  var aria=x.revelationOrder+'. durak · '+x.nameTr+' sûresi · '+place+' · '+x.ayahCount+' âyet · mushaf sırası '+x.mushafOrder+' · '+state.label;
  // Durum rozeti meta satırının İÇİNDE ve sarmalanabilir: 370px'te bile
  // "Raşit’e haber verildi" gibi uzun etiketler satırı yatay taşırmaz.
  var h='<button id="quran-row-'+esc(x.id)+'" class="quran-v2-row is-'+state.tone+(active?' is-active':'')+'" onclick="App.openQuranSurah(\''+esc(x.id)+'\')" aria-label="'+esc(aria)+'">';
  h+='<span class="ord" aria-hidden="true"><b>'+x.revelationOrder+'</b><i>durak</i><span class="ord-line"></span></span>';
  h+='<span class="titleline"><strong>'+esc(x.nameTr)+'</strong><span class="arabic" lang="ar" dir="rtl">'+esc(x.nameAr)+'</span></span>';
  h+='<span class="metarow" aria-hidden="true"><span class="meta">'+esc(place)+' · '+x.ayahCount+' âyet · Mushaf '+x.mushafOrder+'</span>';
  h+='<span class="state"><i class="dot"></i><em>'+esc(state.label)+'</em></span></span>';
  h+='</button>';
  return h;
}

function quranDetailViewHTML(id){
  var x=quranSurah(id);
  if(!x) return '<section class="quran-v2-detail"><div class="quran-v2-empty"><strong>Sûre bulunamadı.</strong><span>Kütüphaneden yeniden seçebilirsin.</span><button onclick="App.backToQuranLibrary()">Kütüphaneye dön</button></div></section>';
  return '<section class="quran-v2-detail"><div id="quran-detail-region">'+quranDetailBodyHTML(x)+'</div></section>';
}

function quranVideoNotesInnerHTML(x,req){
  var QURAN_VIDEO_ID_RE=call('QURAN_VIDEO_ID_RE',[]);
  req=req&&typeof req==='object'?req:{};
  var status=String(req.status||'idle');
  var canEdit=['ready','watching','watched','question_opened'].indexOf(status)>=0&&QURAN_VIDEO_ID_RE.test(String(req.videoId||''));
  var draft=quranNoteDraftFor(x.id), notes=quranSortNotes(req.notes).slice(0,12), h='';
  h+='<div class="quran-v2-notes-head"><div><strong>'+icon('pen-line',15)+' İzlerken / dinlerken notlar</strong><span>Bağlamı yakala, sonra panelden birlikte takip edelim.</span>'+(canEdit?'':'<span class="quran-v2-notes-lock">'+icon('lock',12)+' Video hazır olduğunda not yazma açılır.</span>')+'</div><b>'+((Array.isArray(req.notes))?req.notes.length:0)+'</b></div>';
  if(notes.length){
    h+='<div class="quran-v2-note-list" aria-live="polite">';
    notes.forEach(function(n){
      var meta=quranNoteKindMeta(n.kind), stamp=quranNoteTimeLabel(n.timestampSec);
      h+='<article class="quran-v2-note"><div class="quran-v2-note-top"><span class="quran-v2-note-kind">'+icon(meta.icon,12)+' '+esc(meta.label)+'</span>'+(stamp?'<span class="quran-v2-note-time">'+esc(stamp)+'</span>':'')+(n.tag?'<span class="quran-v2-note-tag">#'+esc(n.tag)+'</span>':'')+'</div><p>'+esc(n.text)+'</p>'+(n.createdAt?'<time datetime="'+esc(n.createdAt)+'">'+esc(fmtDateNice(n.createdAt))+'</time>':'')+'</article>';
    });
    h+='</div>';
    if((req.notes||[]).length>notes.length) h+='<p class="quran-v2-notes-more">Son 12 not gösteriliyor; toplam '+req.notes.length+' not cihazlar arasında korunuyor.</p>';
  } else {
    h+='<p class="quran-v2-notes-empty">'+(canEdit?'Henüz not yok. Videonun bir anını, duyduğun bir cümleyi veya aklına düşeni buraya bırak.':'Video geldiğinde burada izlerken ve dinlerken not tutabileceksin.')+'</p>';
  }
  var disabled=canEdit?'':' disabled';
  h+='<form class="quran-v2-note-compose'+(canEdit?'':' is-locked')+'" onsubmit="event.preventDefault();App.quranAddNote(\''+esc(x.id)+'\')">';
  h+='<div class="quran-v2-note-fields"><label>Not türü<select'+disabled+' onchange="App.quranNoteField(\'kind\',this)"><option value="watch"'+(draft.kind==='watch'?' selected':'')+'>İzlerken</option><option value="listen"'+(draft.kind==='listen'?' selected':'')+'>Dinlerken</option><option value="reflection"'+(draft.kind==='reflection'?' selected':'')+'>Yansıma</option></select></label><label>Video saniyesi<input'+disabled+' type="number" min="0" step="1" inputmode="numeric" placeholder="opsiyonel" value="'+esc(draft.timestamp)+'" oninput="App.quranNoteField(\'timestamp\',this)"></label><label>Etiket<input'+disabled+' type="text" maxlength="40" placeholder="ör. sabır" value="'+esc(draft.tag)+'" oninput="App.quranNoteField(\'tag\',this)"></label></div>';
  h+='<label class="quran-v2-note-text">Notun<textarea'+disabled+' rows="3" maxlength="2000" placeholder="Bu anlatımda sende ne kaldı?" oninput="App.quranNoteField(\'text\',this)">'+esc(draft.text)+'</textarea></label>';
  h+='<button type="submit" class="quran-v2-note-save"'+(canEdit?'':' disabled aria-disabled="true"')+'>'+icon(canEdit?'save':'lock',15)+'<span>'+(canEdit?'Notu kaydet':'Video hazır olduğunda açılır')+'</span></button></form>';
  return h;
}

function quranVideoNotesHTML(x,req){
  var QURAN_VIDEO_ID_RE=call('QURAN_VIDEO_ID_RE',[]);
  req=req&&typeof req==='object'?req:{};
  var status=String(req.status||'idle'), active=['ready','watching','watched','question_opened'].indexOf(status)>=0&&QURAN_VIDEO_ID_RE.test(String(req.videoId||''));
  return '<section id="quran-video-notes" class="quran-v2-notes'+(active?'':' is-locked')+'" aria-label="Video notları">'+quranVideoNotesInnerHTML(x,req)+'</section>';
}

function quranVideoCardHTML(x,req){
  var ui=liveUi(), QURAN_VIDEO_ID_RE=call('QURAN_VIDEO_ID_RE',[]);
  var vid=req.videoId;
  if(!QURAN_VIDEO_ID_RE.test(String(vid||''))) return '';
  var loaded=(ui.quranPlayerLoadedId===x.id);
  var h='<section class="quran-v2-video" aria-label="'+esc(x.nameTr)+' Sûresi anlatımı">';
  h+='<div class="quran-v2-video-badge">'+icon('circle-check',13)+'<span>Raşit’in anlatımı hazır</span></div>';
  h+='<div id="quran-video-frame" class="quran-v2-video-frame">';
  if(loaded){
    // Dar allow listesi: "autoplay" BİLEREK yok — otomatik oynatma URL
    // parametresiyle istense bile Permissions-Policy bunu engeller. Sandbox,
    // youtube-nocookie.com ÇAPRAZ KÖKENLİ (bizim sayfamızla aynı origin
    // DEĞİL) olduğu için allow-scripts+allow-same-origin birlikte
    // kullanılabilir — izolasyon zaafı yalnız aynı-köken/saldırgan kontrollü
    // içerikte oluşur, resmi YouTube oynatıcısında değil. `enablejsapi=1`
    // + `origin` QY-13'ün ENDED algısı için gerekli (quranAttachPlayer).
    h+='<iframe id="quran-yt-player" src="https://www.youtube-nocookie.com/embed/'+esc(vid)+'?rel=0&modestbranding=1&playsinline=1&start=0&enablejsapi=1&origin='+esc(quranEmbedOrigin())+'" '
      +'title="'+esc(x.nameTr)+' Sûresi anlatımı" loading="lazy" '
      +'allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen '
      +'referrerpolicy="strict-origin-when-cross-origin" '
      +'sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe>';
  } else {
    h+='<button class="cover" onclick="App.quranJourneyWatch(\''+esc(x.id)+'\')" aria-label="'+esc(x.nameTr)+' Sûresi anlatımını oynat">';
    h+='<img src="'+quranVideoThumbUrl(vid)+'" alt="" loading="lazy" onerror="this.hidden=true;this.parentNode.classList.add(\'no-thumb\')">';
    h+='<span class="play" aria-hidden="true">'+icon('play',22)+'</span>';
    h+='<span class="cta-label">İzlemeye başla</span>';
    h+='</button>';
  }
  h+='</div>';
  // QY-13 madde 2: API engellenirse/yüklenemezse görünür erişilebilir yedek.
  // Yalnız `watching`te gösterilir — zaten izlenmiş bir anlatımda tekrar
  // "İzledim" istemek kafa karıştırıcı olur (repaint bu durumu otomatik
  // düşürür, ayrı bir gizleme mantığı gerekmez).
  if(loaded&&req.status==='watching'){
    h+='<button id="quran-watched-fallback" class="quran-v2-watched-fallback" onclick="App.quranMarkWatched(\''+esc(x.id)+'\')">'+icon('circle-check',15)+'<span>İzledim</span></button>';
  }
  if(req.readyAt) h+='<p class="quran-v2-video-meta">Hazır: '+esc(fmtDateNice(req.readyAt))+'</p>';
  h+='</section>';
  return h;
}

function quranVideoUnavailableHTML(){
  return '<section class="quran-v2-video is-unavailable" role="status" aria-live="polite">'
    +'<p><strong>Bu anlatım artık erişilebilir değil.</strong><br>Raşit’ten yeni bir bağlantı istenebilir.</p></section>';
}

function quranDetailBodyHTML(x){
  var data=liveData(), QURAN_VIDEO_ID_RE=call('QURAN_VIDEO_ID_RE',[]);
  var q=ensureQuranJourney(data), req=quranRequestOf(q,x.id), st=req.status||'idle';
  var state=quranRowState(st), total=quranTotal(), disputed=quranPlaceDisputed(x.id);
  var h='<header class="quran-v2-detail-head">';
  h+='<span class="stop">'+x.revelationOrder+'. DURAK · '+total+' SÛRELİK YOLCULUK</span>';
  h+='<h2 id="quran-detail-title" tabindex="-1"><span class="arabic" lang="ar" dir="rtl">'+esc(x.nameAr)+'</span><span class="tr">'+esc(x.nameTr)+' Sûresi</span></h2>';
  h+='</header>';
  h+='<dl class="quran-v2-facts">';
  h+='<div><dt>Nüzul sırası</dt><dd>'+x.revelationOrder+' / '+total+'</dd></div>';
  h+='<div><dt>Mushaf sırası</dt><dd>'+x.mushafOrder+' / '+total+'</dd></div>';
  h+='<div><dt>Nüzul yeri</dt><dd>'+esc(quranPlaceLabel(x))+(disputed?' <i class="disp" aria-hidden="true">*</i>':'')+'</dd></div>';
  h+='<div><dt>Âyet sayısı</dt><dd>'+x.ayahCount+'</dd></div>';
  h+='</dl>';
  h+='<p class="quran-v2-theme">'+esc(x.themeTr)+'</p>';
  if(disputed) h+='<p class="quran-v2-foot">* Bu sûrenin Mekkî/Medenî nitelemesi klasik kaynaklarda ihtilaflıdır.</p>';
  h+='<div id="quran-detail-status" class="quran-v2-status is-'+state.tone+'" role="status" aria-live="polite"><i class="dot" aria-hidden="true"></i>';
  h+='<span><strong>'+esc(state.label)+'</strong><em>'+esc(quranStatusNote(st,x.nameTr))+'</em></span></div>';
  // QY-12/QY-19/QY-20: video kartı hazır/izleniyor durumlarında
  // “İzlemeye başla” birincil eylemdir; kalıcı WhatsApp “Raşit’e sor” eylemi
  // aşağıda ayrı ve video durumundan bağımsız etkin görünür. video_gone
  // (video_unavailable) durumunda kart yerine yalnız açıklama basılır, genel
  // CTA ("Yeni bağlantı iste") kalır.
  var hasVideoCard=(st==='ready'||st==='watching'||st==='watched'||st==='question_opened')&&QURAN_VIDEO_ID_RE.test(String(req.videoId||''));
  var ctaReplacedByCard=hasVideoCard&&(st==='ready'||st==='watching');
  if(hasVideoCard) h+=quranVideoCardHTML(x,req);
  else if(st==='video_unavailable') h+=quranVideoUnavailableHTML();
  h+=quranVideoNotesHTML(x,req);
  h+='<div id="quran-detail-action-region" class="quran-v2-action-region">';
  h+=quranDetailActionsHTML(x.id,req,ctaReplacedByCard);
  h+='</div>';
  if(req.videoHistory&&req.videoHistory.length){
    h+='<div class="quran-v2-history"><h3>Önceki anlatımlar</h3><ul>';
    req.videoHistory.slice().reverse().forEach(function(v){
      h+='<li><b>'+esc(v.videoId)+'</b><span>'+esc(v.reason||'arşivlendi')+'</span></li>';
    });
    h+='</ul></div>';
  }
  h+='<button class="quran-v2-back-link" onclick="App.backToQuranLibrary()">'+icon('chevron-left',14)+'<span>Kütüphaneye dön</span></button>';
  return h;
}

function quranCtaButtonHTML(action,extraClass){
  var disabled=!!action.disabled;
  var klass='quran-v2-cta'+(extraClass?' '+extraClass:'')+(disabled?' is-disabled':'');
  var attrs=disabled?' disabled aria-disabled="true"':' onclick="'+action.action+'"';
  return '<button class="'+klass+'"'+attrs+'>'+icon(action.icon||'send',16)+'<span>'+esc(action.label)+'</span></button>';
}

function quranDetailActionsHTML(id,req,ctaReplacedByCard){
  var act=quranDetailAction(id,req), ask=quranQuestionAction(id,req);
  var isQuestionPrimary=act.label==='Raşit’e sor';
  var showPrimary=!isQuestionPrimary&&!ctaReplacedByCard;
  var h='<div class="quran-v2-action-buttons'+(showPrimary?' has-primary':' is-single')+'">';
  if(showPrimary) h+=quranCtaButtonHTML(act,'is-primary');
  h+=quranCtaButtonHTML(ask,'is-secondary');
  h+='</div>';
  if(showPrimary&&act.hint) h+='<p class="quran-v2-hint">'+esc(act.hint)+'</p>';
  if(ask.hint) h+='<p class="quran-v2-hint quran-v2-question-hint">'+esc(ask.hint)+'</p>';
  return h;
}

function aeonPopupHTML(o){
  var inner='';
  inner+='<div style="position:relative;overflow:hidden;border-radius:22px;padding:16px 17px 15px;background:rgba(24,19,28,0.72);backdrop-filter:blur(30px) saturate(185%);-webkit-backdrop-filter:blur(30px) saturate(185%);border:1px solid rgba(230,193,90,0.30);box-shadow:0 24px 62px rgba(0,0,0,0.44),inset 0 1px 0 rgba(255,255,255,0.10);font-family:-apple-system,BlinkMacSystemFont,\'SF Pro Text\',system-ui,sans-serif;">';
  inner+='<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 90% at 88% -12%,rgba(230,193,90,0.22),transparent 58%);"></div>';
  inner+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
  inner+='<div style="flex-shrink:0;width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#F0D274,#C99A3A);display:flex;align-items:center;justify-content:center;color:#1a1404;box-shadow:0 8px 22px rgba(201,160,60,0.5),inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('hexagon',20)+'</div>';
  inner+='<div style="flex:1;min-width:0;">';
  inner+='<div style="display:flex;align-items:center;gap:7px;"><span style="font-size:var(--f-subhead);font-weight:800;letter-spacing:1.5px;background:linear-gradient(180deg,#F3E4B0,#D4AF37);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">ÆON</span><span style="font-size:var(--f-caption2);color:rgba(255,255,255,0.5);font-weight:700;">· '+o.label+'</span>'+(o.when?'<span style="margin-left:auto;font-size:var(--f-caption2);color:rgba(255,255,255,0.45);font-weight:600;">'+esc(o.when)+'</span>':'')+'</div>';
  inner+='<div style="font-size:var(--f-subhead);line-height:1.5;color:rgba(255,255,255,0.92);margin-top:5px;word-break:break-word;">'+esc(o.txt)+(o.trunc?'…':'')+'</div>';
  if(o.more>0) inner+='<div style="font-size:var(--f-caption1);color:#E6C15A;margin-top:6px;font-weight:700;">+'+o.more+' '+o.moreLabel+'</div>';
  inner+='<div style="display:flex;gap:8px;margin-top:13px;">';
  inner+='<button onclick="App.openMesaj()" style="flex:1;border:none;cursor:pointer;background:linear-gradient(135deg,#F0D274,#C99A3A);color:#1a1404;font-weight:800;font-size:var(--f-footnote);padding:10px;border-radius:13px;box-shadow:0 8px 18px rgba(201,160,60,0.4);font-family:inherit;">Gör</button>';
  inner+='<button onclick="'+o.copyFn+'" aria-label="Kopyala" style="flex-shrink:0;border:1px solid rgba(255,255,255,0.14);cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.78);width:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;">'+icon('copy',16)+'</button>';
  inner+='<button onclick="'+o.shareFn+'" aria-label="Paylaş" style="flex-shrink:0;border:1px solid rgba(255,255,255,0.14);cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.78);width:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;">'+icon('share-2',16)+'</button>';
  inner+='</div></div>';
  inner+='<button onclick="'+o.closeFn+'" aria-label="Kapat" style="position:absolute;top:10px;right:11px;border:none;background:none;cursor:pointer;color:rgba(255,255,255,0.42);line-height:1;display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button>';
  inner+='</div>';
  return inner;
}

function aeonNotifyBannerHTML(opts){
  var AEON_ICON_URL=call('AEON_ICON_URL',[]);
  opts=opts||{};
  var compact=!!opts.compact;
  var title=opts.title || 'ÆON mesajları kilit ekranında';
  var sub=opts.subtitle || 'Bildirim izni ver, hiçbir şey kaçırma.';
  var cls=compact?'aeon-notify-nudge':'aeon-notify-banner';
  var h='<div id="'+esc(opts.id||'aeon-notify-banner')+'" class="'+cls+'" >';
  h+='<div class="aeon-notify-badge"><img src="'+esc(AEON_ICON_URL)+'" alt="ÆON"></div>';
  h+='<div class="aeon-notify-text">';
  h+='<div class="aeon-notify-title">'+esc(title)+'</div>';
  h+='<div class="aeon-notify-sub">'+esc(sub)+'</div>';
  h+='</div>';
  h+='<div class="aeon-notify-actions">';
  h+='<button class="aeon-notify-btn" onclick="App.requestAeonPermissionFromBanner(\''+esc(opts.context||'banner')+'\')" aria-label="Bildirim izni ver">İzin Ver</button>';
  if(!compact) h+='<button class="aeon-notify-close" onclick="App.dismissAeonNotifyBanner()" aria-label="Kapat">'+icon('x',16)+'</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function notifCardHTML(n){
  var when=''; try{ when=new Date(n.ts||n.receivedAt).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var unread=!n.read, s='';
  s+='<div style="position:relative;background:var(--card);border:1px solid '+(unread?'rgba(201,160,60,0.5)':'rgba(150,110,120,0.14)')+';border-radius:18px;padding:13px 14px;box-shadow:0 4px 14px rgba(150,110,120,0.08);margin-bottom:9px;'+(unread?'border-left:3px solid #D4AF37;':'')+'">';
  s+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
  s+='<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f-caption1);font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 11px;">'+icon('hexagon',12)+' ÆON</span>';
  if(unread) s+='<span style="width:8px;height:8px;border-radius:50%;background:#E9576F;box-shadow:0 0 7px #E9576F;"></span>';
  s+='<span style="font-size:var(--f-caption1);color:var(--faint);margin-left:auto;font-weight:600;">'+esc(when)+'</span></div>';
  s+='<div style="font-size:var(--f-subhead);line-height:1.5;color:var(--text2);word-break:break-word;white-space:pre-wrap;">'+esc(String(n.text||''))+'</div>';
  s+='<div style="display:flex;align-items:center;gap:4px;margin-top:10px;"><span style="font-size:var(--f-caption2);color:var(--faint);font-weight:600;display:flex;align-items:center;gap:3px;">'+(n.read?(icon('check-check',12)+' Okundu'):'• Yeni')+'</span>';
  s+='<button data-fx="destructive" onclick="App.deleteNotif(\''+n.id+'\')" style="margin-left:auto;border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;padding:6px 12px;border-radius:10px;display:flex;align-items:center;gap:4px;">'+icon('trash-2',12)+' Sil</button></div></div>';
  return s;
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
    habitRowHTML:habitRowHTML,
    reportHTML:reportHTML,
    authGateHTML:authGateHTML,
    locationGateHTML:locationGateHTML,
    psychSosHTML:psychSosHTML,
    psychHTML:psychHTML,
    psychResultHTML:psychResultHTML,
    moodCardHTML:moodCardHTML,
    reflectionCardHTML:reflectionCardHTML,
    habitsCardHTML:habitsCardHTML,
    healthSetupCardHTML:healthSetupCardHTML,
    vacationCardHTML:vacationCardHTML,
    hubTilesHTML:hubTilesHTML,
    rasitBubbleHTML:rasitBubbleHTML,
    heroStatsHTML:heroStatsHTML,
    heroTargetsHTML:heroTargetsHTML,
    heroPremiumStatsHTML:heroPremiumStatsHTML,
    rasitContactHTML:rasitContactHTML,
    zikroverlayHTML:zikroverlayHTML,
    quranJourneyHubCardHTML:quranJourneyHubCardHTML,
    quranJourneyOverlayHTML:quranJourneyOverlayHTML,
    quranRemoteStatusHTML:quranRemoteStatusHTML,
    quranHeadLeadHTML:quranHeadLeadHTML,
    quranLibraryViewHTML:quranLibraryViewHTML,
    quranLibraryResultsHTML:quranLibraryResultsHTML,
    quranRowHTML:quranRowHTML,
    quranDetailViewHTML:quranDetailViewHTML,
    quranVideoNotesInnerHTML:quranVideoNotesInnerHTML,
    quranVideoNotesHTML:quranVideoNotesHTML,
    quranVideoCardHTML:quranVideoCardHTML,
    quranVideoUnavailableHTML:quranVideoUnavailableHTML,
    quranDetailBodyHTML:quranDetailBodyHTML,
    quranCtaButtonHTML:quranCtaButtonHTML,
    quranDetailActionsHTML:quranDetailActionsHTML,
    aeonPopupHTML:aeonPopupHTML,
    aeonNotifyBannerHTML:aeonNotifyBannerHTML,
    notifCardHTML:notifCardHTML,
    modalsHTML:modalsHTML,
    render:render
  };
})();
