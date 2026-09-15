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

  /* Türkçe tarih: ör. 24 Haziran 2026 */
  var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function trDate(iso) {
    var p = String(iso || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) return '';
    return p[2] + ' ' + (MONTHS[p[1] - 1] || '') + ' ' + p[0];
  }

  /* ── Isı haritası (haftalık sütunlar) ─────────────────────────────────────
     GitHub katkı grafiği mantığı: sütun = hafta, satır = haftanın günü.
     Yoğunluk = o gün işaretlenen alışkanlık sayısı / o gün aktif olan sayı.

     v2 (2026-09-15, kullanıcı: "daha minimal, doğru ve premium"):
     · Gün etiketleri artık SVG'nin İÇİNDE — eski sürümde sabit 11px HTML
       satırlarıydı, ızgara ise genişliğe göre ölçeklendiği için satırlar
       kayıyordu (Pt/Ça/Cu/Pz yanlış satırın hizasına düşüyordu).
     · Üstte ay işaretleri (ayın ilk gününü içeren sütun).
     · Ruh hâli çerçevesi kaldırıldı: 84/84 günde vardı, bilgi taşımıyordu.
     · 5 kademeli tek-ton altın ölçek; tatil günü yalnız hafif kesikli çerçeve. */
  function heatmap(cells) {
    if (!cells || !cells.length) return '';
    var dayNames = ['Pt', '', 'Ça', '', 'Cu', '', 'Pz'];
    var monthShort = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

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

    var CELL = 12, GAP = 3, STEP = CELL + GAP;
    var GUT_L = 24, GUT_T = 15;                       /* etiket boşlukları (SVG birimi) */
    var w = GUT_L + cols.length * STEP - GAP;
    var h = GUT_T + 7 * STEP - GAP;

    var out = '<svg class="v3-heat" viewBox="0 0 ' + w + ' ' + h + '" ' +
      'width="100%" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'aria-label="' + cells.length + ' günlük alışkanlık haritası; koyu hücre, o gün daha çok alışkanlık işaretlendi demektir">';

    /* Gün etiketleri — hücreyle AYNI koordinat sisteminde, tam ortada. */
    for (var r0 = 0; r0 < 7; r0++) {
      if (!dayNames[r0]) continue;
      out += '<text class="v3-heat__lbl" x="0" y="' + (GUT_T + r0 * STEP + CELL / 2) + '" ' +
        'dominant-baseline="central">' + dayNames[r0] + '</text>';
    }

    /* Ay işaretleri — ayın ilk hücresini içeren sütunun üstüne. Bir aya
       3 sütundan az yer düşüyorsa (ör. 24 Haziran'da başlayan tek haftalık
       Haziran) etiketi yazma: komşu ayla üst üste biner. */
    var starts = [], seenMonth = '';
    for (var mc = 0; mc < cols.length; mc++) {
      for (var mr = 0; mr < 7; mr++) {
        var mcell = cols[mc][mr];
        if (!mcell) continue;
        var ym = mcell.date.slice(0, 7);
        if (ym !== seenMonth) { seenMonth = ym; starts.push({ col: mc, m: Number(mcell.date.slice(5, 7)) }); }
      }
    }
    for (var si = 0; si < starts.length; si++) {
      var next = starts[si + 1];
      if (next && next.col - starts[si].col < 3) continue;
      out += '<text class="v3-heat__lbl v3-heat__lbl--m" x="' + (GUT_L + starts[si].col * STEP) + '" y="' +
        (GUT_T - 6) + '">' + monthShort[starts[si].m - 1] + '</text>';
    }

    for (var c = 0; c < cols.length; c++) {
      for (var r = 0; r < 7; r++) {
        var cell = cols[c][r];
        if (!cell) continue;
        var x = GUT_L + c * STEP, y = GUT_T + r * STEP;
        var ratio = cell.max > 0 ? cell.ticks / cell.max : 0;
        var cls = 'v3-heat__c';
        if (cell.ticks <= 0) cls += ' is-empty';
        else if (ratio >= 0.75) cls += ' is-full';
        else if (ratio >= 0.5) cls += ' is-high';
        else if (ratio >= 0.25) cls += ' is-mid';
        else cls += ' is-low';
        if (cell.vacation) cls += ' is-vacation';
        out += '<rect class="' + cls + '" x="' + x + '" y="' + y + '" ' +
          'width="' + CELL + '" height="' + CELL + '" rx="3">' +
          '<title>' + trDate(cell.date) + ' · ' + cell.ticks + '/' + cell.max + ' alışkanlık</title>' +
          '</rect>';
      }
    }
    out += '</svg>';

    /* Tek satır özet: en dolu gün + günlük ortalama (yalnız kayıtlı günler). */
    var best = null, sumR = 0, nR = 0;
    for (var k = 0; k < cells.length; k++) {
      var ck = cells[k];
      if (ck.max > 0 && ck.ticks > 0) { sumR += ck.ticks / ck.max; nR++; }
      if (!best || ck.ticks > best.ticks) best = ck;
    }
    var facts = '';
    if (best && best.ticks > 0) {
      facts = '<div class="v3-heat__facts">' +
        '<span><b>' + best.ticks + '/' + best.max + '</b> en dolu gün · ' + trDate(best.date) + '</span>' +
        '<span><b>%' + Math.round(sumR / Math.max(1, nR) * 100) + '</b> ortalama doluluk</span>' +
        '</div>';
    }

    return '<div class="v3-heat__grid">' + out + '</div>' +
      '<div class="v3-heat__legend" aria-hidden="true">' +
      '<span>Az</span><i class="is-empty"></i><i class="is-low"></i><i class="is-mid"></i>' +
      '<i class="is-high"></i><i class="is-full"></i><span>Çok</span></div>' + facts;
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
  /* Uzak okuma neden olmadı? Kod → kullanıcıya anlaşılır Türkçe.
     Token/ham veri buraya asla girmez; yalnız kısa neden. */
  function remoteFailText(code) {
    code = String(code || '');
    if (!code) return '';
    if (code === 'no-creds') {
      return 'bu tarayıcıda eşitleme anahtarı yok. Sayfayı uygulamayı kullandığın ' +
        'cihazdan (telefondan) aç ya da uygulamayı bu tarayıcıda açıp Ayarlar → ' +
        'Eşitleme’den anahtarı gir.';
    }
    if (/^(blob-)?http_(401|403)$/.test(code)) {
      return 'eşitleme anahtarı reddedildi (HTTP ' + code.replace(/\D/g, '') +
        '). Anahtarın süresi dolmuş ya da yetkisi eksik olabilir — Ayarlar → ' +
        'Eşitleme’den yenile.';
    }
    if (/^(blob-)?http_404$/.test(code)) {
      return 'depo ya da dosya bulunamadı (HTTP 404). Ayarlar → Eşitleme’deki depo ' +
        'adını kontrol et.';
    }
    if (/^(blob-)?http_/.test(code)) {
      return 'sunucu hatası (HTTP ' + code.replace(/\D/g, '') + '). Sayfayı yenile.';
    }
    if (code === 'timeout') return 'zaman aşımı (30 sn). Bağlantı yavaş — sayfayı yenile.';
    if (code === 'network') return 'ağ hatası. Çevrimdışı olabilirsin — sayfayı yenile.';
    return 'uzak dosya okunamadı (' + code + '). Sayfayı yenile.';
  }

  function emptyState() {
    var V3 = window.SeymaV3Data;
    var s = (V3 && typeof V3.source === 'function') ? V3.source() : null;
    var why = remoteFailText(s && s.remoteFail);
    return '<div class="v3-empty">' +
      '<p><b>Şu an gösterilecek kayıt bulunamadı.</b></p>' +
      (why ? '<p><b>Eşitlenmiş veriye ulaşılamadı:</b> ' + esc(why) + '</p>' : '') +
      '<p>Bu sayfa kayıtlarını senin kendi özel veri depondan okumaya çalışır; ' +
      'oraya ulaşamazsa bu tarayıcıdakilere bakar. Hiçbir yere yazmaz, ' +
      'hiçbir şeyi değiştirmez. Uygulamada birkaç gün işaretledikçe burası ' +
      'kendi yolculuğunla dolar.</p>' +
      '</div>';
  }

  /* ── Veri kaynağı rozeti ──────────────────────────────────────────────────
     Sayfa hangi kaynaktan okuduğunu AÇIKÇA söyler. Amaç: "eşitlenmiş veri"
     derken sessizce cihaz kaydını göstermek gibi bir yanılsamaya düşmemek.
     `none` durumunda yazı gösterilmez (boş durum zaten kendi metnini verir). */
  function sourceBadge() {
    var node = el('v3-veri-src');
    if (!node) return;
    var V3 = window.SeymaV3Data;
    var s = (V3 && typeof V3.source === 'function') ? V3.source() : null;
    var src = (s && s.src) || 'none';

    if (src === 'none') {
      node.setAttribute('data-src', 'none');
      node.hidden = true;
      node.textContent = '';
      return;
    }

    node.removeAttribute('hidden');
    node.setAttribute('data-src', src);
    var why = src === 'device' ? remoteFailText(s && s.remoteFail) : '';
    if (src === 'snapshot') {
      node.textContent = '✓ Eşitlenmiş veri · ' + trDate(s.detail) +
        ' anlık görüntüsü · sayfaya gömülü, salt-okur (ağ yok)';
      return;
    }
    node.textContent = src === 'remote'
      ? '✓ Eşitlenmiş veri · kendi özel veri deposundan salt-okur okundu'
      : 'Bu cihazdaki kayıt · eşitlenmiş veriye ulaşılamadı' +
        (why ? ' — ' + why + ' Aşağıdaki sayılar bu cihazdaki kayıtla sınırlıdır; eksik olabilir.' : '');
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
      sourceBadge();
      return;
    }

    section.setAttribute('data-state', 'ready');
    sourceBadge();

    /* Selamlama adı yalnız kullanıcının kendi takma adından gelir. */
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
        ' · ' + summary.daysRecorded + ' kayıtlı gün';
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
    remoteFailText: remoteFailText,
    sourceBadge: sourceBadge,
    init: init
  };

  /* Kendi kendine kurulum. `v3-source.js` yüklüyse boot'u O sahiplenir:
     önce uzak veriyi bir kez (salt-okur) çeker; olmazsa cihaz deposuna düşer,
     sonra `init()` çağırır. Kaynak modül yoksa sayfa tek başına çalışır —
     bu dosya hiçbir koşulda ağa çıkmaz. */
  function autoboot() {
    if (window.SeymaV3Source) return;
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoboot);
  } else {
    autoboot();
  }
})();
