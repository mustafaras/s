(function(){
  'use strict';
  function pad(n){ return String(n).padStart(2,'0'); }
  function fmt(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function todayStr(){ return fmt(new Date()); }
  function addDays(s,n){
    var p=s.split('-').map(Number);
    var dt=new Date(p[0],p[1]-1,p[2]);
    dt.setDate(dt.getDate()+n);
    return fmt(dt);
  }
  function diffDays(a,b){
    var pa=a.split('-').map(Number),pb=b.split('-').map(Number);
    var da=new Date(pa[0],pa[1]-1,pa[2]),db=new Date(pb[0],pb[1]-1,pb[2]);
    return Math.round((db-da)/86400000);
  }
  function shortDate(s){ var p=s.split('-'); return p[2]+'.'+p[1]; }
  function dateLabelTR(s){
    if(!s) return '';
    var p=s.split('-').map(Number);
    var dt=new Date(p[0],p[1]-1,p[2]);
    var mo=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    var wd=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    return p[2]+' '+mo[p[1]-1]+' '+wd[dt.getDay()];
  }
  // seq 24 düzeltmesi (B1): Bu üç fonksiyon app.js orijinallerine hizalanır ve
  // `window.SeymaState` merkezi yüzeyine bağımlı hale getirilir. `SeymaState`
  // getter'ları `window[name]` üzerinden çözümlenir; Faz 0'da (FX-P-05) app.js'e
  // canlı getter eklendiğinde `SeymaState.data`/`ui`/`getDay` otomatik olarak
  // gerçek değerleri döndürür. Henüz expose edilmediği sürece güvenle fallback
  // döner (kırılmaz).
  function dayIndexFor(date){
    var st = window.SeymaState;
    var start = (st && st.data && st.data.startDate) ? st.data.startDate : '2026-01-01';
    return diffDays(start, date)+1;
  }
  function activeDate(){
    var st = window.SeymaState;
    return (st && st.ui && st.ui.editDate) ? st.ui.editDate : todayStr();
  }
  function curDay(){
    var d = activeDate();
    var st = window.SeymaState;
    if (!st || typeof st.getDay !== 'function') return null;
    return st.getDay(st.data, d, dayIndexFor(d));
  }

  window.SeymaDateUtils = {
    pad: pad,
    fmt: fmt,
    todayStr: todayStr,
    addDays: addDays,
    diffDays: diffDays,
    shortDate: shortDate,
    dateLabelTR: dateLabelTR,
    dayIndexFor: dayIndexFor,
    activeDate: activeDate,
    curDay: curDay
  };
})();
