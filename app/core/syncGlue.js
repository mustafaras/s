(function(){
  'use strict';
  // FX-P-02 · Faz -1.1 — syncGlue.js iskeleti
  // ---------------------------------------------------------------------------
  // Amaç: `save()`, `SeyOnSyncState`, `SeyOnSynced` yüzeylerini merkezileştirmek.
  //
  // ÖNEMLİ (değişmez I4): Bu prompt yalnızca yeni dosya yazar; `app.js` ve
  // `sync.js` içeriği DEĞİŞMEZ. `save()` hâlâ `app.js`'in IIFE kapsamındadır
  // ve henüz `window` üzerinde expose edilmemiştir. `SeyOnSyncState` ve
  // `SeyOnSynced` ise `app.js` tarafından zaten `window` üzerinde tanımlanır.
  //
  // Bu modül `app.js`'ten ÖNCE yüklenir; bu yüzden "yumuşak bağ" (soft-bind)
  // kullanılır: her üye `window` üzerinden çözümlenen bir lazy getter'dır.
  // `save()` Faz 0'da `window.SeymaSave` olarak expose edildiğinde bu getter
  // otomatik olarak gerçek fonksiyonu döndürür; henüz yoksa güvenle `undefined`
  // döner. `SeyOnSyncState`/`SeyOnSynced` zaten `window`'da olduğundan bu
  // getter'lar hemen çalışır.

  function soft(name){
    return function(){
      try{ return window[name]; }catch(e){ return null; }
    };
  }

  window.SeymaSave = soft('save');
  window.SeyOnSyncState = soft('SeyOnSyncState');
  window.SeyOnSynced = soft('SeyOnSynced');
})();
