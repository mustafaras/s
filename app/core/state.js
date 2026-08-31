(function(){
  'use strict';
  // FX-P-02 · Faz -1.1 — state.js iskeleti
  // ---------------------------------------------------------------------------
  // Amaç: `data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData`
  // yüzeylerini `window.SeymaState` altında merkezileştirmek.
  //
  // ÖNEMLİ (değişmez I2 / I3 / I4): Bu prompt yalnızca yeni dosya yazar;
  // `app.js` içeriği DEĞİŞMEZ. `data`, `ui`, `dark`, `migrate`, `getDay`,
  // `createDefaultData` hâlâ `app.js`'in IIFE kapsamında tanımlıdır ve henüz
  // `window` üzerinde expose edilmemiştir. Bu modül `app.js`'ten ÖNCE yüklenir.
  //
  // Bu yüzden burada "yumuşak bağ" (soft-bind) kullanılır: her üye, `window`
  // üzerinden çözümlenen bir lazy getter'dır. `app.js` ilgili yüzeyi `window`'a
  // expose ettiğinde (Faz 0'da) bu getter'lar otomatik olarak gerçek değeri
  // döndürür; henüz expose edilmediği sürece güvenle `null`/`undefined` döner.
  // Böylece mevcut davranış bozulmaz ve modüller `window.SeymaState.data`
  // üzerinden ileride tek kaynağa geçebilir.
  //
  // Not: `emptyDay` plan belgelerinde geçer ancak `app.js`'te böyle bir
  // fonksiyon YOKTUR (yalnızca `getDay` içinde satır içi day şablonu vardır).
  // Bu yüzden `emptyDay` burada expose edilmez; `getDay` yüzeyi yeterlidir.

  function soft(name){
    // `window[name]` üzerinden çözümlenen lazy getter.
    return function(){
      try{ return window[name]; }catch(e){ return null; }
    };
  }

  window.SeymaState = {
    get data(){ return soft('data')(); },
    get ui(){ return soft('ui')(); },
    get dark(){ return soft('dark')(); },
    get migrate(){ return soft('migrate')(); },
    get getDay(){ return soft('getDay')(); },
    get createDefaultData(){ return soft('createDefaultData')(); }
  };
})();
