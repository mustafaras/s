// ÆON Observer Dashboard v2 — IIFE skeleton
// Mevcut panel.js'ten bağımsız yeni panel runtime'ı.
(function(root){
  "use strict";

  var TABS = [
    { id: "today",    label: "Genel Bakış" },
    { id: "trends",   label: "Trendler" },
    { id: "day",      label: "Gün Detayı" },
    { id: "archives", label: "Arşivler" },
    { id: "system",   label: "Sistem" }
  ];

  var ui = {
    tab: "today",
    subTab: null,
    date: isoDate(new Date()),
    density: "comfortable",
    theme: "dark"
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

  // ── Render ────────────────────────────────────────────────────────────
  function renderTabs() {
    var html = '<div class="ae-tabs" role="tablist" aria-label="Ana sekmeler">';
    TABS.forEach(function(t) {
      var active = t.id === ui.tab ? " is-active" : "";
      html += '<button class="ae-tab' + active + '" ' +
              'role="tab" aria-selected="' + (t.id === ui.tab ? "true" : "false") + '" ' +
              'onclick="AeonV2.setTab(\'' + t.id + '\')">' + safeText(t.label, 32) + "</button>";
    });
    html += "</div>";
    return html;
  }

  function renderPlaceholder(tabId) {
    var titles = {
      today: "Genel Bakış",
      trends: "Trendler & Uyarılar",
      day: "Gün Detayı",
      archives: "Arşivler",
      system: "Sistem & Mesajlar"
    };
    return '<div class="ae-card ae-fade-in">' +
           '<div class="ae-empty">' +
           '<div class="ae-empty__icon">🦩</div>' +
           '<div class="ae-empty__title">' + safeText(titles[tabId] || tabId, 80) + "</div>" +
           '<div class="ae-empty__text">Bu sekme henüz inşa edilmedi. Faz 1\'de aktif hale gelecek.</div>' +
           "</div></div>";
  }

  function render() {
    var app = root.document && root.document.getElementById("app");
    if (!app) return;
    var projection = projectData(null);
    var html = renderTabs();
    html += '<div class="ae-app__body">' + renderPlaceholder(ui.tab) + "</div>";
    html += '<div style="display:none" id="ae-projection-meta" data-day-count="' + projection.dayCount + '"></div>';
    app.innerHTML = html;
  }

  function setTab(id) {
    if (!id || !TABS.some(function(t) { return t.id === id; })) return;
    ui.tab = id;
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
    projectData: projectData,
    render: render,
    setTab: setTab,
    init: init
  };
})(typeof window !== "undefined" ? window : this);
