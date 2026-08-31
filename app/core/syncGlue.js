(function(){
  'use strict';
  // FX-P-02 · Faz -1.1 — syncGlue.js iskeleti
  // ---------------------------------------------------------------------------
  // Amaç: `save()`, `SeyOnSyncState`, `SeyOnSynced` yüzeylerini merkezileştirmek.
  //
  // ÖNEMLİ (değişmez I4): Bu prompt yalnızca yeni dosya yazar; `app.js` ve
  // `sync.js` içeriği DEĞİŞMEZ.
  //
  // Yüzey sahipliği:
  // - `SeyOnSyncState` (6198) ve `SeyOnSynced` (6208) ZATEN `app.js` tarafından
  //   `window`'a atanır. Burada yeniden tanımlanmaz — getter-only accessor
  //   yapılırsa `app.js`'in `"use strict"` IIFE'sindeki `window.SeyOnSynced = ...`
  //   ataması setter olmadığı için THROW eder ve boot kırılır. Bu yüzden bu
  //   iki yüzey `app.js`'e bırakılır.
  // - `save()` (6229) closure-scoped'tır, `window`'da değildir. `SeymaSave`
  //   YENİ bir isimdir (app.js onu atamaz), bu yüzden güvenle getter olarak
  //   tanımlanabilir. `save()` Faz 0'da `window.save` olarak expose edildiğinde
  //   `SeymaSave` getter'ı otomatik olarak gerçek fonksiyonu döndürür; henüz
  //   yoksa güvenle `undefined` döner.
  //
  // NOT: `SeymaSave` bir getter'dır — `window.save`'i döndürür, onu saran bir
  // fonksiyon DEĞİLDİR. Böylece `SeymaSave(touchSource, eventSpec)` doğrudan
  // `save`'i çağırır (plan: `window.SeymaSave = save`).

  function soft(name){
    return function(){
      try{ return window[name]; }catch(e){ return null; }
    };
  }

  Object.defineProperty(window, 'SeymaSave', {
    get: soft('save'),
    configurable: true
  });
})();
