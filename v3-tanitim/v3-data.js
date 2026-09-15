/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · Kişisel veri özeti (85 gün)
   ───────────────────────────────────────────────────────────────────────────
   Bu modül kullanıcının KENDİ kayıtlarını okur ve 85 günlük yolculuğun
   özetini, ısı haritasını, serilerini ve rozetlerini üretir.

   TEMEL İLKELER
   ─────────────
   • SALT-OKUR. localStorage'a ASLA yazmaz. Yalnız `seyma-reset-v1` anahtarını
     okur. Tek istisna yoktur — bu dosyada `setItem` hiç geçmez.
   • AĞ YOK. fetch/XHR yok; hiçbir veri cihazdan çıkmaz.
   • AYNI FORMÜLLER. Her metrik uygulamanın kendi tanımını aynalar
     (app/core/report.js + app/core/health.js + app.js). Uydurma metrik yok;
     nerede sapma varsa yorumda açıkça yazılıdır.
   • GİZLİLİK. Isı haritası ve grafikler yalnız SAYI/biçim gösterir. Ruh hâli
     ETİKETİ, not, günlük, ad, konum — hiçbiri ekrana çıkmaz. Kişiye özel tek
     şey, kullanıcının uygulamada zaten gördüğü isim (nickname) ve tarihlerdir.
   • VERİ YOKSA DÜRÜST. Kayıt yoksa sahte grafik çizilmez; davetkâr bir
     boş-durum metni gösterilir.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'seyma-reset-v1';

  /* ── Uygulamadan AYNEN alınan sabitler (app/core/health.js:1024) ───────── */
  var PROTEIN_GOAL = 60;
  var WATER_GOAL = 8;
  var VACATION_WATER_GOAL = 10;
  var STEP_TICK_MIN = 4500;
  var SLEEP_TICK_MIN = 7.5;      // habit 'sleepReg' eşiği
  var STEP_LEN_M = 0.72;         // adım uzunluğu (m)

  /* ── app.js HABITS[] → {key: since} ────────────────────────────────────────
     `since` alanı YALNIZ bazı alışkanlıklarda var; olmayanlar her zaman
     aktiftir. habitCountOn(date) = since yok || date >= since.
     Bu tablo app.js:23 ile birebir aynı olmalıdır — fixture karşılaştırır. */
  var HABIT_SINCE = {
    sweetManaged:    null,
    foodManaged:     '2026-07-10',
    coffeeManaged:   '2026-07-10',
    eveningControl:  null,
    walked20:        null,
    protein:         null,
    water:           null,
    vitaminD:        null,
    sleepReg:        '2026-06-28',
    journaled:       '2026-07-03',
    mediaFed:        '2026-07-09',
    freshAir:        '2026-07-03',
    selfKind:        null,
    caffeineOk:      '2026-07-10',
    magnesium:       null
  };
  var HABIT_KEYS = Object.keys(HABIT_SINCE);

  /* Uygulamadaki rozetlerin sırası ve eşikleri (report.js badgesGrid %90). */
  var MOOD_IDS = ['cok-iyi', 'iyi', 'normal', 'zorlandim', 'cok-zorlandim'];

  /* ── Tarih yardımcıları ────────────────────────────────────────────────── */
  function pad(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s) {
    var p = String(s || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) return null;
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function addDays(iso, n) {
    var d = fromISO(iso);
    if (!d) return iso;
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  function diffDays(a, b) {
    var x = fromISO(a), y = fromISO(b);
    if (!x || !y) return 0;
    return Math.round((y - x) / 86400000);
  }
  function todayISO() { return toISO(new Date()); }

  /* ── Okuma ─────────────────────────────────────────────────────────────── */
  function readData() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (!parsed.days || typeof parsed.days !== 'object') return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  /* ── Uygulama formülleri ───────────────────────────────────────────────── */
  function habitCountOn(date, since) {
    var n = 0;
    for (var i = 0; i < HABIT_KEYS.length; i++) {
      var s = (since || HABIT_SINCE)[HABIT_KEYS[i]];
      if (!s || (date && date >= s)) n++;
    }
    return n;
  }
  function countRec(rec) {
    if (!rec || !rec.habits) return 0;
    var n = 0;
    for (var i = 0; i < HABIT_KEYS.length; i++) {
      if (rec.habits[HABIT_KEYS[i]]) n++;
    }
    return n;
  }
  function isVacationDay(date, data) {
    var v = (data && data.settings && data.settings.vacation) || null;
    if (!v || !v.enabled || !v.startAt || !v.endAt) return false;
    return date >= v.startAt && date <= v.endAt;
  }
  /* report.js ile aynı: seri, countRec>=4 günleri sayar; tatil günü seriyi
     dondurur (ne artırır ne kırar). */
  function bestStreak(days, data) {
    var b = 0, c = 0;
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (countRec(d.rec) >= 4) { c++; if (c > b) b = c; }
      else if (isVacationDay(d.date, data)) { /* seri donar */ }
      else c = 0;
    }
    return b;
  }
  function currentStreak(data, today) {
    var c = 0, date = today;
    if (countRec((data.days || {})[date]) < 4 && !isVacationDay(date, data)) date = addDays(date, -1);
    var start = data.startDate || today;
    while (diffDays(start, date) >= 0) {
      if (countRec((data.days || {})[date]) >= 4) { c++; date = addDays(date, -1); }
      else if (isVacationDay(date, data)) { date = addDays(date, -1); }
      else break;
    }
    return c;
  }
  function medFreeStreak(data, today) {
    var c = 0, date = today;
    var t = (data.days || {})[date];
    if (!(t && t.sleep && t.sleep.med && t.sleep.med.type === 'none')) date = addDays(date, -1);
    var start = data.startDate || today;
    while (diffDays(start, date) >= 0) {
      var r = (data.days || {})[date];
      if (r && r.sleep && r.sleep.med && r.sleep.med.type === 'none') { c++; date = addDays(date, -1); }
      else break;
    }
    return c;
  }
  /* health.js effSteps: manuel → health → izlenen (adım uzunluğuyla). */
  function effSteps(rec) {
    var manual = (rec && rec.walk && rec.walk.steps != null && rec.walk.steps !== '')
      ? Number(rec.walk.steps) : null;
    if (manual != null && !isNaN(manual)) return manual;
    var hs = (rec && rec.health && rec.health.steps > 0) ? rec.health.steps : 0;
    if (hs > 0) return hs;
    var w = (rec && rec.movement && typeof rec.movement === 'object') ? (rec.movement.walkM || 0) : 0;
    var tr = w > 0 ? Math.round(w / STEP_LEN_M) : 0;
    return tr > 0 ? tr : null;
  }
  function waterGoalFor(date, data) {
    if (isVacationDay(date, data)) return VACATION_WATER_GOAL;
    var t = (data && data.settings && data.settings.targets) || {};
    return (typeof t.waterCups === 'number' && !isNaN(t.waterCups)) ? t.waterCups : WATER_GOAL;
  }
  function readingDays(rec) {
    return !!(rec && rec.reading && Array.isArray(rec.reading.entries) && rec.reading.entries.length > 0);
  }
  function daysTracked(data) {
    var n = 0, days = data.days || {};
    for (var d in days) {
      var r = days[d];
      if (!r) continue;
      if (countRec(r) > 0 || r.mood || r.note || r.intention ||
          (r.meals && (r.meals.breakfast || r.meals.lunch || r.meals.dinner || r.meals.snack))) n++;
    }
    return n;
  }

  /* ── Özet ──────────────────────────────────────────────────────────────── */
  var EMPTY = {
    available: false,
    dayCount: 85,
    startDate: null,
    endDate: null,
    nickname: '',
    daysRecorded: 0,
    coverage: 0,
    ticks: 0,
    perfectDays: 0,
    currentStreak: 0,
    bestStreak: 0,
    medFreeStreak: 0,
    moodCounts: {},
    moodTotal: 0,
    topMood: null,
    moodTrend: [],
    habitSeries: [],
    waterGoalDays: 0,
    readingDays: 0,
    heatCells: [],
    badges: [],
    earnedCount: 0,
    totalBadges: 8
  };

  function summarize() {
    var today = todayISO();
    var data = readData();
    if (!data) return EMPTY;

    var start = data.startDate || null;
    var end = today;
    var dayCount = (start && diffDays(start, end) >= 0) ? (diffDays(start, end) + 1) : 85;

    /* Kayıtlı günler — yalnız pencerede */
    var window = [];
    for (var i = 0; i < dayCount; i++) {
      var d = addDays(end, -i);
      window.push({ date: d, rec: (data.days || {})[d] || null });
    }
    var recorded = window.filter(function (o) { return !!o.rec && daysTracked({ days: { x: o.rec } }) > 0; });
    var daysRecorded = daysTracked({
      days: (function () {
        var o = {};
        for (var k = 0; k < window.length; k++) if (window[k].rec) o[window[k].date] = window[k].rec;
        return o;
      })()
    });

    /* Tik toplamı + mükemmel gün + hedefler */
    var ticks = 0, perfectDays = 0, waterGoalDays = 0, readingDayCount = 0;
    for (var j = 0; j < window.length; j++) {
      var rec = window[j].rec;
      if (!rec) continue;
      ticks += countRec(rec);
      if (countRec(rec) >= habitCountOn(window[j].date)) perfectDays++;
      if ((rec.water || 0) >= waterGoalFor(window[j].date, data)) waterGoalDays++;
      if (readingDays(rec)) readingDayCount++;
    }

    /* Ruh hâli dağılımı + trend (son 30 gün, kronolojik, yalnız SAYI) */
    var moodCounts = {};
    for (var m = 0; m < window.length; m++) {
      var r2 = window[m].rec;
      if (r2 && r2.mood && MOOD_IDS.indexOf(r2.mood) >= 0) {
        moodCounts[r2.mood] = (moodCounts[r2.mood] || 0) + 1;
      }
    }
    var moodTotal = 0, topMood = null, topN = 0;
    for (var id in moodCounts) {
      moodTotal += moodCounts[id];
      if (moodCounts[id] > topN) { topN = moodCounts[id]; topMood = id; }
    }
    var moodScoreOf = { 'cok-iyi': 5, 'iyi': 4, 'normal': 3, 'zorlandim': 2, 'cok-zorlandim': 1 };
    var trend = [];
    for (var t = 29; t >= 0; t--) {
      var dd = addDays(end, -t);
      var rr = (data.days || {})[dd];
      trend.push({ date: dd, score: (rr && rr.mood && moodScoreOf[rr.mood]) ? moodScoreOf[rr.mood] : null });
    }

    /* Alışkanlık başarı oranı (yalnız aktif olduğu günlerde) */
    var habitSeries = [];
    for (var h = 0; h < HABIT_KEYS.length; h++) {
      var key = HABIT_KEYS[h];
      var denom = 0, num = 0;
      for (var q = 0; q < window.length; q++) {
        if (!window[q].rec) continue;
        var since = HABIT_SINCE[key];
        if (since && window[q].date < since) continue;
        denom++;
        if (window[q].rec.habits && window[q].rec.habits[key]) num++;
      }
      if (denom > 0) habitSeries.push({ key: key, rate: Math.round(num / denom * 100), days: num, denom: denom });
    }
    habitSeries.sort(function (a, b) { return b.rate - a.rate; });

    /* Isı haritası hücreleri — kronolojik, ilk günden bugüne.
       YALNIZ sayı taşır; ruh hâli ETİKETİ taşımaz (gizlilik). */
    var heatCells = [];
    for (var c = 0; c <= dayCount - 1; c++) {
      var cd = addDays(start, c);
      var cr = (data.days || {})[cd] || null;
      heatCells.push({
        date: cd,
        ticks: countRec(cr),
        max: habitCountOn(cd),
        hasMood: !!(cr && cr.mood),
        vacation: isVacationDay(cd, data)
      });
    }

    /* Rozetler — report.js badgesGrid ile aynı 8 rozet ve eşikler.
       `protein` rozeti bilinçli olarak DIŞARIDA: dayNutrition() besin
       veritabanına (FOOD_DB) dayanır ve bu sayfa onu dürüstçe çözemez. */
    var best = bestStreak(window, data);
    var med = medFreeStreak(data, end);
    var badges = [
      { l: '7 gün seri', done: best >= 7, sub: best >= 7 ? 'tamam' : best + '/7' },
      { l: '30 gün seri', done: best >= 30, sub: best >= 30 ? 'tamam' : best + '/30' },
      { l: '100 gün seri', done: best >= 100, sub: best >= 100 ? 'tamam' : best + '/100' },
      { l: '7 gece ilaçsız', done: med >= 7, sub: med >= 7 ? 'tamam' : med + '/7' },
      { l: 'Su hedefi', done: waterGoalDays >= 1, sub: waterGoalDays > 0 ? waterGoalDays + ' gün' : 'henüz yok' },
      { l: 'Okuma tutkunu', done: readingDayCount >= 7, sub: readingDayCount >= 7 ? 'tamam' : readingDayCount + '/7' },
      { l: '7/7 mükemmel', done: perfectDays >= 1, sub: perfectDays > 0 ? perfectDays + ' gün' : 'henüz yok' },
      { l: '85. güne ulaşmak', done: dayCount >= 85, sub: dayCount >= 85 ? 'tamam' : dayCount + '/85' }
    ];

    return {
      available: true,
      dayCount: dayCount,
      startDate: start,
      endDate: end,
      nickname: (data.settings && data.settings.nickname) || 'Sevgili Günışığı',
      daysRecorded: daysRecorded,
      coverage: dayCount > 0 ? Math.round(daysRecorded / dayCount * 100) : 0,
      ticks: ticks,
      perfectDays: perfectDays,
      currentStreak: currentStreak(data, end),
      bestStreak: best,
      medFreeStreak: med,
      moodCounts: moodCounts,
      moodTotal: moodTotal,
      topMood: topMood,
      moodTrend: trend,
      habitSeries: habitSeries,
      waterGoalDays: waterGoalDays,
      readingDays: readingDayCount,
      heatCells: heatCells,
      badges: badges,
      earnedCount: badges.filter(function (b) { return b.done; }).length,
      totalBadges: badges.length,
      /* Gelişmiş istatistik — v3-stats.js varsa gerçek matematikle üretilir.
         Yoksa null; sayfa o bölümü hiç çizmez (yarım/yanlış grafik olmaz). */
      analytics: buildAnalytics(window, window, data, window, end)
    };
  }

  /* v3-stats.js motorunu gerçek veriyle çalıştırır. Motor yoksa null. */
  function buildAnalytics(_w, helpersBag, data, _w2, end) {
    var S = window.SeymaV3Stats;
    if (!S || typeof S.build !== 'function') return null;
    try {
      var start = data.startDate;
      if (!start) return null;
      var n = diffDays(start, end) + 1;
      if (n < 5) return null;               // çok az gün → istatistik anlamsız
      var list = [];
      for (var i = 0; i < n; i++) {
        var d = addDays(start, i);
        list.push({ date: d, rec: (data.days || {})[d] || null });
      }
      return S.build(list, {
        countRec: countRec,
        habitCountOn: function (date) { return habitCountOn(date); },
        moodScore: function (m) {
          return ({ 'cok-iyi': 5, 'iyi': 4, 'normal': 3, 'zorlandim': 2, 'cok-zorlandim': 1 })[m] || null;
        },
        waterGoalFor: function (date) { return waterGoalFor(date, data); },
        effSteps: effSteps
      });
    } catch (_) {
      return null;
    }
  }

  window.SeymaV3Data = {
    KEY: KEY,
    HABIT_SINCE: HABIT_SINCE,
    HABIT_KEYS: HABIT_KEYS,
    MOOD_IDS: MOOD_IDS,
    PROTEIN_GOAL: PROTEIN_GOAL,
    WATER_GOAL: WATER_GOAL,
    VACATION_WATER_GOAL: VACATION_WATER_GOAL,
    SLEEP_TICK_MIN: SLEEP_TICK_MIN,
    STEP_LEN_M: STEP_LEN_M,
    /* salt-okur yardımcılar — fixture'lar bunları tek tek doğrular */
    habitCountOn: habitCountOn,
    countRec: countRec,
    bestStreak: bestStreak,
    currentStreak: currentStreak,
    medFreeStreak: medFreeStreak,
    effSteps: effSteps,
    waterGoalFor: waterGoalFor,
    isVacationDay: isVacationDay,
    addDays: addDays,
    diffDays: diffDays,
    readData: readData,
    summarize: summarize
  };
})();
