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

  function isoDate(d) {
    if (!d || isNaN(d.getTime())) d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function safeText(v, max) {
    var s = typeof v === "string" ? v : "";
    max = max || 240;
    return s.length <= max ? s : s.slice(0, max) + "…";
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
    return AeCard({
      children: AeEmpty({
        icon: "◐",
        title: "Genel Bakış",
        message: "Bugünün sinyalleri, 7 günlük trend strip ve hızlı notlar Faz 2'de buraya yerleşecek."
      })
    });
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
    refresh: refresh,
    logout: logout,
    updateStatus: updateStatus,
    init: init
  };
})(typeof window !== "undefined" ? window : this);
