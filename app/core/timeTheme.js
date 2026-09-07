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
    // FX-P-81: premium kapalıysa aurora sınıfı da kaldırılır — sınıf root'ta
    // asılı kalmaz, katman tamamen söner.
    if (!s.premiumAtmosphere){ root.classList.remove('theme-aurora'); return; }
    var now = new Date();
    var cls = classForHour(now.getHours());
    root.classList.remove('theme-time-dawn','theme-time-day','theme-time-dusk','theme-time-night');
    root.classList.add(cls);
    root.classList.add('theme-aurora');
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

  // ── FX2-19: SeyAmbience — canlı zemin sahnesi ────────────────────────────
  // Tek sorumluluk: #root'a hangi sahne sınıflarının yazılacağını HESAPLAMAK.
  // Boyama tamamen CSS'te. Ağ çağrısı YOK — data.weather zaten dolu.
  function wx(){
    try{
      var d = window.SeymaState && window.SeymaState.data;
      var s = d && d.weather && d.weather.spots && d.weather.spots[0];
      return s || null;
    }catch(e){ return null; }
  }

  // WMO kodu → 8 hava sahnesi
  var WX_MAP = [
    ['amb-wx-clear',   [0,1]],
    ['amb-wx-cloud',   [2,3]],
    ['amb-wx-fog',     [45,48]],
    ['amb-wx-drizzle', [51,53,55,56,57]],
    ['amb-wx-rain',    [61,63,65,66,67,80,81,82]],
    ['amb-wx-snow',    [71,73,75,77,85,86]],
    ['amb-wx-storm',   [95,96,99]]
  ];
  function weatherClass(code){
    if (code == null || isNaN(code)) return 'amb-wx-none';
    for (var i=0;i<WX_MAP.length;i++){
      if (WX_MAP[i][1].indexOf(Number(code)) >= 0) return WX_MAP[i][0];
    }
    return 'amb-wx-none';
  }

  // Şiddet 0–1: yağış + rüzgârdan türer. CSS animasyon hızı/opaklığı bundan.
  function intensity(s){
    if (!s) return 0.35;
    var p = Math.min(Number(s.precip)||0, 8) / 8;      // 0–8 mm
    var w = Math.min(Number(s.wind)||0, 40) / 40;      // 0–40 km/s
    return Math.max(0.15, Math.min(1, p*0.7 + w*0.3));
  }

  // Günün tarihinden türeyen deterministik 0–1: gün içinde SABİT, gün gün değişir.
  function seed(d){
    var t = d || new Date();
    var k = t.getFullYear()*10000 + (t.getMonth()+1)*100 + t.getDate();
    var x = Math.sin(k) * 10000;
    return x - Math.floor(x);
  }

  window.SeyAmbience = {
    weatherClass: weatherClass,
    intensity: intensity,
    seed: seed,
    // Saf: girdi verilirse onu kullanır, verilmezse canlı veriyi okur.
    // FX2-20 zaman katmanını ekler, FX2-22 mevsim katmanını dolduracak.
    // Gerçek güneş saatine göre 4 dilim. sunrise/sunset yoksa
    // SeyTimeTheme.classForHour()'a düşer (asla kırılmaz).
    timeClass: function(now, spot){
      var t = now || new Date();
      var s = (spot !== undefined) ? spot : wx();
      var sr = s && s.sunrise ? new Date(s.sunrise) : null;
      var ss = s && s.sunset  ? new Date(s.sunset)  : null;
      if (!sr || !ss || isNaN(sr.getTime()) || isNaN(ss.getTime())){
        // FALLBACK — mevcut sabit aralıklar
        var c = window.SeyTimeTheme.classForHour(t.getHours());
        return c.replace('theme-time-', 'amb-time-');
      }
      var m = 60000;
      if (t >= new Date(sr.getTime() - 45*m) && t < new Date(sr.getTime() + 75*m)) return 'amb-time-dawn';
      if (t >= new Date(sr.getTime() + 75*m) && t < new Date(ss.getTime() - 90*m)) return 'amb-time-day';
      if (t >= new Date(ss.getTime() - 90*m) && t < new Date(ss.getTime() + 45*m)) return 'amb-time-dusk';
      return 'amb-time-night';
    },
    scene: function(now, spot){
      var s = (spot !== undefined) ? spot : wx();
      return {
        time:    this.timeClass(now, spot),
        weather: weatherClass(s && s.code),
        season:  '',                             // FX2-22 dolduracak
        isDay:   s ? s.isDay !== false : true,
        intensity: intensity(s),
        seed:    seed(now)
      };
    },
    apply: function(now){
      var root = document.getElementById('root');
      if (!root) return false;
      var s = (window.SeymaState && window.SeymaState.data && window.SeymaState.data.settings) || {};
      // Premium kapalı → tüm amb-* sınıfları temizlenir, katman söner.
      var all = root.className.split(/\s+/).filter(function(c){ return c.indexOf('amb-') === 0; });
      all.forEach(function(c){ root.classList.remove(c); });
      if (!s.premiumAtmosphere) return false;
      var sc = window.SeyAmbience.scene(now);
      root.classList.add(sc.time);
      if (sc.weather) root.classList.add(sc.weather);
      if (sc.season)  root.classList.add(sc.season);
      root.style.setProperty('--wx-intensity', String(sc.intensity.toFixed(2)));
      root.style.setProperty('--amb-seed', String(sc.seed.toFixed(3)));
      root.style.setProperty('--wx-dim', sc.isDay ? '1' : '0.72');
      return true;
    }
  };

  // Sekme arka plandayken hava katmanı animasyonlarını duraklat (batarya).
  // (FX2-21: #root.amb-paused → #sey-aurora::after animation-play-state:paused)
  // Yalnızca `document` + `addEventListener` varsa bağla — headless harnesslerde
  // document tanımsız olabilir, bu durumda sessizce geç.
  if (typeof document !== 'undefined' && document && typeof document.addEventListener === 'function'){
    document.addEventListener('visibilitychange', function(){
      try{
        var r = document.getElementById('root'); if (!r) return;
        r.classList.toggle('amb-paused', document.hidden);
      }catch(e){}
    });
  }
})();
