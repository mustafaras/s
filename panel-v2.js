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
    var cls = classNames(["ae-card", "ae-fade-in", opts.variant ? "ae-card--" + opts.variant : ""]);
    return '<div class="' + cls + '">' + (opts.children || "") + "</div>";
  }

  function AeButton(opts) {
    opts = opts || {};
    var cls = classNames(["ae-btn", opts.variant ? "ae-btn--" + opts.variant : "", opts.className]);
    var label = safeText(opts.label, 80);
    var attrs = opts.onclick ? ' onclick="' + escapeHtml(opts.onclick) + '"' : "";
    return '<button type="button" class="' + cls + '"' + attrs + '>' + escapeHtml(label) + "</button>";
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

  function goToDayDetail() {
    ui.tab = "day";
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
    return AeCard({
      children: AeEmpty({
        icon: "◑",
        title: "Trendler & Uyarılar",
        message: "7/14/30 günlük özet kartlar ve anomali listesi Faz 3'te aktif olacak."
      })
    });
  }

  function renderDay() {
    return AeCard({
      children: AeEmpty({
        icon: "◎",
        title: "Gün Detayı",
        message: "Seçili günün ruh hali, beslenme, ibadet ve hareket özetleri Faz 4'te eklenecek."
      })
    });
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
    refresh: refresh,
    logout: logout,
    updateStatus: updateStatus,
    init: init
  };
})(typeof window !== "undefined" ? window : this);
