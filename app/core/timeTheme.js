(function(){
  'use strict';
  function settings(){ return (window.SeymaState && window.SeymaState.data && window.SeymaState.data.settings) || {}; }

  function classForHour(h){
    if (h == null) h = new Date().getHours();
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
  function seasonalClass(d){
    var date = d || new Date();
    var m = date.getMonth() + 1;
    var day = date.getDate();
    // Özel günler yalnızca gerçek "bugün" için (d parametresi verilmediğinde):
    // deterministik testler için d verilirse özel günler atlanır.
    if (!d){
      // Yılbaşı: 1 Ocak
      if (m === 1 && day === 1) return 'theme-season-newyear';
      // Ramazan: Hicri 9. ay yaklaşık hesabı; tam hesaplama için hijriCalendar.js kullanılır.
      if (window.HijriCalendarV1){
        var h = window.HijriCalendarV1.todayStr ? window.HijriCalendarV1.todayStr() : null;
        if (h){
          var hm = Number(h.split('-')[1]);
          if (hm === 9) return 'theme-season-ramazan';
        }
      }
    }
    // Dört mevsim (Miladi): spring(3-5) / summer(6-8) / autumn(9-11) / winter(12-2)
    if (m >= 3 && m <= 5) return 'theme-season-spring';
    if (m >= 6 && m <= 8) return 'theme-season-summer';
    if (m >= 9 && m <= 11) return 'theme-season-autumn';
    return 'theme-season-winter';
  }
  function applySeasonal(d){
    var root = document.getElementById('root');
    if (!root) return;
    var s = settings();
    if (!s.premiumAtmosphere) return;
    root.classList.remove('theme-season-ramazan','theme-season-spring','theme-season-summer','theme-season-autumn','theme-season-winter','theme-season-newyear');
    var cls = seasonalClass(d);
    if (cls) root.classList.add(cls);
  }

  window.SeyTimeTheme = {
    classForHour: classForHour,
    apply: apply,
    seasonalClass: seasonalClass,
    applySeasonal: applySeasonal
  };
})();
