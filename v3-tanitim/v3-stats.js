/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · İSTATİSTİK MOTORU (gelişmiş matematik)
   ───────────────────────────────────────────────────────────────────────────
   Günlük kayıtlardan anlamlı, dürüst istatistik üretir. Hiçbir değer
   uydurulmaz; her metrik kaç örnekle (n) hesaplandığını yanında taşır.

   Kullanılan gerçek matematik:
     • Betimsel istatistik: ortalama, medyan, mod, standart sapma (örneklem),
       çeyrekler (Q1/Q2/Q3), çeyrekler arası açıklık (IQR), aykırı değerler,
       değişim katsayısı (CV).
     • Eğilim (trend): en küçük kareler doğrusal regresyon — eğim, kesişim,
       belirleme katsayısı (R²). Eğim "günlük değişim hızı"dır.
     • Korelasyon: Pearson katsayısı (r) + anlamlılık için gereken en küçük n.
     • Hareketli ortalama: pencere tabanlı düzleştirme (7 gün).
     • Moment dökümü: son 7 gün ile önceki 7 günün farkı.
     • Haftanın günü profili: her günün ortalaması (döngüsel kalıp).

   DÜRÜSTLÜK KURALLARI (kodsal):
     • n < 3  → korelasyon/eğim HESAPLANMAZ (null döner, "%0" yazılmaz).
     • n < 5  → uyarı etiketi taşır.
     • Aykırı değerler IQR kuralıyla işaretlenir, ama GİZLENMEZ.
     • Bölme sıfıra karşı her yerde korumalı.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Temel matematik ───────────────────────────────────────────────────── */
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function mean(a) { return a.length ? sum(a) / a.length : null; }
  function median(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function mode(a) {
    if (!a.length) return null;
    var c = {}, best = null, bn = 0;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
      if (c[a[i]] > bn) { bn = c[a[i]]; best = a[i]; }
    }
    return best;
  }
  /* Örneklem standart sapması (n-1). Anakütle değil — elimizdeki bir örneklem. */
  function stdDev(a) {
    if (a.length < 2) return null;
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / (a.length - 1));
  }
  /* Çeyrekler: doğrusal interpolasyon (tip-7, R/most tools ile aynı). */
  function quantile(sorted, q) {
    if (!sorted.length) return null;
    var pos = (sorted.length - 1) * q;
    var base = Math.floor(pos), rest = pos - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base];
  }
  function quartiles(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var q1 = quantile(s, 0.25), q2 = quantile(s, 0.5), q3 = quantile(s, 0.75);
    return { q1: q1, q2: q2, q3: q3, iqr: q3 - q1 };
  }
  /* IQR kuralı (Tukey): 1,5×IQR dışındakiler aykırı. */
  function outliers(a) {
    var q = quartiles(a);
    if (!q || a.length < 4) return [];
    var lo = q.q1 - 1.5 * q.iqr, hi = q.q3 + 1.5 * q.iqr;
    return a.filter(function (v) { return v < lo || v > hi; });
  }
  /* Değişim katsayısı: std/ort, yüzde. Dağınıklığın göreli ölçüsü. */
  function cv(a) {
    var m = mean(a), s = stdDev(a);
    if (m == null || s == null || m === 0) return null;
    return Math.abs(s / m) * 100;
  }

  /* ── Regresyon & korelasyon ────────────────────────────────────────────── */
  /* En küçük kareler: y = eğim·x + kesişim. x sıra numarası (0,1,2,…). */
  function linearRegression(ys) {
    var n = ys.length;
    if (n < 3) return null;                       // dürüstlük: 3'ten az → yok
    var xs = [], i;
    for (i = 0; i < n; i++) xs.push(i);
    var mx = mean(xs), my = mean(ys);
    var num = 0, den = 0;
    for (i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
    if (den === 0) return null;
    var slope = num / den, intercept = my - slope * mx;
    /* R² = 1 − SS_res / SS_tot */
    var ssRes = 0, ssTot = 0;
    for (i = 0; i < n; i++) {
      var pred = slope * xs[i] + intercept;
      ssRes += (ys[i] - pred) * (ys[i] - pred);
      ssTot += (ys[i] - my) * (ys[i] - my);
    }
    var r2 = ssTot === 0 ? null : 1 - ssRes / ssTot;
    return { slope: slope, intercept: intercept, r2: r2, n: n };
  }
  /* Pearson r. n < 3 → null. */
  function pearson(x, y) {
    var n = x.length;
    if (n < 3 || y.length !== n) return null;
    var mx = mean(x), my = mean(y), num = 0, dx = 0, dy = 0;
    for (var i = 0; i < n; i++) {
      var a = x[i] - mx, b = y[i] - my;
      num += a * b; dx += a * a; dy += b * b;
    }
    if (dx === 0 || dy === 0) return null;
    var r = num / Math.sqrt(dx * dy);
    return { r: r, r2: r * r, n: n };
  }
  /* r'nin kabaca anlamlı sayılabilmesi için gereken en küçük örnek (0,05). */
  function minNForR() { return 10; }

  /* Hareketli ortalama — pencere dolmadan başlamaz (uydurma değer üretmez). */
  function movingAverage(vals, win) {
    var out = [];
    for (var i = 0; i < vals.length; i++) {
      if (i + 1 < win) { out.push(null); continue; }
      var slice = vals.slice(i + 1 - win, i + 1);
      var clean = slice.filter(function (v) { return v != null; });
      out.push(clean.length === win ? mean(clean) : null);
    }
    return out;
  }

  /* ── Yardımcılar ───────────────────────────────────────────────────────── */
  function pair(xs, ys) {
    var a = [], b = [];
    for (var i = 0; i < xs.length; i++) {
      if (xs[i] != null && ys[i] != null && !isNaN(xs[i]) && !isNaN(ys[i])) {
        a.push(Number(xs[i])); b.push(Number(ys[i]));
      }
    }
    return { x: a, y: b };
  }
  function profile(values) {
    /* Değer dizisinden tam bir betimsel istatistik paketi. */
    var clean = values.filter(function (v) { return v != null && !isNaN(v); });
    var q = quartiles(clean);
    var o = outliers(clean);
    return {
      n: clean.length,
      mean: mean(clean),
      median: median(clean),
      mode: mode(clean),
      std: stdDev(clean),
      cv: cv(clean),
      min: clean.length ? Math.min.apply(null, clean) : null,
      max: clean.length ? Math.max.apply(null, clean) : null,
      q1: q ? q.q1 : null,
      q3: q ? q.q3 : null,
      iqr: q ? q.iqr : null,
      outliers: o,
      outlierCount: o.length,
      values: clean
    };
  }
  /* Histogram: eşit genişlikli kutular (Freedman-Diaconis ya da sabit sayı). */
  function histogram(values, min, max, bins) {
    var clean = values.filter(function (v) { return v != null && !isNaN(v); });
    if (!clean.length) return { bins: [], max: 0 };
    var lo = (min != null) ? min : Math.min.apply(null, clean);
    var hi = (max != null) ? max : Math.max.apply(null, clean);
    var count = bins || Math.max(4, Math.min(10, Math.round(Math.sqrt(clean.length))));
    var w = (hi - lo) / count || 1;
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push({ from: lo + i * w, to: lo + (i + 1) * w, n: 0 });
    }
    clean.forEach(function (v) {
      var idx = Math.floor((v - lo) / w);
      if (idx >= count) idx = count - 1;
      if (idx < 0) idx = 0;
      out[idx].n++;
    });
    var peak = 0;
    out.forEach(function (b) { if (b.n > peak) peak = b.n; });
    return { bins: out, max: peak, lo: lo, hi: hi, width: w };
  }

  /* ── Ana motor ─────────────────────────────────────────────────────────── */
  /* Girdi: [{date, rec}] kronolojik dizi + uygulama yardımcıları. */
  function build(dayList, helpers) {
    var h = helpers;                       // {countRec, habitCountOn, moodScore, waterGoalFor, effSteps, isVacation}
    var recs = dayList.map(function (d) { return d.rec; });

    /* Günlük diziler (kronolojik, boş gün = null) */
    var series = {
      mood: dayList.map(function (d) { return d.rec ? h.moodScore(d.rec.mood) : null; }),
      sleep: dayList.map(function (d) { return (d.rec && d.rec.sleep && d.rec.sleep.hours != null) ? Number(d.rec.sleep.hours) : null; }),
      water: dayList.map(function (d) { return (d.rec && typeof d.rec.water === 'number' && d.rec.water > 0) ? d.rec.water : null; }),
      energy: dayList.map(function (d) { return (d.rec && d.rec.energy != null) ? Number(d.rec.energy) : null; }),
      stress: dayList.map(function (d) { return (d.rec && d.rec.stress != null) ? Number(d.rec.stress) : null; }),
      steps: dayList.map(function (d) { return d.rec ? h.effSteps(d.rec) : null; }),
      ticks: dayList.map(function (d) { return d.rec ? h.countRec(d.rec) : null; }),
      habitMax: dayList.map(function (d) { return h.habitCountOn(d.date); })
    };
    series.sleepQuality = dayList.map(function (d) {
      var q = d.rec && d.rec.sleep && d.rec.sleep.quality;
      return q === 'good' ? 3 : q === 'ok' ? 2 : q === 'bad' ? 1 : null;
    });

    /* Betimsel profiller */
    var stats = {};
    ['mood', 'sleep', 'water', 'energy', 'stress', 'steps', 'sleepQuality'].forEach(function (k) {
      stats[k] = profile(series[k]);
    });

    /* Eğilim: yalnız dolu günler üzerinden (boşluklar sıra numarasını kaydırmaz
       — aksi hâlde "zaman" yanlış ölçülür). */
    function trendOf(vals) {
      var filled = vals.filter(function (v) { return v != null; });
      return linearRegression(filled);
    }
    var trends = {
      mood: trendOf(series.mood),
      sleep: trendOf(series.sleep),
      water: trendOf(series.water),
      energy: trendOf(series.energy),
      stress: trendOf(series.stress),
      ticks: trendOf(series.ticks)
    };

    /* Moment: son 7 vs önceki 7 */
    function momentum(vals) {
      var cur = vals.slice(-7).filter(function (v) { return v != null; });
      var prev = vals.slice(-14, -7).filter(function (v) { return v != null; });
      if (!cur.length || !prev.length) return null;
      var a = mean(cur), b = mean(prev);
      return { cur: a, prev: b, diff: a - b, pct: b ? ((a - b) / Math.abs(b)) * 100 : null };
    }
    var momentumAll = {
      mood: momentum(series.mood),
      sleep: momentum(series.sleep),
      water: momentum(series.water),
      energy: momentum(series.energy),
      stress: momentum(series.stress),
      ticks: momentum(series.ticks)
    };

    /* Korelasyonlar — yalnız çifti dolu günler */
    function corr(a, b) { var p = pair(a, b); return p.x.length >= 3 ? pearson(p.x, p.y) : null; }
    var corrPairs = [
      { key: 'uyku↔ruh hâli', a: series.sleep, b: series.mood },
      { key: 'su↔enerji', a: series.water, b: series.energy },
      { key: 'adım↔ruh hâli', a: series.steps, b: series.mood },
      { key: 'stres↔ruh hâli', a: series.stress, b: series.mood },
      { key: 'uyku kalitesi↔enerji', a: series.sleepQuality, b: series.energy },
      { key: 'alışkanlık↔ruh hâli', a: series.ticks, b: series.mood }
    ].map(function (p) {
      var c = corr(p.a, p.b);
      return { key: p.key, r: c ? c.r : null, n: c ? c.n : 0, reliable: !!(c && c.n >= minNForR()) };
    }).filter(function (p) { return p.n >= 3; });

    /* Haftanın günü profili (döngüsel kalıp) */
    var wdSum = [0, 0, 0, 0, 0, 0, 0], wdN = [0, 0, 0, 0, 0, 0, 0], wdMood = [0, 0, 0, 0, 0, 0, 0], wdMN = [0, 0, 0, 0, 0, 0, 0];
    dayList.forEach(function (d) {
      if (!d.rec) return;
      var p = d.date.split('-').map(Number);
      var wd = (new Date(p[0], p[1] - 1, p[2]).getDay() + 6) % 7;   // Pazartesi=0
      var maxH = h.habitCountOn(d.date);
      if (maxH > 0) { wdSum[wd] += h.countRec(d.rec) / maxH; wdN[wd]++; }
      var ms = h.moodScore(d.rec.mood);
      if (ms != null) { wdMood[wd] += ms; wdMN[wd]++; }
    });
    var weekday = [];
    for (var w = 0; w < 7; w++) {
      weekday.push({
        index: w,
        rate: wdN[w] ? wdSum[w] / wdN[w] * 100 : null,
        mood: wdMN[w] ? wdMood[w] / wdMN[w] : null,
        n: wdN[w]
      });
    }

    /* Hedef tutturma oranları (yalnız o gün dolu ise payda sayılır) */
    function adherence(vals, test) {
      var denom = 0, num = 0;
      vals.forEach(function (v) { if (v == null) return; denom++; if (test(v)) num++; });
      return { rate: denom ? Math.round(num / denom * 100) : null, hit: num, n: denom };
    }
    var goals = {
      sleep75: adherence(series.sleep, function (v) { return v >= 7.5; }),
      water8: adherence(series.water, function (v) { return v >= 8; }),
      steps4500: adherence(series.steps, function (v) { return v >= 4500; }),
      tickPerfect: (function () {
        var denom = 0, num = 0;
        dayList.forEach(function (d) {
          if (!d.rec) return;
          denom++;
          if (h.countRec(d.rec) >= h.habitCountOn(d.date)) num++;
        });
        return { rate: denom ? Math.round(num / denom * 100) : null, hit: num, n: denom };
      })()
    };

    /* Hareketli ortalamalar (grafikler için) */
    var ma = {
      mood: movingAverage(series.mood, 7),
      sleep: movingAverage(series.sleep, 7),
      ticks: movingAverage(series.ticks, 7)
    };

    /* Histogramlar */
    var hists = {
      sleep: histogram(series.sleep, 3, 10, 7),
      water: histogram(series.water, 0, 14, 7),
      ticks: histogram(series.ticks, 0, Math.max.apply(null, series.habitMax.concat([1])), 8)
    };

    /* Ruh hâli dağılımı (etiketli — yalnız SAYI olarak dışa çıkar) */
    var moodDist = {};
    dayList.forEach(function (d) {
      var m = d.rec && d.rec.mood;
      if (m) moodDist[m] = (moodDist[m] || 0) + 1;
    });

    /* Seriler: en uzun, mevcut, ilaçsız */
    var streakVals = dayList.map(function (d) {
      return { date: d.date, rec: d.rec, max: h.habitCountOn(d.date) };
    });

    return {
      series: series,
      ma: ma,
      stats: stats,
      trends: trends,
      momentum: momentumAll,
      correlations: corrPairs,
      weekday: weekday,
      goals: goals,
      hists: hists,
      moodDist: moodDist,
      streaks: streakVals,
      minNForR: minNForR()
    };
  }

  window.SeymaV3Stats = {
    /* matematik */
    sum: sum, mean: mean, median: median, mode: mode, stdDev: stdDev,
    quantile: quantile, quartiles: quartiles, outliers: outliers, cv: cv,
    linearRegression: linearRegression, pearson: pearson, movingAverage: movingAverage,
    histogram: histogram, profile: profile,
    build: build,
    /* yardımcı */
    minNForR: minNForR
  };
})();
