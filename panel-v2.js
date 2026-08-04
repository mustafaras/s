// ÆON Observer Dashboard v2 — IIFE runtime
// Mevcut panel.js'ten bağımsız yeni panel runtime'ı.
(function(root){
  "use strict";

  var TABS = [
    { id: "today",    label: "Genel Bakış", icon: "◐" },
    { id: "trends",   label: "Trendler",    icon: "◑" },
    { id: "day",      label: "Gün Detayı",  icon: "◎" },
    { id: "archives", label: "Arşivler",    icon: "◈" },
    { id: "system",   label: "Sistem",      icon: "◉" }
  ];

  var ui = {
    tab: "today",
    subTab: null,
    date: isoDate(new Date()),
    trendWindow: 7,
    density: "comfortable",
    theme: "dark"
  };

  var syncStatus = {
    status: "idle",
    lastErrorCode: null,
    snapshotRevision: null,
    sourceUpdatedAt: null
  };

  var appData = null;

  function isoDate(d) {
    if (!d || isNaN(d.getTime())) d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function dateOffset(baseDate, days) {
    var d = new Date(baseDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return isoDate(d);
  }

  function safeText(v, max) {
    var s = typeof v === "string" ? v : "";
    max = max || 240;
    return s.length <= max ? s : s.slice(0, max) + "…";
  }

  function safeNumber(v) {
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  function formatHours(h) {
    var n = safeNumber(h);
    if (n === null) return null;
    var hInt = Math.floor(n), min = Math.round((n - hInt) * 60);
    return min ? hInt + "sa " + min + "dk" : hInt + "sa";
  }

  function isObject(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function(m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function classNames(arr) { return arr.filter(Boolean).join(" "); }

  // ── Projection adapter ────────────────────────────────────────────────
  function projectData(data) {
    var coverage = null;
    if (typeof root.SeymaPanelCoverage !== "undefined" &&
        typeof root.SeymaPanelCoverage.coverageForData === "function") {
      try {
        coverage = root.SeymaPanelCoverage.coverageForData(data);
      } catch (e) {
        coverage = { full: [], summary: [], redacted: [], missing: [], unmappedPaths: [], error: e.message };
      }
    }
    return {
      ok: true,
      coverage: coverage || { full: [], summary: [], redacted: [], missing: [], unmappedPaths: [] },
      dayCount: isObject(data) && isObject(data.days) ? Object.keys(data.days).length : 0,
      lastOpenedDate: isObject(data) ? String(data.lastOpenedDate || "") : "",
      savedAt: isObject(data) ? String(data.savedAt || "") : ""
    };
  }

  // ── UI atoms ───────────────────────────────────────────────────────────
  function AeEmpty(opts) {
    opts = opts || {};
    var icon = opts.icon || "◌";
    var title = safeText(opts.title || "Henüz veri yok", 80);
    var message = safeText(opts.message || "Bu bölümde görüntülenecek veri şu an yok.", 240);
    return '<div class="ae-empty ae-fade-in">' +
           '<div class="ae-empty__icon">' + escapeHtml(icon) + "</div>" +
           '<div class="ae-empty__title">' + escapeHtml(title) + "</div>" +
           '<div class="ae-empty__text">' + escapeHtml(message) + "</div>" +
           "</div>";
  }

  function AeCard(opts) {
    opts = opts || {};
    var cls = classNames(["ae-card", "ae-fade-in", opts.variant ? "ae-card--" + opts.variant : "", opts.className]);
    return '<div class="' + escapeHtml(cls) + '">' + (opts.children || "") + "</div>";
  }

  function AeButton(opts) {
    opts = opts || {};
    var cls = classNames(["ae-btn", opts.variant ? "ae-btn--" + opts.variant : "", opts.className]);
    var label = safeText(opts.label, 80);
    var attrs = opts.onclick ? ' onclick="' + escapeHtml(opts.onclick) + '"' : "";
    return '<button type="button" class="' + escapeHtml(cls) + '"' + attrs + '>' + escapeHtml(label) + "</button>";
  }

  function AeStatusBadge(opts) {
    opts = opts || {};
    var status = opts.status || "idle";
    var labels = {
      idle: "Bekliyor", local_saved: "Kaydedildi", queued: "Sıraya alındı",
      saving: "Gönderiliyor", retrying: "Yeniden deneniyor", accepted: "Senkronize",
      error: "Hata", offline: "Çevrimdışı", permission: "İzin hatası",
      unauthorized: "Yetkisiz", forbidden: "Yasak", not_found: "Bulunamadı",
      conflict: "Çakışma", anti_clobber: "Koruma", rate_limited: "Limit",
      receipt_failed: "Makbuz hatası"
    };
    var palette = {
      idle: "muted", local_saved: "info", queued: "info", saving: "warn", retrying: "warn",
      accepted: "ok", error: "drop", offline: "pause", permission: "drop",
      unauthorized: "drop", forbidden: "drop", not_found: "drop", conflict: "warn",
      anti_clobber: "warn", rate_limited: "warn", receipt_failed: "drop"
    };
    var tone = palette[status] || "muted";
    return '<span class="ae-status ae-status--' + tone + '">' +
           '<span class="ae-status__dot"></span>' +
           '<span class="ae-status__label">' + escapeHtml(labels[status] || status) + "</span>" +
           "</span>";
  }

  // ── Date helpers / state access ─────────────────────────────────────────
  function todayStr() { return ui.date || isoDate(new Date()); }
  function setDate(date) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    ui.date = date;
    render();
  }
  function setData(data) {
    appData = data;
    render();
  }
  function getDay(date) {
    return isObject(appData) && isObject(appData.days) ? (appData.days[date] || null) : null;
  }
  function lastNDates(n, ref) {
    var out = [], base = ref || todayStr();
    for (var i = n - 1; i >= 0; i--) out.push(dateOffset(base, -i));
    return out;
  }

  // ── Mood label map ───────────────────────────────────────────────────────
  var MOOD_LABELS = {
    1: "Fırtınalı", 2: "Bulutlu", 3: "Durağan", 4: "Huzurlu",
    5: "Aydınlık", 6: "Neşeli", 7: "Coşkulu"
  };
  var MOOD_ICONS = { 1: "⛈", 2: "☁️", 3: "🌫", 4: "🌤", 5: "☀️", 6: "🌈", 7: "✨" };

  // ── HeroCard ─────────────────────────────────────────────────────────────
  function HeroCard(opts) {
    opts = opts || {};
    var color = opts.color || "accent";
    var value = opts.value !== undefined && opts.value !== null ? String(opts.value) : "—";
    var unit = opts.unit ? ' <span class="hero-card__unit">' + escapeHtml(opts.unit) + "</span>" : "";
    var trend = opts.trend ? ' <span class="hero-card__trend">' + escapeHtml(opts.trend) + "</span>" : "";
    return '<div class="ae-card ae-card--hero hero-card hero-card--' + color + '">' +
           '<div class="hero-card__icon">' + escapeHtml(opts.icon || "◌") + "</div>" +
           '<div class="hero-card__title">' + escapeHtml(safeText(opts.title, 40)) + "</div>" +
           '<div class="hero-card__value">' + escapeHtml(value) + unit + trend + "</div>" +
           (opts.sub ? '<div class="hero-card__sub">' + escapeHtml(safeText(opts.sub, 80)) + "</div>" : "") +
           "</div>";
  }

  function renderHeroGrid(date) {
    var day = getDay(date) || {};
    var yesterday = getDay(dateOffset(date, -1)) || {};

    var moodVal = safeNumber(day.mood && day.mood.value);
    var moodLabel = moodVal ? (MOOD_LABELS[moodVal] || "Bilinmiyor") : null;
    var moodIcon = moodVal ? (MOOD_ICONS[moodVal] || "◌") : "◌";
    var moodText = moodVal ? (moodIcon + " " + moodLabel) : "—";

    var sleepDur = yesterday.sleep && yesterday.sleep.duration;
    var sleepQuality = yesterday.sleep && yesterday.sleep.quality;
    var sleepText = formatHours(sleepDur) || "—";
    var sleepSub = sleepQuality ? "Kalite: " + safeNumber(sleepQuality) + "/10" : "";

    var sosCount = safeNumber(day.cravingSOSCount) || safeNumber(day.sos && day.sos.count) || 0;
    var sosText = sosCount > 0 ? sosCount.toString() : "—";
    var sosSub = sosCount > 0 ? "SOS kaydı" : "Sessiz";

    var steps = safeNumber(day.health && day.health.steps);
    var stepsText = steps !== null ? steps.toLocaleString("tr-TR") : "—";

    return '<div class="ae-grid--hero">' +
           HeroCard({ icon: "🌤", title: "Mod", value: moodText, color: "mood", sub: day.mood && day.mood.note ? "not eklendi" : "" }) +
           HeroCard({ icon: "🌙", title: "Uyku", value: sleepText, color: "sleep", sub: sleepSub, unit: sleepText !== "—" ? "" : null }) +
           HeroCard({ icon: "🆘", title: "SOS", value: sosText, color: sosCount > 0 ? "drop" : "ok", sub: sosSub }) +
           HeroCard({ icon: "👟", title: "Adım", value: stepsText, color: "info", unit: steps !== null ? "adım" : null }) +
           "</div>";
  }

  // ── Trend strip ─────────────────────────────────────────────────────────
  function metricBar(value, max, color) {
    var n = safeNumber(value), m = safeNumber(max) || 10;
    var pct = n !== null ? Math.max(0, Math.min(100, Math.round((n / m) * 100))) : 0;
    var empty = n === null;
    return '<div class="trend-bar ' + (empty ? "trend-bar--empty" : "") + ' trend-bar--' + (color || "accent") + '" ' +
           'style="--bar-pct:' + pct + '%" aria-hidden="true"><div class="trend-bar__fill"></div></div>';
  }

  function renderTrendStrip(date) {
    var dates = lastNDates(7, date);
    var metrics = [
      { key: "mood", label: "Mod", max: 7, color: "mood" },
      { key: "sleep", label: "Uyku", max: 10, color: "sleep" },
      { key: "steps", label: "Adım", max: 12000, color: "info" },
      { key: "water", label: "Su", max: 12, color: "ok" }
    ];
    var html = '<div class="ae-card ae-fade-in trend-strip">' +
               '<div class="ae-label">Son 7 gün</div>';
    metrics.forEach(function(meta) {
      html += '<div class="trend-strip__row">' +
              '<div class="trend-strip__label">' + escapeHtml(meta.label) + "</div>" +
              '<div class="trend-strip__bars">';
      dates.forEach(function(d) {
        var day = getDay(d) || {};
        var v = null;
        if (meta.key === "mood") v = day.mood && day.mood.value;
        else if (meta.key === "sleep") v = day.sleep && day.sleep.duration;
        else if (meta.key === "steps") v = day.health && day.health.steps;
        else if (meta.key === "water") v = day.nutrition && day.nutrition.waterGlasses;
        html += metricBar(v, meta.max, meta.color);
      });
      html += "</div></div>";
    });
    html += "</div>";
    return html;
  }

  // ── Quick notes / therapy share card ────────────────────────────────────
  function renderQuickNotes(date) {
    var day = getDay(date) || {};
    var items = [];
    if (day.journal && day.journal.text) items.push({ kind: "Günlük", icon: "📝" });
    if (day.note) items.push({ kind: "Not", icon: "📌" });
    if (day.intention) items.push({ kind: "Niyet", icon: "🕯" });
    if (day.gratitude) items.push({ kind: "Şükür", icon: "🙏" });
    if (day.therapy && day.therapy.share) items.push({ kind: "Terapi paylaşımı", icon: "🛡", redacted: true });

    if (!items.length) return "";

    var chips = items.map(function(it) {
      return '<span class="ae-chip ' + (it.redacted ? "ae-chip--redacted" : "") + '">' +
             escapeHtml(it.icon + " " + it.kind) +
             (it.redacted ? ' <span class="ae-chip__hint">redacted</span>' : "") +
             "</span>";
    }).join("");

    return AeCard({
      variant: "summary",
      children: '<div class="quick-notes">' +
                '<div class="ae-label">Hızlı notlar</div>' +
                '<div class="quick-notes__chips">' + chips + "</div>" +
                "</div>"
    });
  }

  // ── Date picker ────────────────────────────────────────────────────────
  function renderDatePicker() {
    var today = isoDate(new Date());
    var isToday = ui.date === today;
    var dateText = isToday ? "Bugün" : formatDateLabel(ui.date);
    return '<div class="ae-card ae-card--summary date-picker">' +
           '<button type="button" class="ae-btn ae-btn--mini" onclick="AeonV2.shiftDate(-1)">◀</button>' +
           '<div class="date-picker__display">' +
           '<div class="date-picker__label">' + escapeHtml(dateText) + "</div>" +
           '<div class="date-picker__iso">' + escapeHtml(ui.date) + "</div>" +
           "</div>" +
           '<button type="button" class="ae-btn ae-btn--mini" onclick="AeonV2.shiftDate(1)">▶</button>' +
           '<button type="button" class="ae-btn ae-btn--text" onclick="AeonV2.goToDayDetail()">Detay</button>' +
           "</div>";
  }

  function formatDateLabel(iso) {
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function shiftDate(delta) {
    setDate(dateOffset(ui.date, delta));
  }

  function goToDayDetail(isoDate) {
    if (isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) ui.date = isoDate;
    ui.tab = "day";
    render();
  }

  // ── Summary / anomaly analytics ───────────────────────────────────────
  function mean(arr) {
    var nums = arr.filter(function(n) { return n !== null && isFinite(n); });
    return nums.length ? nums.reduce(function(a, b) { return a + b; }, 0) / nums.length : null;
  }

  function isQuickEntry(day) {
    if (!isObject(day)) return false;
    var hasMood = !!(day.mood && day.mood.value != null);
    var hasDetail = !!(day.sleep || day.nutrition || day.health || day.journal || day.note || day.prayer || day.media || day.therapy);
    return hasMood && !hasDetail;
  }

  function getGoal(key, fallback) {
    if (!isObject(appData) || !isObject(appData.settings) || !isObject(appData.settings.goals)) return fallback;
    var v = safeNumber(appData.settings.goals[key]);
    return v !== null ? v : fallback;
  }

  function summaryForWindow(endDate, days) {
    var dates = lastNDates(days, endDate);
    var moods = [], sleeps = [], steps = [], waters = [], sosCounts = [], missing = 0, moh = 0, maxMoh = 0;
    dates.forEach(function(d) {
      var day = getDay(d);
      if (!day) { missing++; maxMoh = 0; return; }
      missing = 0;
      if (isQuickEntry(day)) { moh++; maxMoh = Math.max(maxMoh, moh); }
      else { maxMoh = Math.max(maxMoh, moh); moh = 0; }
      if (day.mood && day.mood.value != null) moods.push(day.mood.value);
      if (day.sleep && day.sleep.duration != null) sleeps.push(day.sleep.duration);
      var s = safeNumber(day.health && day.health.steps);
      if (s !== null) steps.push(s);
      var w = safeNumber(day.nutrition && day.nutrition.waterGlasses);
      if (w !== null) waters.push(w);
      var sos = safeNumber(day.cravingSOSCount) || safeNumber(day.sos && day.sos.count) || 0;
      sosCounts.push(sos);
    });
    return {
      dates: dates,
      moodMean: mean(moods),
      sleepMean: mean(sleeps),
      stepsMean: mean(steps),
      waterMean: mean(waters),
      sosTotal: sosCounts.reduce(function(a, b) { return a + b; }, 0),
      missingDays: dates.length - dates.filter(function(d) { return !!getDay(d); }).length,
      mohStreak: maxMoh,
      _moods: moods,
      _sleeps: sleeps,
      _steps: steps,
      _waters: waters,
      _sos: sosCounts
    };
  }

  function deltaPct(current, previous) {
    if (current === null || previous === null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  function detectAnomalies(endDate) {
    var anomalies = [];
    var w7 = summaryForWindow(endDate, 7);
    var prev7 = summaryForWindow(dateOffset(endDate, -7), 7);

    // Uyku düşüşü ≥%20
    if (w7.sleepMean !== null && prev7.sleepMean !== null) {
      var sleepDrop = deltaPct(w7.sleepMean, prev7.sleepMean);
      if (sleepDrop <= -20) {
        anomalies.push({
          id: "sleep-drop-" + endDate,
          kind: "sleep",
          severity: "risk",
          message: "Uyku süresi son 7 günde %" + Math.abs(sleepDrop) + " düştü",
          dates: w7.dates,
          linkDate: endDate
        });
      }
    }

    // SOS artışı
    if (w7.sosTotal > 0 && w7.sosTotal > prev7.sosTotal) {
      anomalies.push({
        id: "sos-rise-" + endDate,
        kind: "sos",
        severity: "warn",
        message: "SOS kaydı artışı: " + w7.sosTotal + " (önceki 7 gün: " + prev7.sosTotal + ")",
        dates: w7.dates,
        linkDate: endDate
      });
    }

    // Eksik gün ≥3 arka arkaya
    var dates = lastNDates(14, endDate);
    var missingStreak = 0, maxMissingStreak = 0, streakEnd = null;
    for (var i = 0; i < dates.length; i++) {
      if (!getDay(dates[i])) { missingStreak++; if (missingStreak > maxMissingStreak) { maxMissingStreak = missingStreak; streakEnd = dates[i]; } }
      else { missingStreak = 0; }
    }
    if (maxMissingStreak >= 3) {
      anomalies.push({
        id: "missing-streak-" + endDate,
        kind: "missing",
        severity: "warn",
        message: maxMissingStreak + " gün arka arkaya kayıt yok",
        dates: dates,
        linkDate: streakEnd || endDate
      });
    }

    // MOH ≥10 gün arka arkaya
    var mohDates = lastNDates(14, endDate);
    var mohStreak = 0, maxMohStreak = 0, mohEnd = null;
    for (var j = 0; j < mohDates.length; j++) {
      if (isQuickEntry(getDay(mohDates[j]))) { mohStreak++; if (mohStreak > maxMohStreak) { maxMohStreak = mohStreak; mohEnd = mohDates[j]; } }
      else { mohStreak = 0; }
    }
    if (maxMohStreak >= 10) {
      anomalies.push({
        id: "moh-streak-" + endDate,
        kind: "moh",
        severity: "risk",
        message: maxMohStreak + " gün arka arkaya sadece mod kaydı",
        dates: mohDates,
        linkDate: mohEnd || endDate
      });
    }

    // Su / adım hedefin %50 altında (son 7 gün ortalama)
    var stepGoal = getGoal("steps", 10000);
    var waterGoal = getGoal("waterGlasses", 8);
    if (w7.stepsMean !== null && w7.stepsMean < stepGoal * 0.5) {
      anomalies.push({
        id: "steps-low-" + endDate,
        kind: "steps",
        severity: "info",
        message: "Adım ortalaması hedefin yarısının altında",
        dates: w7.dates,
        linkDate: endDate
      });
    }
    if (w7.waterMean !== null && w7.waterMean < waterGoal * 0.5) {
      anomalies.push({
        id: "water-low-" + endDate,
        kind: "water",
        severity: "info",
        message: "Su ortalaması hedefin yarısının altında",
        dates: w7.dates,
        linkDate: endDate
      });
    }

    return anomalies;
  }

  // ── SummaryCard komponenti ──────────────────────────────────────────────
  function SummaryCard(opts) {
    opts = opts || {};
    var value = opts.value !== undefined && opts.value !== null ? String(opts.value) : "—";
    var unit = opts.unit ? ' <span class="summary-card__unit">' + escapeHtml(opts.unit) + "</span>" : "";
    var trend = opts.trend || "→";
    var status = opts.status || "normal";
    var statusTone = { normal: "ok", attention: "warn", risk: "drop" }[status] || "info";
    return '<div class="ae-card ae-card--summary summary-card summary-card--' + status + '">' +
           '<div class="summary-card__head">' +
           '<div class="summary-card__title">' + escapeHtml(safeText(opts.title, 40)) + "</div>" +
           '<span class="ae-status ae-status--' + statusTone + '">' + escapeHtml({ normal: "normal", attention: "dikkat", risk: "risk" }[status] || status) + "</span>" +
           "</div>" +
           '<div class="summary-card__value">' + escapeHtml(value) + unit + ' <span class="summary-card__trend">' + escapeHtml(trend) + "</span></div>" +
           '<div class="summary-card__window">Son ' + escapeHtml(String(opts.windowDays || 7)) + " gün</div>" +
           (opts.delta ? '<div class="summary-card__delta">' + escapeHtml(opts.delta) + "</div>" : "") +
           "</div>";
  }

  function AnomalyCard(a) {
    var tone = { info: "info", warn: "warn", risk: "drop" }[a.severity] || "info";
    var dateLabel = a.linkDate ? formatDateLabel(a.linkDate) : "";
    return '<div class="ae-card ae-card--summary anomaly-card anomaly-card--' + a.severity + '">' +
           '<div class="anomaly-card__row">' +
           '<div class="anomaly-card__icon">' + escapeHtml({ sleep: "🌙", sos: "🆘", missing: "🕳", moh: "🌫", steps: "👟", water: "💧" }[a.kind] || "◌") + "</div>" +
           '<div class="anomaly-card__body">' +
           '<div class="anomaly-card__message">' + escapeHtml(a.message) + "</div>" +
           '<div class="anomaly-card__meta">' + escapeHtml(dateLabel) + "</div>" +
           "</div>" +
           '<button type="button" class="ae-btn ae-btn--text" onclick="AeonV2.goToDayDetail(\'' + escapeHtml(a.linkDate) + '\')">Detay gör</button>' +
           "</div></div>";
  }

  function renderSummaryGrid(endDate, windowDays) {
    var s = summaryForWindow(endDate, windowDays);
    var prev = summaryForWindow(dateOffset(endDate, -windowDays), windowDays);

    function fmtMean(n, digits) {
      if (n === null) return "—";
      digits = digits || 0;
      return n.toLocaleString("tr-TR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
    }

    var moodTrend = "→", moodStatus = "normal";
    if (s.moodMean !== null && prev.moodMean !== null) {
      moodTrend = s.moodMean > prev.moodMean ? "↑" : s.moodMean < prev.moodMean ? "↓" : "→";
      moodStatus = s.moodMean < prev.moodMean ? "attention" : "normal";
    }

    var sleepTrend = "→", sleepStatus = "normal";
    if (s.sleepMean !== null && prev.sleepMean !== null) {
      sleepTrend = s.sleepMean > prev.sleepMean ? "↑" : s.sleepMean < prev.sleepMean ? "↓" : "→";
      sleepStatus = s.sleepMean < prev.sleepMean * 0.8 ? "risk" : s.sleepMean < prev.sleepMean ? "attention" : "normal";
    }

    var sosTrend = s.sosTotal > prev.sosTotal ? "↑" : s.sosTotal < prev.sosTotal ? "↓" : "→";
    var sosStatus = s.sosTotal > 0 ? "attention" : "normal";

    var missingStatus = s.missingDays >= 3 ? "risk" : s.missingDays > 0 ? "attention" : "normal";
    var mohStatus = s.mohStreak >= 10 ? "risk" : s.mohStreak >= 5 ? "attention" : "normal";

    return '<div class="ae-grid--summary">' +
           SummaryCard({ title: "Uyku ort.", value: fmtMean(s.sleepMean, 1), unit: "sa", windowDays: windowDays, trend: sleepTrend, status: sleepStatus }) +
           SummaryCard({ title: "Adım ort.", value: fmtMean(s.stepsMean, 0), unit: "adım", windowDays: windowDays, trend: s.stepsMean !== null && prev.stepsMean !== null ? (s.stepsMean > prev.stepsMean ? "↑" : s.stepsMean < prev.stepsMean ? "↓" : "→") : "→", status: "normal" }) +
           SummaryCard({ title: "Su ort.", value: fmtMean(s.waterMean, 1), unit: "bardak", windowDays: windowDays, trend: s.waterMean !== null && prev.waterMean !== null ? (s.waterMean > prev.waterMean ? "↑" : s.waterMean < prev.waterMean ? "↓" : "→") : "→", status: "normal" }) +
           SummaryCard({ title: "SOS yoğ.", value: s.sosTotal, unit: "kayıt", windowDays: windowDays, trend: sosTrend, status: sosStatus }) +
           SummaryCard({ title: "Eksik gün", value: s.missingDays, unit: "gün", windowDays: windowDays, trend: "→", status: missingStatus }) +
           SummaryCard({ title: "MOH gün", value: s.mohStreak, unit: "gün", windowDays: windowDays, trend: "→", status: mohStatus }) +
           "</div>";
  }

  function renderAnomalies(endDate) {
    var anomalies = detectAnomalies(endDate);
    if (!anomalies.length) {
      return AeEmpty({
        icon: "✓",
        title: "Uyarı yok",
        message: "Seçili pencerede dikkat çeken bir durum tespit edilmedi."
      });
    }
    return '<div class="anomaly-list">' +
           '<div class="ae-label">Tespit edilen durumlar</div>' +
           anomalies.map(AnomalyCard).join("") +
           "</div>";
  }

  function renderWindowSelector() {
    var options = [7, 14, 30];
    var buttons = options.map(function(d) {
      var active = ui.trendWindow === d ? " is-active" : "";
      return '<button type="button" class="ae-btn ae-btn--pill' + active + '" onclick="AeonV2.setTrendWindow(' + d + ')">' + d + " gün</button>";
    }).join("");
    return '<div class="window-selector">' +
           '<div class="ae-label">Pencere</div>' +
           '<div class="window-selector__buttons">' + buttons + "</div>" +
           "</div>";
  }

  function setTrendWindow(days) {
    var n = safeNumber(days);
    if (n === null) return;
    ui.trendWindow = Math.max(7, Math.min(30, n === 14 ? 14 : n <= 7 ? 7 : 30));
    render();
  }

  // ── Topbar ──────────────────────────────────────────────────────────────
  function renderTopbar() {
    return '<header class="ae-topbar" role="banner">' +
           '<div class="ae-topbar__brand">' +
           '<span class="ae-topbar__logo">Æ</span>' +
           '<span class="ae-topbar__title">ÆON</span>' +
           "</div>" +
           '<div class="ae-topbar__tools">' +
           AeStatusBadge({ status: syncStatus.status }) +
           AeButton({ label: "↻", variant: "mini", onclick: "AeonV2.refresh()" }) +
           AeButton({ label: "✕", variant: "mini", onclick: "AeonV2.logout()" }) +
           "</div>" +
           "</header>";
  }

  // ── Tabs ──────────────────────────────────────────────────────────────
  function renderTabs() {
    var html = '<div class="ae-tabs" role="tablist" aria-label="Ana sekmeler">';
    TABS.forEach(function(t) {
      var active = t.id === ui.tab ? " is-active" : "";
      html += '<button class="ae-tab' + active + '" ' +
              'id="ae-tab-' + t.id + '" ' +
              'role="tab" ' +
              'aria-selected="' + (t.id === ui.tab ? "true" : "false") + '" ' +
              'aria-controls="ae-panel-' + t.id + '" ' +
              'onclick="AeonV2.setTab(\'' + t.id + '\')">' +
              '<span class="ae-tab__icon" aria-hidden="true">' + escapeHtml(t.icon) + "</span>" +
              '<span class="ae-tab__label">' + escapeHtml(safeText(t.label, 32)) + "</span>" +
              "</button>";
    });
    html += "</div>";
    return html;
  }

  // ── Tab panels ─────────────────────────────────────────────────────────
  function renderToday() {
    var date = todayStr();
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    if (!dayCount) {
      return AeCard({
        children: AeEmpty({
          icon: "◐",
          title: "Genel Bakış",
          message: "Henüz synced veri yok. Veri geldiğinde bugünün sinyal kartları burada görünecek."
        })
      });
    }
    return '<div class="today-view ae-fade-in">' +
           renderDatePicker() +
           renderHeroGrid(date) +
           renderTrendStrip(date) +
           renderQuickNotes(date) +
           "</div>";
  }

  function renderTrends() {
    var date = todayStr();
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    if (!dayCount) {
      return AeCard({
        children: AeEmpty({
          icon: "◑",
          title: "Trendler & Uyarılar",
          message: "Henüz synced veri yok. Veri geldiğinde 7/14/30 günlük özetler ve anomaliler burada görünecek."
        })
      });
    }
    var windowDays = ui.trendWindow || 7;
    return '<div class="trends-view ae-fade-in">' +
           renderWindowSelector() +
           renderSummaryGrid(date, windowDays) +
           renderAnomalies(date) +
           "</div>";
  }

  // ── Day detail ────────────────────────────────────────────────────────
  function DetailSection(opts) {
    opts = opts || {};
    var title = safeText(opts.title || "Bölüm", 40);
    var icon = safeText(opts.icon || "◌", 4);
    var emptyText = safeText(opts.emptyText || "Bu bölümde kayıt yok.", 160);
    var bodyHtml = opts.children && String(opts.children).trim()
      ? '<div class="detail-section__body">' + opts.children + "</div>"
      : '<div class="detail-section__empty">' + escapeHtml(emptyText) + "</div>";
    return AeCard({
      variant: "summary",
      className: "detail-section",
      children: '<div class="detail-section__head">' +
                '<span class="detail-section__icon" aria-hidden="true">' + escapeHtml(icon) + "</span>" +
                '<span class="detail-section__title">' + escapeHtml(title) + "</span>" +
                "</div>" + bodyHtml
    });
  }

  function renderChip(label, redacted) {
    return '<span class="ae-chip ' + (redacted ? "ae-chip--redacted" : "") + '">' +
           escapeHtml(label) +
           (redacted ? ' <span class="ae-chip__hint">redacted</span>' : "") +
           "</span>";
  }

  function renderDayDatePicker(date) {
    var today = isoDate(new Date());
    var label = date === today ? "Bugün" : formatDateLabel(date);
    return '<div class="ae-card ae-card--summary day-date-picker">' +
           AeButton({ label: "◀", variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(-1)" }) +
           '<div class="day-date-picker__display">' +
           '<div class="day-date-picker__label">' + escapeHtml(label) + "</div>" +
           '<div class="day-date-picker__iso">' + escapeHtml(date) + "</div>" +
           "</div>" +
           AeButton({ label: "▶", variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(1)" }) +
           "</div>";
  }

  var DAY_HEAT_COLORS = {
    1: "var(--ae-drop)",
    2: "color-mix(in srgb, var(--ae-drop) 55%, var(--ae-warn))",
    3: "var(--ae-warn)",
    4: "var(--ae-accent)",
    5: "var(--ae-ok)",
    6: "color-mix(in srgb, var(--ae-ok) 60%, var(--ae-accent2))",
    7: "var(--ae-accent2)"
  };

  function renderDayHeatmap(date) {
    var dates = lastNDates(30, date);
    var cells = dates.map(function(d) {
      var day = getDay(d) || {};
      var mood = safeNumber(day.mood && day.mood.value);
      var color = mood ? (DAY_HEAT_COLORS[mood] || "var(--ae-empty-bg)") : "var(--ae-empty-bg)";
      var title = formatDateLabel(d);
      return '<div class="day-heatmap__cell" style="background:' + color + '" title="' + escapeHtml(title) + '">' +
             '<span class="day-heatmap__day">' + escapeHtml(Number(d.split("-")[2]).toString()) + "</span>" +
             "</div>";
    }).join("");
    return '<div class="ae-card ae-card--summary day-heatmap">' +
           '<div class="ae-label">Son 30 gün</div>' +
           '<div class="day-heatmap__grid">' + cells + "</div>" +
           "</div>";
  }

  function renderMoodTherapy(date) {
    var day = getDay(date) || {};
    var chips = [];
    var moodVal = safeNumber(day.mood && day.mood.value);
    if (moodVal) {
      var moodIcon = MOOD_ICONS[moodVal] || "◌";
      var moodLabel = MOOD_LABELS[moodVal] || "Mod";
      chips.push(renderChip(moodIcon + " " + moodLabel, false));
    }
    if (day.journal && day.journal.text) chips.push(renderChip("📝 Günlük", true));
    if (day.note) chips.push(renderChip("📌 Not", true));
    if (day.intention) chips.push(renderChip("🕯 Niyet", true));
    if (day.gratitude) chips.push(renderChip("🙏 Şükür", true));

    var t = day.therapy || {};
    var thoughts = Array.isArray(t.thoughts) ? t.thoughts : [];
    if (thoughts.length) chips.push(renderChip("💭 Düşünce (" + thoughts.length + ")", true));
    if (t.decision) chips.push(renderChip("✓ Karar: " + safeText(t.decision, 40), false));
    if (t.share) chips.push(renderChip("🛡 Terapi paylaşımı", true));
    if (t.breath) chips.push(renderChip("🌬 Nefes", false));
    if (t.dailyWin) chips.push(renderChip("🏆 Günlük kazanım", false));
    if (t.selfCompassion) chips.push(renderChip("💖 Kendi şefkati", false));
    if (t.firstStep) chips.push(renderChip("👣 İlk adım", false));

    return DetailSection({
      id: "mood-therapy",
      title: "Ruh hali & Terapi",
      icon: "🌤",
      emptyText: "Bu gün için mod veya terapi kaydı yok.",
      children: chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : ""
    });
  }

  function renderNutrition(date) {
    var n = (getDay(date) || {}).nutrition || {};
    var chips = [];
    var meals = Array.isArray(n.meals) ? n.meals : [];
    if (meals.length) chips.push(renderChip("🍽 Öğün: " + meals.length, false));
    var water = safeNumber(n.waterGlasses);
    if (water !== null) chips.push(renderChip("💧 Su: " + water + " bardak", false));
    if (n.caffeine) chips.push(renderChip("☕ Kafein", false));
    var items = Array.isArray(n.mealItems) ? n.mealItems : [];
    if (items.length) chips.push(renderChip("🥗 Makro özeti (" + items.length + ")", true));
    return DetailSection({
      id: "nutrition",
      title: "Beslenme & Öğün",
      icon: "🍽",
      emptyText: "Beslenme kaydı girilmemiş.",
      children: chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : ""
    });
  }

  function renderPrayer(date) {
    var day = getDay(date) || {};
    var chips = [];
    var p = day.prayer || {};
    var vakitNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    var done = vakitNames.filter(function(k) { return !!p[k]; }).length;
    if (done > 0 || p.fajr != null || p.dhuhr != null || p.asr != null || p.maghrib != null || p.isha != null) {
      chips.push(renderChip("🕌 Namaz: " + done + "/5", false));
    }
    var z = day.zikr || {};
    var zCount = safeNumber(z.count);
    if (zCount !== null || z.dhikr || z.name) {
      var zLabel = "📿 Zikir" + (zCount !== null ? ": " + zCount.toLocaleString("tr-TR") : "");
      chips.push(renderChip(zLabel, false));
    }
    var s = day.saygi || {};
    if (s.personName) {
      chips.push(renderChip("🌟 Öncü: " + safeText(s.personName, 40), false));
      if (s.read) chips.push(renderChip("✓ Okundu", false));
    }
    var q = day.quranJourney || {};
    if (q.requests || q.verseRef || q.surah || q.page) {
      chips.push(renderChip("📖 Kur'an yolculuğu", false));
    }
    return DetailSection({
      id: "prayer",
      title: "İbadet & Saygı",
      icon: "🕌",
      emptyText: "Namaz, zikir veya Saygı kaydı yok.",
      children: chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : ""
    });
  }

  function renderMovement(date) {
    var day = getDay(date) || {};
    var h = day.health || {};
    var m = day.movement || {};
    var loc = day.location || {};
    var chips = [];
    var steps = safeNumber(h.steps);
    if (steps !== null) chips.push(renderChip("👟 Adım: " + steps.toLocaleString("tr-TR"), false));
    var walk = formatHours(m.walkDuration);
    if (walk) chips.push(renderChip("🚶 Yürüyüş: " + walk, false));
    var dist = safeNumber(m.distanceKm);
    if (dist !== null) chips.push(renderChip("📍 Mesafe: " + dist.toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " km", false));
    var segs = Array.isArray(loc.segments) ? loc.segments : [];
    var cats = [];
    segs.forEach(function(seg) {
      if (seg && seg.category && cats.indexOf(seg.category) === -1) cats.push(seg.category);
    });
    if (cats.length) chips.push(renderChip("🗺 Konum: " + cats.join(", "), false));
    return DetailSection({
      id: "movement",
      title: "Hareket & Konum",
      icon: "👟",
      emptyText: "Hareket ve konum özeti yok.",
      children: chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : ""
    });
  }

  function renderContent(date) {
    var day = getDay(date) || {};
    var chips = [];
    var media = day.media || {};
    function count(v) {
      if (Array.isArray(v)) return v.length;
      return isObject(v) ? 1 : 0;
    }
    var reading = count(media.reading || day.reading);
    var watching = count(media.watching || day.watching);
    var listening = count(media.listening || day.listening);
    var quotes = count(day.quotes);
    if (reading) chips.push(renderChip("📖 Okuma: " + reading, false));
    if (watching) chips.push(renderChip("🎬 İzleme: " + watching, false));
    if (listening) chips.push(renderChip("🎧 Dinleme: " + listening, false));
    if (quotes) chips.push(renderChip("✍️ Alıntı: " + quotes, true));
    return DetailSection({
      id: "content",
      title: "İçerik",
      icon: "📖",
      emptyText: "Okuma, izleme veya dinleme kaydı yok.",
      children: chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : ""
    });
  }

  function renderDay() {
    var date = todayStr();
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    if (!dayCount) {
      return AeCard({
        children: AeEmpty({
          icon: "◎",
          title: "Gün Detayı",
          message: "Henüz synced veri yok. Veri geldiğinde seçili gün burada görünecek."
        })
      });
    }
    var day = getDay(date);
    var emptyDay = !day ? AeCard({
      children: AeEmpty({
        icon: "◎",
        title: "Boş gün",
        message: "Bu tarihe ait kayıt yok. Takvimden başka bir gün seçebilirsin."
      })
    }) : "";
    return '<div class="day-view ae-fade-in">' +
           renderDayDatePicker(date) +
           renderDayHeatmap(date) +
           (day ? renderMoodTherapy(date) : "") +
           (day ? renderNutrition(date) : "") +
           (day ? renderPrayer(date) : "") +
           (day ? renderMovement(date) : "") +
           (day ? renderContent(date) : "") +
           emptyDay +
           "</div>";
  }

  function renderArchives() {
    return AeCard({
      children: AeEmpty({
        icon: "◈",
        title: "Arşivler",
        message: "İçerik, ibadet ve profil arşivleri Faz 5'te listelenecek."
      })
    });
  }

  function renderSystem() {
    return AeCard({
      children: AeEmpty({
        icon: "◉",
        title: "Sistem & Mesajlar",
        message: "Senkron durumu, audit, inbox/outbox ve yoğunluk seçici Faz 6'da burada olacak."
      })
    });
  }

  function renderActiveTab() {
    var panels = {
      today: renderToday,
      trends: renderTrends,
      day: renderDay,
      archives: renderArchives,
      system: renderSystem
    };
    var fn = panels[ui.tab] || renderToday;
    return '<div class="ae-panel ae-fade-in" id="ae-panel-' + ui.tab + '" role="tabpanel" aria-labelledby="ae-tab-' + ui.tab + '">' +
           fn() +
           "</div>";
  }

  // ── Main render ────────────────────────────────────────────────────────
  function render() {
    var app = root.document && root.document.getElementById("app");
    if (!app) return;
    var projection = projectData(null);
    app.innerHTML =
      renderTopbar() +
      renderTabs() +
      '<main class="ae-app__body">' + renderActiveTab() + "</main>" +
      '<div style="display:none" id="ae-projection-meta" data-day-count="' + projection.dayCount + '"></div>';
  }

  function setTab(id) {
    if (!id || !TABS.some(function(t) { return t.id === id; })) return;
    ui.tab = id;
    render();
  }

  function refresh() {
    syncStatus.status = "saving";
    render();
    setTimeout(function() {
      syncStatus.status = "accepted";
      render();
    }, 400);
  }

  function logout() {
    syncStatus.status = "idle";
    ui.tab = "today";
    render();
  }

  function updateStatus(s) {
    if (s && typeof s === "object") syncStatus = s;
    render();
  }

  function init() {
    var rootEl = root.document && root.document.getElementById("root");
    if (rootEl && ui.theme) rootEl.setAttribute("data-theme", ui.theme);
    render();
  }

  root.AeonV2 = {
    ui: ui,
    TABS: TABS,
    syncStatus: syncStatus,
    projectData: projectData,
    render: render,
    setTab: setTab,
    setDate: setDate,
    setData: setData,
    shiftDate: shiftDate,
    goToDayDetail: goToDayDetail,
    setTrendWindow: setTrendWindow,
    refresh: refresh,
    logout: logout,
    updateStatus: updateStatus,
    init: init
  };
})(typeof window !== "undefined" ? window : this);
