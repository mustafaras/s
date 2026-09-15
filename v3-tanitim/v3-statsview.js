/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · İSTATİSTİK GÖRSELLEŞTİRME
   ───────────────────────────────────────────────────────────────────────────
   v3-stats.js'in ürettiği gerçek istatistikleri premium grafiklere çevirir.
   Hepsi saf SVG/DOM; kütüphane yok, ağ yok, depoya yazma yok.

   GİZLİLİK: Yalnız SAYI ve tarih yazılır. Ruh hâli ETİKETİ, not, günlük metni
   ekrana çıkmaz.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  /* Türkçe sayı biçimi: ondalık virgül. */
  function num(v, dec) {
    if (v == null || isNaN(v)) return '—';
    var s = Number(v).toFixed(dec == null ? 2 : dec);
    return s.replace('.', ',');
  }
  function signed(v, dec) {
    if (v == null || isNaN(v)) return '—';
    return (v >= 0 ? '+' : '−') + num(Math.abs(v), dec);
  }
  function pct(v, dec) { return v == null ? '—' : '%' + num(v, dec == null ? 0 : dec); }

  /* Ruh hâli 1–5 → yalnız renk. ETİKET YAZILMAZ. */
  var MOOD_COLOR = { 5: 'var(--gold-1)', 4: 'var(--gold-2)', 3: 'var(--gold-3)', 2: 'var(--pause)', 1: 'var(--muted)' };

  /* ── 1 · Betimsel istatistik tablosu ───────────────────────────────────── */
  function descriptive(stats) {
    var rows = [
      { k: 'mood', l: 'Ruh hâli', unit: '1–5', dec: 2 },
      { k: 'sleep', l: 'Uyku', unit: 'saat', dec: 2 },
      { k: 'water', l: 'Su', unit: 'bardak', dec: 1 },
      { k: 'energy', l: 'Enerji', unit: '1–5', dec: 2 },
      { k: 'stress', l: 'Stres', unit: '1–5', dec: 2 },
      { k: 'steps', l: 'Adım', unit: '', dec: 0 }
    ];
    var h = '<div class="v3-tblwrap"><table class="v3-tbl">' +
      '<caption class="v3-sr-only">Seçili ölçümlerin betimsel istatistikleri</caption>' +
      '<thead><tr><th scope="col">Ölçüm</th><th scope="col">n</th><th scope="col">Ort.</th>' +
      '<th scope="col">Medyan</th><th scope="col">SS</th><th scope="col">CV</th>' +
      '<th scope="col">Aralık</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var s = stats[r.k];
      if (!s || !s.n) return;
      h += '<tr><th scope="row">' + esc(r.l) + (r.unit ? '<span class="v3-tbl__u">' + esc(r.unit) + '</span>' : '') + '</th>' +
        '<td>' + s.n + '</td>' +
        '<td class="v3-tbl__hi">' + num(s.mean, r.dec) + '</td>' +
        '<td>' + num(s.median, r.dec) + '</td>' +
        '<td>' + num(s.std, r.dec) + '</td>' +
        '<td>' + (s.cv == null ? '—' : num(s.cv, 0) + '%') + '</td>' +
        '<td class="v3-tbl__rng">' + num(s.min, r.dec) + '–' + num(s.max, r.dec) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<p class="v3-chart__note">SS = örneklem standart sapması · CV = değişim katsayısı ' +
      '(dağınıklığın ortalamaya oranı) · n = kaç günün dolu olduğu. ' +
      'Medyan, uç değerlerden etkilenmediği için ortalama ile birlikte okunmalı.</p>';
    return h;
  }

  /* ── 2 · Histogram + kutu grafiği (dağılım) ────────────────────────────── */
  function distribution(hist, prof, opts) {
    if (!hist || !hist.bins.length || !prof || !prof.n) {
      return '<p class="v3-chart__empty">Yeterli kayıt yok.</p>';
    }
    var B = hist.bins;
    var W = 300, H = 84, GAP = 4;
    var bw = (W - GAP * (B.length - 1)) / B.length;
    var h = '<svg class="v3-hist" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" ' +
      'aria-label="Dağılım histogramı: ' + prof.n + ' günlük kayıt, ' + B.length + ' kutu. ' +
      'Ortalama ' + num(prof.mean, 1) + ', medyan ' + num(prof.median, 1) + '">';
    B.forEach(function (b, i) {
      var bh = hist.max ? Math.max(2, Math.round(b.n / hist.max * (H - 16))) : 2;
      var x = i * (bw + GAP);
      h += '<rect class="v3-hist__b" x="' + x + '" y="' + (H - bh) + '" width="' + bw + '" ' +
        'height="' + bh + '" rx="3"><title>' + num(b.from, opts && opts.dec != null ? opts.dec : 1) +
        '–' + num(b.to, opts && opts.dec != null ? opts.dec : 1) + ' · ' + b.n + ' gün</title></rect>';
      h += '<text class="v3-hist__n" x="' + (x + bw / 2) + '" y="' + (H - bh - 4) + '" ' +
        'text-anchor="middle">' + b.n + '</text>';
    });
    /* Ortalama ve medyan işaretleri */
    function marker(v, cls, label) {
      if (v == null || hist.hi === hist.lo) return '';
      var cx = Math.max(1, Math.min(W - 1, (v - hist.lo) / (hist.hi - hist.lo) * W));
      return '<line class="' + cls + '" x1="' + cx + '" y1="0" x2="' + cx + '" y2="' + H + '">' +
        '<title>' + label + ' ' + num(v, 1) + '</title></line>';
    }
    h += marker(prof.median, 'v3-hist__med', 'Medyan');
    h += marker(prof.mean, 'v3-hist__mean', 'Ortalama');
    h += '</svg>';
    h += '<div class="v3-hist__leg" aria-hidden="true">' +
      '<span><i class="is-mean"></i>Ortalama ' + num(prof.mean, 1) + '</span>' +
      '<span><i class="is-med"></i>Medyan ' + num(prof.median, 1) + '</span>' +
      '<span><i class="is-out"></i>Aykırı ' + prof.outlierCount + '</span></div>';

    /* Kutu grafiği: Q1–Q3 kutusu, medyan çizgisi, IQR dışı noktalar */
    if (prof.q1 != null && hist.hi > hist.lo) {
      var BW = 300, BH = 30;
      var pos = function (v) { return Math.max(0, Math.min(BW, (v - hist.lo) / (hist.hi - hist.lo) * BW)); };
      var x1 = pos(prof.q1), x2 = pos(prof.q3), xm = pos(prof.median);
      var xlo = pos(hist.lo), xhi = pos(hist.hi);
      h += '<svg class="v3-box" viewBox="0 0 ' + BW + ' ' + BH + '" width="100%" role="img" ' +
        'aria-label="Kutu grafiği: çeyrekler arası açıklık ' + num(prof.iqr, 1) + '">';
      h += '<line class="v3-box__whisk" x1="' + xlo + '" y1="' + (BH / 2) + '" x2="' + xhi + '" y2="' + (BH / 2) + '"/>';
      h += '<rect class="v3-box__iqr" x="' + x1 + '" y="7" width="' + Math.max(2, x2 - x1) + '" height="' + (BH - 14) + '" rx="4"/>';
      h += '<line class="v3-box__med" x1="' + xm + '" y1="4" x2="' + xm + '" y2="' + (BH - 4) + '"/>';
      prof.outliers.slice(0, 12).forEach(function (v) {
        h += '<circle class="v3-box__out" cx="' + pos(v) + '" cy="' + (BH / 2) + '" r="2.6"><title>Aykırı gün: ' + num(v, 1) + '</title></circle>';
      });
      h += '</svg>';
      h += '<p class="v3-chart__note">Kutu = günlerin ortadaki yarısı (Q1–Q3, açıklık ' + num(prof.iqr, 1) +
        '). Aykırı günler (IQR kuralı) <b>gizlenmez</b>, nokta olarak işaretlenir — sıra dışı günler de senin hikâyenin bir parçası.</p>';
    }
    return h;
  }

  /* ── 3 · Eğilim satırı (regresyon) ─────────────────────────────────────── */
  function trendRow(label, t, unit, dec) {
    if (!t) {
      return '<li class="v3-trend"><span class="v3-trend__l">' + esc(label) + '</span>' +
        '<span class="v3-trend__v v3-trend__v--none">yeterli veri yok</span></li>';
    }
    var dir = t.slope > 0.0002 ? 'up' : (t.slope < -0.0002 ? 'down' : 'flat');
    var arrow = dir === 'up' ? '↗' : (dir === 'down' ? '↘' : '→');
    var strength = t.r2 == null ? '—' : (t.r2 >= 0.5 ? 'belirgin' : (t.r2 >= 0.15 ? 'hafif' : 'zayıf'));
    return '<li class="v3-trend v3-trend--' + dir + '">' +
      '<span class="v3-trend__arrow" aria-hidden="true">' + arrow + '</span>' +
      '<span class="v3-trend__l">' + esc(label) + '</span>' +
      '<span class="v3-trend__v">' + signed(t.slope * 30, dec) + ' <span class="v3-trend__u">' + esc(unit || '') + '/ay</span></span>' +
      '<span class="v3-trend__meta">R² ' + num(t.r2, 2) + ' · ' + strength + ' · n=' + t.n + '</span></li>';
  }

  /* ── 4 · Korelasyon kartları ───────────────────────────────────────────── */
  function correlations(list, minN) {
    if (!list || !list.length) {
      return '<p class="v3-chart__empty">Korelasyon için yeterli eşleşen gün yok.</p>';
    }
    var h = '<ul class="v3-corrs">';
    list.slice().sort(function (a, b) { return Math.abs(b.r || 0) - Math.abs(a.r || 0); })
      .forEach(function (c) {
        var mag = Math.abs(c.r || 0);
        var band = mag >= 0.5 ? 'güçlü' : (mag >= 0.3 ? 'orta' : (mag >= 0.15 ? 'zayıf' : 'yok denecek kadar az'));
        var dir = (c.r || 0) >= 0 ? 'aynı yönde' : 'ters yönde';
        var w = Math.round(mag * 100);
        h += '<li class="v3-corr">' +
          '<div class="v3-corr__top"><span class="v3-corr__k">' + esc(c.key) + '</span>' +
          '<span class="v3-corr__r">r ' + (c.r >= 0 ? '+' : '−') + num(mag, 2) + '</span></div>' +
          '<div class="v3-corr__bar"><i style="--w:' + w + '%" data-neg="' + ((c.r || 0) < 0) + '"></i></div>' +
          '<div class="v3-corr__meta">' + esc(band) + ', ' + esc(dir) +
          ' · n=' + c.n + (c.reliable ? '' : ' <b class="v3-corr__warn">düşük örneklem</b>') + '</div></li>';
      });
    h += '</ul>';
    h += '<p class="v3-chart__note">Korelasyon <b>nedensellik değildir</b>: iki şey birlikte değişiyor olabilir, ' +
      'biri diğerine yol açtığı anlamına gelmez. n&lt;' + minN + ' olan çiftler yanıltıcı olabileceği için işaretlenir.</p>';
    return h;
  }

  /* ── 5 · Haftanın günü profili ─────────────────────────────────────────── */
  function weekdayProfile(wd) {
    if (!wd || !wd.some(function (w) { return w.rate != null; })) {
      return '<p class="v3-chart__empty">Haftalık kalıp için yeterli gün yok.</p>';
    }
    var labels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
    var best = null, worst = null;
    wd.forEach(function (w) {
      if (w.rate == null) return;
      if (!best || w.rate > best.rate) best = w;
      if (!worst || w.rate < worst.rate) worst = w;
    });
    var h = '<div class="v3-wd" role="img" aria-label="Haftanın günlerine göre alışkanlık oranı">';
    wd.forEach(function (w, i) {
      var hh = w.rate == null ? 4 : Math.max(6, Math.round(w.rate / 100 * 62));
      var cls = 'v3-wd__bar';
      if (best && w.index === best.index) cls += ' is-best';
      if (worst && w.index === worst.index && best && best.index !== worst.index) cls += ' is-worst';
      h += '<div class="v3-wd__col"><span class="v3-wd__val">' + (w.rate == null ? '—' : Math.round(w.rate) + '%') + '</span>' +
        '<span class="' + cls + '" style="height:' + hh + 'px"></span>' +
        '<span class="v3-wd__lbl">' + labels[w.index] + '</span></div>';
    });
    h += '</div>';
    if (best && worst && best.index !== worst.index) {
      h += '<p class="v3-chart__note">En güçlü günün <b>' + labels[best.index] + '</b> (%' + Math.round(best.rate) +
        '), en zayıf <b>' + labels[worst.index] + '</b> (%' + Math.round(worst.rate) +
        '). Kalıbı bilmek, zayıf günü önceden hazırlanarak geçirmeni sağlar.</p>';
    }
    return h;
  }

  /* ── 6 · Hedef tutturma ─────────────────────────────────────────────────
     Etiketlerdeki eşikler SABİT YAZILMAZ; uygulamanın kendi hedef
     fonksiyonlarından okunan değerlerle basılır (tatil esnetmesi ve kullanıcı
     hedefleri dâhil). */
  function goals(g) {
    var th = g.thresholds || {};
    var tr = function (v) { return v == null ? '' : Number(v).toLocaleString('tr-TR'); };
    var rows = [
      { k: 'sleep', l: tr(th.sleep) + ' saat ve üzeri uyku' },
      { k: 'water', l: tr(th.water) + ' bardak ve üzeri su' },
      { k: 'steps', l: tr(th.steps) + ' adım ve üzeri' },
      { k: 'tickPerfect', l: 'Günün tüm alışkanlıkları (' + tr(th.habitCountToday) + ')' }
    ];
    var h = '<ul class="v3-goals">';
    rows.forEach(function (r) {
      var v = g[r.k];
      if (!v || v.n === 0) return;
      h += '<li class="v3-goal">' +
        '<div class="v3-goal__top"><span>' + esc(r.l) + '</span>' +
        '<span class="' + (v.rate >= 70 ? 'is-good' : (v.rate >= 40 ? 'is-mid' : 'is-low')) + '">' + pct(v.rate) + '</span></div>' +
        '<div class="v3-goal__track"><i style="--w:' + (v.rate || 0) + '%"></i></div>' +
        '<div class="v3-goal__meta">' + v.hit + '/' + v.n + ' gün tuttu</div></li>';
    });
    h += '</ul>';
    h += '<p class="v3-chart__note">Eşikler <b>uygulamanın kendi hedef ' +
      'fonksiyonlarından</b> okunur (tatil günü esnetmesi ve varsa senin ' +
      'belirlediğin hedefler dâhil). Payda yalnız <b>o ölçümün kaydedildiği</b> ' +
      'günlerdir — boş günler başarısızlık sayılmaz, dürüstlük bunu gerektirir.</p>';

    /* Alışkanlık aktivasyonu: bugün 15, ilk gün 8 — "tam gün" eşiği zamanla
       değiştiği için açıkça yazılır. */
    if (th.habitCountFirst != null && th.habitCountToday != null &&
        th.habitCountFirst !== th.habitCountToday) {
      h += '<p class="v3-chart__note v3-chart__note--warn">Alışkanlık sayısı yol ' +
        'boyunca değişti: ilk gün <b>' + tr(th.habitCountFirst) + '</b>, bugün <b>' +
        tr(th.habitCountToday) + '</b> (yeni alışkanlıklar eklendikçe arttı). ' +
        'Bu yüzden “tam gün” eşiği her gün kendi tarihine göre hesaplanır — ' +
        'eski günleri bugünün ölçüsüyle yargılamak yanıltıcı olurdu.</p>';
    }
    return h;
  }

  /* ── 7 · Hareketli ortalama grafiği (düzleştirilmiş seyir) ─────────────── */
  function smoothLine(series, ma, opts) {
    var W = 300, H = 76;
    var vals = series.filter(function (v) { return v != null; });
    if (vals.length < 4) return '<p class="v3-chart__empty">Çizgi için yeterli veri yok.</p>';
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (hi === lo) hi = lo + 1;
    var n = series.length;
    var stepX = W / (n - 1 || 1);
    var yOf = function (v) { return H - 6 - ((v - lo) / (hi - lo)) * (H - 14); };

    /* Ham seri: noktalar. AO: kalın çizgi. */
    var dots = '', rawPath = '', maPath = '', started = false;
    for (var i = 0; i < n; i++) {
      var x = i * stepX;
      if (series[i] != null) {
        dots += '<circle class="v3-line__dot" cx="' + x + '" cy="' + yOf(series[i]) + '" r="1.5"/>';
        rawPath += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + yOf(series[i]).toFixed(1);
        started = true;
      }
      if (ma[i] != null) maPath += (maPath === '' ? 'M' : 'L') + x.toFixed(1) + ' ' + yOf(ma[i]).toFixed(1);
    }
    var h = '<svg class="v3-line" viewBox="0 0 ' + W + ' ' + H + '" width="100%" preserveAspectRatio="none" role="img" ' +
      'aria-label="' + esc(opts.label) + ' seyri ve 7 günlük hareketli ortalama">';
    h += '<path class="v3-line__raw" d="' + rawPath + '"/>';
    h += dots;
    if (maPath) h += '<path class="v3-line__ma" d="' + maPath + '"/>';
    h += '</svg>';
    h += '<div class="v3-line__leg" aria-hidden="true"><span><i class="is-raw"></i>Günlük</span>' +
      '<span><i class="is-ma"></i>7 günlük ortalama</span>' +
      '<span class="v3-line__rng">' + num(lo, opts.dec) + '–' + num(hi, opts.dec) + '</span></div>';
    return h;
  }

  /* ── 8 · Dürüstlük notu ──────────────────────────────────────────────────
     Kaynağı doğru anlatır: sayfa kendi özel veri deposundan (salt-okur) ya da
     bu cihazdaki kayıttan okur — hangisi geldiyse ondan. "Yalnız bu cihaz"
     demek artık yanlış olurdu. */
  function honestyNote(days, analytics) {
    var low = analytics.correlations.filter(function (c) { return !c.reliable; }).length;
    return '<div class="v3-honest">' +
      '<p><b>Nasıl hesaplandı?</b> Bütün sayılar <b>' + days +
      ' günlük</b> kayıttan, uygulamanın kendi tanımlarıyla üretildi.</p>' +
      '<ul>' +
      '<li>Ortalama, medyan, standart sapma, CV ve çeyrekler <b>yalnız o ölçümün dolu olduğu günlerle</b> hesaplanır; boş günler 0 sayılmaz.</li>' +
      '<li>Eğilim <b>en küçük kareler</b> doğrusudur; R² değeri o doğrunun veriyi ne kadar açıkladığını söyler (0 = hiç, 1 = tam).</li>' +
      '<li>Korelasyon <b>Pearson r</b>\'dir. 3\'ten az eşleşen gün varsa hiç hesaplanmaz' +
      (low ? '; ' + low + ' çift düşük örneklemli olarak işaretlendi' : '') + '.</li>' +
      '<li>Hareketli ortalama pencere dolmadan başlamaz — uydurma değer üretilmez.</li>' +
      '</ul></div>';
  }

  /* ── Kurulum ─────────────────────────────────────────────────────────────*/
  function init(summary) {
    var a = summary && summary.analytics;
    var host = el('v3-istatistik-body');
    var section = el('v3-istatistik');
    if (!host || !section) return;

    if (!a) {
      section.setAttribute('data-state', 'empty');
      host.innerHTML = '<div class="v3-empty"><p><b>İstatistik için henüz yeterli veri yok.</b></p>' +
        '<p>Anlamlı bir dağılım ve eğilim için en az birkaç günün dolu olması gerekir. ' +
        'Bu bölüm sahte grafik çizmez — veri geldikçe kendiliğinden dolar.</p></div>';
      return;
    }

    section.setAttribute('data-state', 'ready');

    var set = function (id, html) { var n = el(id); if (n) n.innerHTML = html; };

    set('v3-ist-desc', descriptive(a.stats));
    set('v3-ist-sleep-hist', distribution(a.hists.sleep, a.stats.sleep, { dec: 1 }));
    set('v3-ist-water-hist', distribution(a.hists.water, a.stats.water, { dec: 0 }));
    set('v3-ist-trends',
      '<ul class="v3-trendlist">' +
      trendRow('Ruh hâli', a.trends.mood, 'puan', 2) +
      trendRow('Uyku', a.trends.sleep, 'saat', 2) +
      trendRow('Su', a.trends.water, 'bardak', 1) +
      trendRow('Enerji', a.trends.energy, 'puan', 2) +
      trendRow('Stres', a.trends.stress, 'puan', 2) +
      trendRow('Alışkanlık', a.trends.ticks, 'tik', 1) +
      '</ul>');
    set('v3-ist-corr', correlations(a.correlations, a.minNForR));
    set('v3-ist-weekday', weekdayProfile(a.weekday));
    set('v3-ist-goals', goals(a.goals));
    set('v3-ist-mood-line', smoothLine(a.series.mood, a.ma.mood, { label: 'Ruh hâli', dec: 2 }));
    set('v3-ist-sleep-line', smoothLine(a.series.sleep, a.ma.sleep, { label: 'Uyku', dec: 2 }));
    set('v3-ist-honest', honestyNote(summary.daysRecorded, a));
  }

  window.SeymaV3StatsView = {
    num: num, signed: signed, pct: pct,
    descriptive: descriptive, distribution: distribution, trendRow: trendRow,
    correlations: correlations, weekdayProfile: weekdayProfile, goals: goals,
    smoothLine: smoothLine, honestyNote: honestyNote,
    init: init
  };
})();
