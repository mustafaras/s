/* ═══════════════════════════════════════════════════════════════════════════
   Şeyma 3.0 · Kutlama sayfası — GRAFİKLER
   ───────────────────────────────────────────────────────────────────────────
   v3-data.js'in ürettiği özeti görselleştirir. Hepsi saf SVG/DOM; kütüphane
   yok, ağ isteği yok, depoya yazma yok.

   GİZLİLİK: Bu dosya ruh hâli ETİKETİ, not, günlük metni veya ad yazmaz.
   Yalnız sayı, tarih ve oran gösterir.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(id) { return document.getElementById(id); }

  /* Türkçe tarih: 23 Haziran 2026 */
  var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function trDate(iso) {
    var p = String(iso || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) return '';
    return p[2] + ' ' + (MONTHS[p[1] - 1] || '') + ' ' + p[0];
  }

  /* ── Isı haritası (85 hücre, haftalık sütunlar) ──────────────────────────
     GitHub katkı grafiği mantığı: sütun = hafta, satır = haftanın günü.
     Yoğunluk = o gün işaretlenen alışkanlık sayısı / o gün aktif olan sayı. */
  function heatmap(cells) {
    if (!cells || !cells.length) return '';
    var dayNames = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

    /* İlk hücrenin haftanın hangi günü olduğunu bul (Pazartesi=0). */
    var first = new Date(cells[0].date + 'T00:00:00');
    var lead = (first.getDay() + 6) % 7;

    var cols = [];
    var col = new Array(lead).fill(null);
    for (var i = 0; i < cells.length; i++) {
      col.push(cells[i]);
      if (col.length === 7) { cols.push(col); col = []; }
    }
    if (col.length) { while (col.length < 7) col.push(null); cols.push(col); }

    var CELL = 11, GAP = 3;
    var w = cols.length * (CELL + GAP) - GAP;
    var h = 7 * (CELL + GAP) - GAP;

    var out = '<svg class="v3-heat" viewBox="0 0 ' + w + ' ' + h + '" ' +
      'width="100%" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'aria-label="85 günlük alışkanlık ısı haritası: ' +
      cells.length + ' gün, koyu hücre daha çok işaretlenen alışkanlık demektir">';

    for (var c = 0; c < cols.length; c++) {
      for (var r = 0; r < 7; r++) {
        var cell = cols[c][r];
        if (!cell) continue;
        var x = c * (CELL + GAP), y = r * (CELL + GAP);
        var ratio = cell.max > 0 ? cell.ticks / cell.max : 0;
        var cls = 'v3-heat__c';
        if (cell.ticks <= 0) cls += ' is-empty';
        else if (ratio >= 0.85) cls += ' is-full';
        else if (ratio >= 0.55) cls += ' is-high';
        else if (ratio >= 0.3) cls += ' is-mid';
        else cls += ' is-low';
        if (cell.hasMood) cls += ' has-mood';
        if (cell.vacation) cls += ' is-vacation';
        out += '<rect class="' + cls + '" x="' + x + '" y="' + y + '" ' +
          'width="' + CELL + '" height="' + CELL + '" rx="2.5">' +
          '<title>' + trDate(cell.date) + ' · ' + cell.ticks + '/' + cell.max + '</title>' +
          '</rect>';
      }
    }
    out += '</svg>';

    /* Gün etiketleri (sol) + yoğunluk açıklaması */
    var labels = '<div class="v3-heat__days" aria-hidden="true">' + dayNames.map(function (n, idx) {
      /* Yalnız 1,3,5 satırlarını yaz — dar ekranda okunur kalsın. */
      return '<span>' + (idx % 2 === 0 ? n : '') + '</span>';
    }).join('') + '</div>';

    return '<div class="v3-heat__wrap">' + labels + '<div class="v3-heat__grid">' + out + '</div></div>' +
      '<div class="v3-heat__legend" aria-hidden="true">' +
      '<span>Az</span><i class="is-empty"></i><i class="is-low"></i><i class="is-mid"></i>' +
      '<i class="is-high"></i><i class="is-full"></i><span>Çok</span></div>';
  }

  /* ── Ruh hâli trendi (30 gün, yalnız YÜKSEKLİK — etiket yok) ──────────── */
  function moodTrend(trend) {
    var pts = (trend || []).filter(function (o) { return o.score != null; });
    if (pts.length < 2) {
      return '<p class="v3-chart__empty">Son 30 günde yeterli ruh hâli kaydı yok. ' +
        'Birkaç işaretleme sonrası burada yön görünür.</p>';
    }
    var W = 300, H = 62, BAR = 7, GAP = 3;
    var n = trend.length;
    var out = '<svg class="v3-bars" viewBox="0 0 ' + (n * (BAR + GAP)) + ' ' + H + '" ' +
      'width="100%" preserveAspectRatio="none" role="img" ' +
      'aria-label="Son 30 günün ruh hâli yönü; sütun yüksekliği daha iyi hissettiğin günleri gösterir">';
    for (var i = 0; i < n; i++) {
      var s = trend[i].score;
      var x = i * (BAR + GAP);
      if (s == null) {
        out += '<rect class="v3-bars__b is-null" x="' + x + '" y="' + (H - 3) + '" width="' + BAR + '" height="3" rx="1.5"></rect>';
        continue;
      }
      var bh = Math.max(5, Math.round(s / 5 * (H - 4)));
      out += '<rect class="v3-bars__b" data-level="' + s + '" x="' + x + '" y="' + (H - bh) + '" ' +
        'width="' + BAR + '" height="' + bh + '" rx="3"></rect>';
    }
    out += '</svg>';
    return out + '<div class="v3-chart__axis" aria-hidden="true"><span>' + trDate(trend[0].date) + '</span>' +
      '<span>' + pts.length + ' işaretli gün</span><span>' + trDate(trend[n - 1].date) + '</span></div>';
  }

  /* ── Alışkanlık çubukları (yalnız oran + ad) ──────────────────────────── */
  var HABIT_LABELS = {
    sweetManaged: 'Tatlı krizi', foodManaged: 'Yemek krizi', coffeeManaged: 'Kahve krizi',
    eveningControl: 'Akşam kontrolü', walked20: '20 dk yürüyüş', protein: 'Protein hedefi',
    water: 'Su hedefi', vitaminD: 'D vitamini', sleepReg: '7,5+ saat uyku',
    journaled: 'Günlük notu', mediaFed: 'Zihin besleme', freshAir: 'Açık hava',
    selfKind: 'Kendine iyi davranma', caffeineOk: 'Kafein limiti', magnesium: 'Magnezyum'
  };
  function habitBars(series) {
    if (!series || !series.length) {
      return '<p class="v3-chart__empty">Alışkanlık verisi henüz yok.</p>';
    }
    var list = series.slice(0, 8);
    var h = '<ul class="v3-hbars">';
    list.forEach(function (s) {
      h += '<li class="v3-hbar">' +
        '<span class="v3-hbar__label">' + esc(HABIT_LABELS[s.key] || s.key) + '</span>' +
        '<span class="v3-hbar__track"><i style="--pct:' + s.rate + '%"></i></span>' +
        '<span class="v3-hbar__val">%' + s.rate + '</span>' +
        '</li>';
    });
    return h + '</ul><p class="v3-chart__note">Yalnız alışkanlığın açık olduğu günler üzerinden.</p>';
  }

  /* ── Rozetler ─────────────────────────────────────────────────────────── */
  function badges(badgesArr, earned, total) {
    if (!badgesArr || !badgesArr.length) return '';
    var h = '<ul class="v3-badges">';
    badgesArr.forEach(function (b) {
      h += '<li class="v3-badge' + (b.done ? ' is-earned' : '') + '">' +
        '<span class="v3-badge__dot" aria-hidden="true"></span>' +
        '<span class="v3-badge__body"><b>' + esc(b.l) + '</b><span>' + esc(b.sub) + '</span></span>' +
        (b.done ? '<span class="v3-badge__check" aria-hidden="true">✓</span>' : '') +
        '</li>';
    });
    return h + '</ul><p class="v3-badges__summary">' + earned + '/' + total +
      ' rozet kazanıldı · kalanlar yolun bir parçası, baskı değil.</p>';
  }

  /* ── Boş durum ────────────────────────────────────────────────────────────
     Kayıt yoksa SAHTE grafik çizilmez. Dürüst ve davetkâr bir metin. */
  function emptyState() {
    return '<div class="v3-empty">' +
      '<p><b>Bu cihazda henüz kayıt görünmüyor.</b></p>' +
      '<p>Bu sayfa yalnız senin tarayıcındaki kayıtları okur — hiçbir yere ' +
      'göndermez, hiçbir şeyi değiştirmez. Uygulamada birkaç gün işaretledikçe ' +
      'burası kendi yolculuğunla dolar.</p>' +
      '</div>';
  }

  /* ── Kurulum ─────────────────────────────────────────────────────────────
     Veri gelmezse/hata olursa bölüm GİZLENİR — sayfanın geri kalanı aynen
     kalır, yarım grafik görünmez. */
  function init() {
    var section = el('v3-veri');
    if (!section) return;

    var summary;
    try {
      summary = window.SeymaV3Data && window.SeymaV3Data.summarize();
    } catch (_) {
      summary = null;
    }

    if (!summary || !summary.available ||
        !(summary.daysRecorded > 0 || summary.ticks > 0)) {
      var bodyEmpty = el('v3-veri-body');
      if (bodyEmpty) bodyEmpty.innerHTML = emptyState();
      section.setAttribute('data-state', 'empty');
      return;
    }

    section.setAttribute('data-state', 'ready');

    /* Selamlama adı yalnız kendi cihazındaki takma ad — ağa çıkmaz. */
    var greeting = el('v3-veri-greeting');
    if (greeting) greeting.textContent = summary.nickname;

    /* Sayı bloğu — sayaç animasyonu data-count ile (v3.js) */
    var stats = el('v3-veri-stats');
    if (stats) {
      var tiles = [
        [summary.daysRecorded, 'kayıtlı gün', ''],
        [summary.ticks, 'işaretlenen alışkanlık', ''],
        [summary.coverage, 'kapsam', '%'],
        [summary.bestStreak, 'en uzun seri', ''],
        [summary.perfectDays, 'tam gün', ''],
        [summary.moodTotal, 'ruh hâli işareti', '']
      ];
      stats.innerHTML = tiles.map(function (t) {
        return '<div class="v3-vstat"><dd data-count="' + t[0] + '"' +
          (t[2] ? ' data-suffix="' + t[2] + '"' : '') + '>' + t[0] + t[2] + '</dd>' +
          '<dt>' + esc(t[1]) + '</dt></div>';
      }).join('');
    }

    var heatEl = el('v3-veri-heat');
    if (heatEl) heatEl.innerHTML = heatmap(summary.heatCells);

    var heatCap = el('v3-veri-heat-cap');
    if (heatCap) {
      heatCap.textContent = trDate(summary.startDate) + ' → ' + trDate(summary.endDate) +
        ' · ' + summary.dayCount + ' gün';
    }

    var trendEl = el('v3-veri-mood');
    if (trendEl) trendEl.innerHTML = moodTrend(summary.moodTrend);

    var habitEl = el('v3-veri-habits');
    if (habitEl) habitEl.innerHTML = habitBars(summary.habitSeries);

    var badgeEl = el('v3-veri-badges');
    if (badgeEl) badgeEl.innerHTML = badges(summary.badges, summary.earnedCount, summary.totalBadges);

    /* Gelişmiş istatistik bölümü — v3-statsview.js yüklüyse çizilir. */
    if (window.SeymaV3StatsView && typeof window.SeymaV3StatsView.init === 'function') {
      try { window.SeymaV3StatsView.init(summary); } catch (_) {}
    }
  }

  window.SeymaV3Charts = {
    trDate: trDate,
    heatmap: heatmap,
    moodTrend: moodTrend,
    habitBars: habitBars,
    badges: badges,
    emptyState: emptyState,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
