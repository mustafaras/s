// MON2-02 düzeltme · modül tarafı (app/core/reminders.js)
// 1) REQUIRED_DEPENDENCIES'ten 'external' düşer (object-literal bag reddediliyordu)
// 2) REQUIRED_VIEW_DEPENDENCIES'ten 'sections' düşer (modül kendi bölümlerini üretir)
// 3) FALLBACK_POLICY_DEFAULTS + dailyFlowBudget:3
// 4) eager PRAYER_ORDER.slice() -> lazy reminderPrayerKeys()
// 5) sections viewCall -> iç üretim (15 builder)
// 6) previewSafeCopy wrapper -> gerçek gövde (HEAD:5653)
// 7) restore edilecek gövdeler + REM-47 kopyaları + kilit üçlüsü silinir
const fs = require('fs');
const file = 'app/core/reminders.js';
let src = fs.readFileSync(file, 'utf8');
const origLines = src.split('\n').length;
const report = [];

function replaceOnce(from, to, label) {
  if (!src.includes(from)) { report.push('BULUNAMADI: ' + label); return; }
  src = src.replace(from, () => to);
  report.push('OK: ' + label);
}

// --- 1) REQUIRED_DEPENDENCIES ---
replaceOnce(
  "var REQUIRED_DEPENDENCIES=['catalog','engine','scheduler','data','ui','liveData','liveUi','call','external'];",
  "var REQUIRED_DEPENDENCIES=['catalog','engine','scheduler','data','ui','liveData','liveUi','call'];",
  "REQUIRED_DEPENDENCIES - external düşürüldü"
);

// --- 2) REQUIRED_VIEW_DEPENDENCIES ---
replaceOnce(
  "var REQUIRED_VIEW_DEPENDENCIES=['ui','root','definitions','copy','icon','esc','normalizePolicy','permissionSnapshot','permissionExplanation','profileLabel','sections','deepLinkTarget','previewSafeCopy','channels','validTime'];",
  "var REQUIRED_VIEW_DEPENDENCIES=['ui','root','definitions','copy','icon','esc','normalizePolicy','permissionSnapshot','permissionExplanation','profileLabel','deepLinkTarget','previewSafeCopy','channels','validTime'];",
  "REQUIRED_VIEW_DEPENDENCIES - sections düşürüldü"
);

// --- 3) FALLBACK_POLICY_DEFAULTS + dailyFlowBudget ---
replaceOnce(
  "  var FALLBACK_POLICY_DEFAULTS={\n    nativeDailyCap:3,",
  "  var FALLBACK_POLICY_DEFAULTS={\n    dailyFlowBudget:3,\n    nativeDailyCap:3,",
  "FALLBACK_POLICY_DEFAULTS + dailyFlowBudget"
);

// --- 4) eager PRAYER_ORDER -> lazy ---
replaceOnce(
  "  var REMINDER_PRAYER_KEYS=PRAYER_ORDER.slice();",
  "  var REMINDER_PRAYER_KEYS=null;\n  function reminderPrayerKeys(){ if(!REMINDER_PRAYER_KEYS){ try{ REMINDER_PRAYER_KEYS=PRAYER_ORDER.slice(); }catch(e){ REMINDER_PRAYER_KEYS=[]; } } return REMINDER_PRAYER_KEYS; }",
  "PRAYER_ORDER lazy başlatma"
);

// --- 5) sections viewCall -> iç nesne ---
const sectionsOld = "sections=viewCall('sections',[rootValue,permission],{})||{}";
const sectionsNew = "sections=(function(){ var uiv=viewDep('ui',{})||{}; return { notice:reminderCenterNoticeHTML(), systemStatus:reminderSystemStatusHTML(), profile:reminderProfileSectionHTML(rootValue), digestLauncher:reminderDigestLauncherHTML(), digest:uiv.reminderDigestOpen?reminderDigestHTML():'', testPreview:reminderTestPreviewHTML(), policy:reminderCenterPolicyHTML(rootValue), personalization:reminderPersonalizationHTML(rootValue), permission:reminderPermissionExplanationHTML(permission), categories:reminderCategoryControlsHTML(rootValue), specialDays:reminderSpecialDaysSectionHTML(rootValue), care:reminderCareControlsHTML(rootValue), medication:reminderMedicationSectionHTML(rootValue), history:reminderCenterHistoryHTML(), retention:reminderCenterRetentionHTML() }; })()";
replaceOnce(sectionsOld, sectionsNew, "sections iç üretim");
// var zincirinde sections artık IIFE sonucu; var bildiriminde `sections=` zaten var

// --- 6) previewSafeCopy gerçek gövde ---
replaceOnce(
  "  function reminderPreviewSafeCopy(def){\n    return reminderPreviewSafeCopyLegacy.apply(null,arguments);\n  }",
  "  function reminderPreviewSafeCopy(def){\n    var category=reminderCategoryMeta(String(def&&def.category||''));\n    return {title:reminderCopy('inApp.preview.syntheticTitle','Şeyma’da küçük bir durak hazır'),detail:category.label+' '+reminderCopy('inApp.preview.syntheticDetail','için yalnızca uygulama içinde gösterilen sentetik test.')};\n  }",
  "previewSafeCopy gerçek gövde"
);

// --- 7) silinecek gövdeler ---
const DELETE_FNS = [
  'reminderEventDigest','reminderEventCorrelation','appendReminderEvent','persistReminderEvent','reminderEventActionForDelivery',
  'reminderSchemaCompatibility','reminderSchemaStatusForData',
  'reminderPreviewNotification','reminderNativeDisplay',
  'reminderCurrentRoot','migrateReminderState','reminderSystemOffline',
  'reminderDeliveryStorageRead','reminderDeliveryStorageWrite','reminderDeliveryClear',
  'reminderPermissionSnapshot','reminderPermissionStorageRead','reminderPermissionStorageWrite','reminderPermissionEverGrantedRead','reminderPermissionRecord','reminderPermissionRequest','reminderPermissionState','reminderPermissionCanRequest',
  'mergePersistedReminderState',
  'reminderLifecycleDefaultContext','reminderLifecycleDraftActive','reminderLifecycleReplaceTarget','reminderLifecycleUpdateLive','reminderLifecycleRenderIfNeeded',
  'reminderSchedulerEnsure','reminderSchedulerDispatch','reminderSchedulerSnapshot',
  'reminderActionStorageRead','reminderActionStorageWrite','reminderActionCommit',
  'reminderLockBodyScroll','reminderUnlockBodyScroll','reminderActiveElementId','reminderRestoreFocus',
  'updateReminderPolicy','reminderSetEnabled','reminderRemoveLocalKey','reminderCloseForTarget'
];
const DELETE_VARS = ['REMINDER_EVENT_ACTIONS', 'REMINDER_EVENT_SUMMARY'];

const lines = src.split('\n');
function deleteSpan(lines, name, isFn) {
  let start = -1;
  if (isFn) {
    for (let i = 0; i < lines.length; i++) {
      const re = new RegExp('^  function ' + name + '\\(');
      if (re.test(lines[i])) { start = i; break; }
    }
    if (start === -1) { report.push('FN YOK: ' + name); return 0; }
    const first = lines[start].replace(/\s+$/, '');
    let end = first.endsWith('}') ? start : -1;
    if (end === -1) {
      for (let j = start + 1; j < lines.length; j++) {
        if (/^  \}(?!\s*else)/.test(lines[j])) { end = j; break; }
      }
    }
    if (end === -1) { report.push('SON BULUNAMADI: ' + name); return 0; }
    lines.splice(start, end - start + 1);
    report.push('SİL: function ' + name + ' (' + (end - start + 1) + ' satır)');
    return end - start + 1;
  }
  for (let i = 0; i < lines.length; i++) {
    const re = new RegExp('^  var ' + name + '=');
    if (re.test(lines[i])) {
      lines.splice(i, 1);
      report.push('SİL: var ' + name);
      return 1;
    }
  }
  report.push('VAR YOK: ' + name);
  return 0;
}

// Önce fonksiyonları tek tek sil
let total = 0;
for (const name of DELETE_FNS) total += deleteSpan(lines, name, true);
for (const name of DELETE_VARS) total += deleteSpan(lines, name, false);

// Helper varlar (kilit üçlüsüne ait) — silinen gövdelerle artık kullanıcısı kalmamalı; varsa tanımı sil
function deleteBareVar(name) {
  const re = new RegExp('^  var ' + name + '=.*$');
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      lines.splice(i, 1);
      report.push('SİL: helper var ' + name);
      return 1;
    }
  }
  report.push('helper var yok (tamam): ' + name);
  return 0;
}
['_reminderBodyLocked', '_reminderBodyPrevOverflow', '_reminderBodyPrevOverscrollBehavior',
 'reminderPermissionTransientState', 'reminderPermissionRequestInFlight',
 'reminderPermissionEverGranted', 'reminderPermissionGrantObserved'].forEach(deleteBareVar);

fs.writeFileSync(file, lines.join('\n'));
report.push('---');
report.push('Satır: ' + origLines + ' -> ' + lines.length + ' (silen toplam: ' + total + ')');
console.log(report.join('\n'));