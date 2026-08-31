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
    var p=s.split('-').map(Number);
    var d=new Date(p[0],p[1]-1,p[2]);
    var aylar=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    return d.getDate()+' '+aylar[d.getMonth()]+' '+d.getFullYear();
  }
  function dayIndexFor(date){ return diffDays(window.SeymaConstants ? window.SeymaConstants.START_DATE : data.startDate, date)+1; }
  function activeDate(){ return (window.ui && window.ui.editDate) ? window.ui.editDate : todayStr(); }
  function curDay(){ var d=activeDate(); return window.SeymaState ? window.SeymaState.getDay(d, dayIndexFor(d)) : null; }

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
