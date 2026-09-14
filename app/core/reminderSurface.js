// MON2-01 · reminder yüzey registry iskeleti.
// MON2-03 bu modüle reminder alanının yan etkili gövdelerini (permission,
// native, lifecycle, action, inbox) ve App.*reminder* handler gövdelerini
// taşır. App nesnesi, data rebind'leri, save/render sırası, timer/listener
// kaydı ve inline caller yüzeyi app.js'te kalır; bu modül yüklemede yalnız
// registry kurar, DOM/ağ/timer/storage okumaz (S5). Bağımlılık bag'i MON-50
// appSurface deseniyle app.js'ten alınır; K3 gereği mutable reminder
// değişkenleri app.js'te kalır ve get/set çifti olarak verilir.
(function(){
  'use strict';

  var reminderSurfaceDeps=null;
  // MON2-01: çekirdek liste. MON2-03 gövde taşırken bu listeyi genişletir
  // (toast, todayStr, document, localStorage, notification, K3 get/set çiftleri…).
  var REMINDER_SURFACE_DEPENDENCIES=['data','ui','app','save','render'];

  function registerReminderSurface(deps){
    if(reminderSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REMINDER_SURFACE_DEPENDENCIES.length;i++){
      if(typeof deps[REMINDER_SURFACE_DEPENDENCIES[i]]!=='function') return false;
    }
    reminderSurfaceDeps=deps;
    return true;
  }

  function dep(name){ return reminderSurfaceDeps&&typeof reminderSurfaceDeps[name]==='function'?reminderSurfaceDeps[name]:null; }
  function call(name,args){ var fn=dep(name); if(!fn) throw new Error('SeymaReminderSurface: çözümlenemeyen bağımlılık '+name); return fn.apply(null,args||[]); }
  function liveData(){ return call('data'); }
  function liveUi(){ return call('ui'); }
  function app(){ return call('app'); }
  function isRegistered(){ return !!reminderSurfaceDeps; }

  // RUNTIME_MODULES sözleşmesi (test_reminder_app_acceptance): dondurulmuş ad alanı.
  window.SeymaReminderSurface=Object.freeze({
    REMINDER_SURFACE_DEPENDENCIES:REMINDER_SURFACE_DEPENDENCIES.slice(),
    registerReminderSurface:registerReminderSurface,
    isRegistered:isRegistered,
    liveData:liveData,
    liveUi:liveUi,
    app:app
  });
})();
