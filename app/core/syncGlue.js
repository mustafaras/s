(function(){
  'use strict';
  // MON-17 · syncGlue save gövde aktarımı
  // ---------------------------------------------------------------------------
  // Amaç: save() gövdesini strict-mode yükleme sırasını ve sync semantiğini
  // değiştirmeden registryye almak.
  //
  // Yükleme güvenliği: Bu dosya app.js'ten önce çalışır. Registry yalnızca
  // fonksiyonları ve lazy resolverları kaydeder; DOM/localStorage/ağ/timer işi
  // kayıt anında yapılmaz.
  //
  // Yüzey sahipliği:
  // - `SeyOnSyncState` (6134) ve `SeyOnSynced` (6144) ZATEN `app.js` tarafından
  //   `window`'a atanır. Burada yeniden tanımlanmaz; getter-only trap strict-mode
  //   atamasını kıracağından callback sahipliği app.js'te kalır.
  // - `save()` (6165) app.js'te aynı imzayı koruyan shim olarak kalır. Gerçek
  //   gövde burada `SeymaSave.save` registry üyesi olarak yaşar.
  //
  // `data` ve `ui` doğrudan snapshot olarak değil resolver olarak bağlanır.
  // `SeySync` de app.js'ten sonra yüklendiği için çağrı anında çözülür.

  var saveDeps=null;
  var SAVE_DEPENDENCIES=[
    'data','ui','activeDate','syncDerivedHabits','normalizeSyncReceipt',
    'appendEvent','mergePersistedReminderState','reminderSyncPayload',
    'updateHeaderSave','storage','sync'
  ];

  function registerSave(deps){
    if(saveDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<SAVE_DEPENDENCIES.length;i++){
      if(typeof deps[SAVE_DEPENDENCIES[i]]!=='function') return false;
    }
    if(typeof deps.key!=='string'||!deps.key) return false;
    saveDeps=deps;
    return true;
  }

  function save(touchSource,eventSpec){
    // save(false) canlı oturum/boot metadata'sı içindir; eventSpec veya normal
    // save() ise kullanıcı değişikliğidir ve header hatırlatıcısını uyandırır.
    if(!saveDeps) return;
    var dep=saveDeps, data=dep.data(), ui=dep.ui();
    if(touchSource!==false||eventSpec) { ui.saveState='dirty'; dep.updateHeaderSave(); }
    try{ var _a=dep.activeDate(); var _d=data&&data.days&&data.days[_a]; if(_d&&_d.habits) dep.syncDerivedHabits(_d,_a); }catch(e){}
    try{
      var _now=new Date().toISOString();
      data.syncReceipt=dep.normalizeSyncReceipt(data.syncReceipt);
      if(touchSource!==false&&eventSpec) dep.appendEvent(data,eventSpec.message,eventSpec.meta);
      if(touchSource!==false){
        data.savedAt=_now;
        data.syncReceipt.sourceUpdatedAt=_now;
        data.syncReceipt.status=data.syncReceipt.status==='accepted'?'local_saved':data.syncReceipt.status;
        data.syncReceipt.submittedAt=null; data.syncReceipt.lastErrorCode=null;
      }
      // Two tabs may hold different in-memory snapshots. Merge the local-only
      // reminder owner immediately before the full local write so an older tab
      // cannot erase a newer preference from shared localStorage. The remote
      // sync projection remains reminder-free below.
      dep.mergePersistedReminderState(_now);
      var storage=dep.storage();
      storage.setItem(dep.key,JSON.stringify(data));
    }catch(e){}
    // REM-04: canonical preferences remain local app state until the dedicated
    // sync sanitize contract is implemented. Fail closed if a JSON projection
    // cannot be produced; never hand the private reminders subtree to sync.
    var syncData=dep.reminderSyncPayload(data);
    var sync=dep.sync();
    if(sync&&syncData){ try{ sync.schedule(syncData); }catch(e){} }
  }

  window.SeymaSave={
    get save(){ return saveDeps ? save : undefined; },
    registerSave: registerSave
  };
})();
