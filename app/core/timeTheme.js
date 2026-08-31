(function(){
  'use strict';
  function settings(){ return (window.SeymaState && window.SeymaState.data && window.SeymaState.data.settings) || {}; }

  function classForHour(h){
    if (h >= 5 && h <= 8) return 'theme-time-dawn';
    if (h >= 9 && h <= 16) return 'theme-time-day';
    if (h >= 17 && h <= 20) return 'theme-time-dusk';
    return 'theme-time-night';
  }
  function apply(){
    var root = document.getElementById('root');
    if (!root) return;
    var s = settings();
    if (!s.premiumAtmosphere) return;
    var now = new Date();
    var cls = classForHour(now.getHours());
    root.classList.remove('theme-time-dawn','theme-time-day','theme-time-dusk','theme-time-night');
    root.classList.add(cls);
  }
  function seasonalClass(){
    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    // Yılbaşı: 1 Ocak
    if (m === 1 && d === 1) return 'theme-season-newyear';
    // Ramazan: Hicri 9. ay yaklaşık hesabı; tam hesaplama için hijriCalendar.js kullanılacak.
    if (window.HijriCalendarV1){
      var h = window.HijriCalendarV1.todayStr ? window.HijriCalendarV1.todayStr() : null;
      if (h){
        var hm = Number(h.split('-')[1]);
        if (hm === 9) return 'theme-season-ramazan';
      }
    }
    if (m >= 3 && m <= 5) return 'theme-season-spring';
    if (m >= 9 && m <= 11) return 'theme-season-autumn';
    return '';
  }
  function applySeasonal(){
    var root = document.getElementById('root');
    if (!root) return;
    var s = settings();
    if (!s.premiumAtmosphere) return;
    root.classList.remove('theme-season-ramazan','theme-season-spring','theme-season-autumn','theme-season-newyear');
    var cls = seasonalClass();
    if (cls) root.classList.add(cls);
  }

  window.SeyTimeTheme = {
    classForHour: classForHour,
    apply: apply,
    seasonalClass: seasonalClass,
    applySeasonal: applySeasonal
  };
})();
