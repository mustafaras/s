(function () {
  'use strict';

  // HijriCalendarV1 — hafif offsetli Hicri takvim (Umm al-Qura yaklaşık) +
  // mübarek gün lookup. window.HijriCalendarV1 olarak dışa açılır; app.js
  // 'hijriTodayStr' ve 'kandilBadgeFor' fonksiyonları tarafından tüketilir.
  //
  // Doğruluk: Miladi → Kasım ay (JD 347) temelli hesap; kullanıcı
  // settings.prayer.hijriOffset ile ±2 gün kaydırabilir (yerel hilal farkı).

  var HICRI_MONTHS = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülâhir', 'Cemaziyelevvel',
    'Cemaziyelâhir', 'Receb', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];

  // Hicri 1447-01-01'e denk gelen JD (yaklaşık) — 26 Haziran 2025
  var HIJRI_EPOCH_JD = 2460853.5;
  var HICRI_EPOCH_YEAR = 1447;

  function jdFromDate(y, m, d) {
    // Uzunluklu Miladi JD hesap (Gregoryen)
    var a = Math.floor((14 - m) / 12);
    var y0 = y + 4800 - a;
    var m0 = m + 12 * a - 3;
    return d + Math.floor((153 * m0 + 2) / 5) + 365 * y0 + Math.floor(y0 / 4) -
           Math.floor(y0 / 100) + Math.floor(y0 / 400) - 32045;
  }

  function hijriFromDate(year, month, day, offsetDays) {
    var jd = jdFromDate(year, month, day) + (offsetDays || 0);
    var days = jd - HIJRI_EPOCH_JD;
    // Ortalama 29.530589 gün/ay
    var months = Math.floor(days / 29.530589);
    var hy = HICRI_EPOCH_YEAR + Math.floor(months / 12);
    var hm = months % 12;
    if (hm < 0) { hm += 12; hy--; }
    var hd = Math.round(days - Math.floor(months * 29.530589)) + 1;
    if (hd < 1) hd = 1;
    if (hd > 30) hd = 30;
    return { year: hy, month: hm + 1, day: hd, monthName: HICRI_MONTHS[hm] };
  }

  function parseDateStr(s) {
    var p = String(s || '').split('-').map(Number);
    return p.length >= 3 ? { y: p[0], m: p[1], d: p[2] } : null;
  }

  // Bilinen mübarek günler (offsetten önceki hicri gün bazlı, yıldan bağımsız)
  var HOLY = {
    '1-1':  'Hicri Yeni Yıl',
    '1-10': 'Aşure Günü',
    '8-1':  'Regaip Kandili',
    '8-14': 'Beraat Kandili',
    '9-1':  'Ramazan Başlangıcı',
    '9-27': 'Kadir Gecesi',
    '10-1': 'Ramazan Bayramı',
    '12-10': 'Kurban Bayramı',
    '12-18': 'Mevlid Kandili'
  };

  function holyDayFor(year, month, day, offsetDays) {
    var h = hijriFromDate(year, month, day, 0); // offset'siz gerçek gün
    var key = h.month + '-' + h.day;
    return HOLY[key] || '';
  }

  window.HijriCalendarV1 = Object.freeze({
    version: '1.0.0',
    months: HICRI_MONTHS.slice(),
    todayStr: function (dateStr, offsetDays) {
      var p = parseDateStr(dateStr) || (function () { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }; })();
      var h = hijriFromDate(p.y, p.m, p.d, offsetDays || 0);
      return '🌙 ' + h.day + ' ' + h.monthName + ' ' + h.year;
    },
    holyDay: function (dateStr, offsetDays) {
      var p = parseDateStr(dateStr) || (function () { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }; })();
      return holyDayFor(p.y, p.m, p.d, offsetDays || 0);
    },
    hijriFrom: function (dateStr, offsetDays) {
      var p = parseDateStr(dateStr);
      if (!p) return null;
      return hijriFromDate(p.y, p.m, p.d, offsetDays || 0);
    }
  });
})();
