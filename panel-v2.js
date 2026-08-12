// ÆON Observer Dashboard v2 — IIFE runtime
// Mevcut panel.js'ten bağımsız yeni panel runtime'ı.
(function(root){
  "use strict";

  var TABS = [
    { id: "today",    label: "Genel Bakış", icon: "dashboard" },
    { id: "trends",   label: "Trendler",    icon: "trend" },
    { id: "day",      label: "Gün Detayı",  icon: "calendar" },
    { id: "archives", label: "Arşivler",    icon: "archive" },
    { id: "system",   label: "Sistem",      icon: "settings" }
  ];
  var SYSTEM_SUB_TABS = [
    { id: "status", label: "Durum" },
    { id: "events", label: "Olaylar" },
    { id: "audit", label: "Denetim" },
    { id: "messages", label: "Mesajlar" },
    { id: "settings", label: "Ayarlar" }
  ];

  var PTKEY = "seyma-panel-token";
  var PANEL_SETTINGS_KEY = "seyma-panel-settings-v1";
  var APPKEY = "seyma-reset-v1";
  var REPO = "mustafaras/seyma-data";
  var BRANCH = "main";
  var OBSERVER_INBOX_PATH = "data/observer-inbox.json";
  var OBSERVER_MESSAGE_MAX = 200;
  var PANEL_VERSION = "2.0";
  var PANEL_BUILD_DATE = "2026-08-11";
  var PANEL_SOURCE_COMMIT = "8542b66";
  var FETCH_TIMEOUT_MS = 20000;
  var POLLING_OPTIONS = [
    { value: 30000, label: "30 sn" },
    { value: 60000, label: "60 sn" },
    { value: 300000, label: "5 dk" },
    { value: 0, label: "Kapalı" }
  ];

  var EVENT_SECTION_OPTIONS = [
    { value: "wellness", label: "Wellness" },
    { value: "mood", label: "Ruh hali" },
    { value: "sleep", label: "Uyku" },
    { value: "nutrition", label: "Beslenme" },
    { value: "content", label: "İçerik" },
    { value: "therapy", label: "Terapi" },
    { value: "profile", label: "Profil" },
    { value: "notifications", label: "Bildirimler" },
    { value: "location", label: "Konum" },
    { value: "settings", label: "Ayarlar" },
    { value: "quran", label: "Kur'an" },
    { value: "faith", label: "İman" },
    { value: "sync", label: "Senkron" },
    { value: "system", label: "Sistem" },
    { value: "unknown", label: "Diğer" }
  ];
  var EVENT_SECTION_ICONS = {
    wellness: "leaf", mood: "mood", sleep: "sleep", nutrition: "nutrition", content: "book",
    therapy: "reflection", profile: "shield", notifications: "messages", location: "location",
    settings: "settings", quran: "book", faith: "prayer", sync: "refresh", system: "settings", unknown: "dot"
  };
  var EVENT_OPERATION_OPTIONS = [
    { value: "create", label: "Oluştur" },
    { value: "update", label: "Güncelle" },
    { value: "delete", label: "Sil" },
    { value: "complete", label: "Tamamla" },
    { value: "record", label: "Kaydet" },
    { value: "accepted", label: "Kabul" },
    { value: "retry", label: "Yeniden dene" },
    { value: "merge", label: "Birleştir" },
    { value: "sync_submitted", label: "Senkron gönderildi" }
  ];
  var EVENT_OPERATION_LABELS = EVENT_OPERATION_OPTIONS.reduce(function(out, item) {
    out[item.value] = item.label;
    return out;
  }, {});

  var ui = {
    tab: "today",
    subTab: null,
    systemSubTab: "status",
    date: isoDate(new Date()),
    trendWindow: 7,
    density: "comfortable",
    theme: "dark",
    panelToken: "",
    systemSubTabTransition: false,
    archiveSearch: "",
    archiveStatus: "all",
    archiveKind: "all",
    archiveFrom: "",
    archiveTo: "",
    archiveView: "list",
    archivePage: 1,
    historyWindow: 7,
    historySource: "all",
    historyDay: "all",
    historyExpanded: {},
    eventSection: "all",
    eventOperation: "all",
    eventFrom: "",
    eventTo: "",
    eventLimit: 20,
    eventPage: 1,
    selectedEventId: "",
    selectedNotificationId: "",
    messageDraft: "",
    messageSending: false
  };

  var syncStatus = {
    status: "idle",
    lastErrorCode: null,
    snapshotRevision: null,
    sourceUpdatedAt: null,
    etag: null,
    lastSyncedAt: null,
    notModifiedCount: 0,
    apiLimitRemaining: null,
    apiLimitTotal: null,
    apiLimitResetAt: null,
    apiRateLimitRemaining: null,
    apiRateLimitReset: null,
    p50LatencyMs: null,
    p95LatencyMs: null,
    lastFetchDurationMs: null,
    totalFetchCount: 0,
    errorCount: 0,
    consecutiveErrors: 0,
    lastSuccessAt: null,
    lastErrorAt: null,
    requestHistory: [],
    errorHistory: [],
    dataAgeMinutes: null,
    pollingIntervalMs: 60000,
    _latencyWindow: [],
    tokenExpiresAt: null,
    tokenIssuedAt: null
  };

  var appData = null;
  var isFetching = false;
  var toastState = {
    visible: false,
    id: 0,
    message: "",
    type: "info",
    duration: 4200
  };
  var swipeBinding = {
    element: null,
    handlers: null
  };
  var performanceState = {
    resizeHandled: 0,
    scrollHandled: 0,
    lastScrollTop: 0,
    lastResizeAt: null,
    mapScheduleCount: 0,
    mapInitCount: 0,
    mapAssetLoadCount: 0,
    scrollTargetBound: false,
    rootListenersBound: false
  };
  var performanceBinding = {
    resize: null,
    scroll: null,
    scrollElement: null
  };
  var mapState = {
    observer: null,
    leafletPromise: null,
    leafletStatus: "idle"
  };
  var archivePageCache = {
    key: "",
    dataRef: null,
    subTab: "",
    page: 1,
    items: [],
    total: 0,
    sourceTotal: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false
  };
  var pullRefresh = {
    mode: "idle",
    distance: 0,
    refreshing: false
  };
  var pollingState = {
    intervalId: null,
    intervalMs: 60000,
    activeIntervalMs: null,
    autoRefresh: true,
    isPaused: false,
    lastRunAt: null
  };
  var diagnosticState = {
    running: false,
    action: "",
    status: "idle",
    detail: "",
    at: null
  };
  var accessibilityState = {
    keyboardBound: false,
    liveMessage: "",
    lastFocusKey: "",
    pendingFocusId: "",
    pendingFocusKey: "",
    trapElement: null,
    trapRestoreKey: ""
  };
  var PULL_REFRESH_THRESHOLD = 60;
  var PULL_REFRESH_MAX_DISTANCE = 112;

  function announce(message) {
    var text = safeText(message || "", 240);
    if (!text) return;
    accessibilityState.liveMessage = text;
    var doc = root.document;
    var live = doc && typeof doc.getElementById === "function" ? doc.getElementById("ae-live-region") : null;
    if (live) {
      if (typeof live.textContent === "string") live.textContent = text;
      else if (typeof live.innerText === "string") live.innerText = text;
    }
  }

  function getAttribute(el, name) {
    if (!el || typeof el.getAttribute !== "function") return "";
    return el.getAttribute(name) || "";
  }

  function focusKeyForElement(el) {
    if (!el) return "";
    if (el.id) return "id:" + String(el.id);
    var keys = ["data-focus-key", "data-tab", "data-subtab-id", "data-event-id", "data-notification-id"];
    for (var i = 0; i < keys.length; i++) {
      var value = getAttribute(el, keys[i]);
      if (value) return keys[i] + ":" + value;
    }
    var aria = getAttribute(el, "aria-label");
    return aria ? "aria-label:" + aria : "";
  }

  function rememberFocus() {
    var doc = root.document;
    var active = doc && doc.activeElement;
    var key = focusKeyForElement(active);
    if (key) accessibilityState.lastFocusKey = key;
    return key;
  }

  function requestFocus(id, key) {
    accessibilityState.pendingFocusId = id ? String(id) : "";
    accessibilityState.pendingFocusKey = key ? String(key) : "";
  }

  function contains(parent, child) {
    if (!parent || !child) return false;
    if (parent === child) return true;
    return typeof parent.contains === "function" ? parent.contains(child) : false;
  }

  function findFocusTarget(id, key) {
    var doc = root.document;
    if (!doc) return null;
    if (id && typeof doc.getElementById === "function") {
      var byId = doc.getElementById(id);
      if (byId) return byId;
    }
    if (!key || typeof doc.querySelectorAll !== "function") return null;
    var nodes;
    try {
      nodes = doc.querySelectorAll("button, a, input, select, textarea, summary, [tabindex]");
    } catch (e) {
      return null;
    }
    for (var i = 0; i < nodes.length; i++) {
      if (focusKeyForElement(nodes[i]) === key) return nodes[i];
    }
    return null;
  }

  function focusElement(el) {
    if (!el || typeof el.focus !== "function") return false;
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (ignore) {} }
    return true;
  }

  function focusableWithin(container) {
    if (!container || typeof container.querySelectorAll !== "function") return [];
    var nodes;
    try {
      nodes = container.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex=\"-1\"])");
    } catch (e) {
      return [];
    }
    return Array.prototype.slice.call(nodes).filter(function(node) {
      return !node.hidden && getAttribute(node, "aria-hidden") !== "true";
    });
  }

  function findFocusTrap() {
    var doc = root.document;
    if (!doc || typeof doc.querySelector !== "function") return null;
    try {
      return doc.querySelector('[data-focus-trap="true"], [role="dialog"][aria-modal="true"]');
    } catch (e) {
      return null;
    }
  }

  function restoreFocusAfterRender() {
    var trap = findFocusTrap();
    if (trap) {
      if (accessibilityState.trapElement !== trap) {
        accessibilityState.trapElement = trap;
        var first = focusableWithin(trap)[0];
        focusElement(first || trap);
      }
      accessibilityState.pendingFocusId = "";
      accessibilityState.pendingFocusKey = "";
      return;
    }
    if (accessibilityState.trapElement) {
      var restore = findFocusTarget("", accessibilityState.trapRestoreKey);
      accessibilityState.trapElement = null;
      accessibilityState.trapRestoreKey = "";
      if (restore) focusElement(restore);
    }
    var target = findFocusTarget(accessibilityState.pendingFocusId, accessibilityState.pendingFocusKey || accessibilityState.lastFocusKey);
    if (target) focusElement(target);
    accessibilityState.pendingFocusId = "";
    accessibilityState.pendingFocusKey = "";
  }

  function focusTrapKeydown(event) {
    var trap = accessibilityState.trapElement;
    if (!trap || !event) return false;
    var key = event.key || event.code;
    if (key === "Escape") {
      if (ui.selectedEventId) {
        selectEvent("");
      } else {
        accessibilityState.trapElement = null;
        render();
      }
      if (typeof event.preventDefault === "function") event.preventDefault();
      return true;
    }
    if (key !== "Tab") return false;
    var items = focusableWithin(trap);
    if (!items.length) {
      if (typeof event.preventDefault === "function") event.preventDefault();
      focusElement(trap);
      return true;
    }
    var active = root.document && root.document.activeElement;
    var index = items.indexOf(active);
    if (index === -1) index = event.shiftKey ? 0 : items.length - 1;
    var next = event.shiftKey ? (index - 1 + items.length) % items.length : (index + 1) % items.length;
    if (typeof event.preventDefault === "function") event.preventDefault();
    focusElement(items[next]);
    return true;
  }

  function closestRole(el, role) {
    var node = el;
    while (node) {
      if (getAttribute(node, "role") === role) return node;
      node = node.parentElement;
    }
    return null;
  }

  function tabItems(tablist) {
    if (!tablist || typeof tablist.querySelectorAll !== "function") return [];
    return Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  }

  function activateKeyboardTab(target, tablist, index) {
    var items = tabItems(tablist);
    var next = items[index];
    if (!next) return false;
    var tabId = getAttribute(next, "data-tab");
    var subTabId = getAttribute(next, "data-subtab-id");
    var scope = getAttribute(next, "data-a11y-scope");
    if (tabId) {
      setTab(tabId);
    } else if (scope === "system") {
      setSystemSubTab(subTabId);
    } else if (subTabId) {
      setArchiveSubTab(subTabId);
    }
    return true;
  }

  function handleKeyboardNavigation(event) {
    if (!event) return false;
    if (accessibilityState.trapElement && focusTrapKeydown(event)) return true;
    var key = event.key || event.code;
    if (key === "Escape" && (ui.selectedEventId || ui.selectedNotificationId)) {
      if (ui.selectedEventId) selectEvent("");
      else {
        ui.selectedNotificationId = "";
        announce("Bildirim detayı kapatıldı.");
        render();
      }
      if (typeof event.preventDefault === "function") event.preventDefault();
      return true;
    }
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].indexOf(key) === -1) return false;
    var target = event.target;
    if (getAttribute(target, "role") !== "tab") return false;
    var tablist = closestRole(target, "tablist");
    var items = tabItems(tablist);
    var current = items.indexOf(target);
    if (!items.length || current < 0) return false;
    var next = current;
    if (key === "Home") next = 0;
    else if (key === "End") next = items.length - 1;
    else if (key === "ArrowRight" || key === "ArrowDown") next = (current + 1) % items.length;
    else if (key === "ArrowLeft" || key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    if (typeof event.preventDefault === "function") event.preventDefault();
    return activateKeyboardTab(target, tablist, next);
  }

  function bindKeyboardNavigation() {
    var doc = root.document;
    if (!doc || typeof doc.addEventListener !== "function" || accessibilityState.keyboardBound) return;
    doc.addEventListener("keydown", handleKeyboardNavigation);
    accessibilityState.keyboardBound = true;
  }

  // Scroll/resize olayları render döngüsünü tetiklemez; yalnızca pahalı işi
  // kontrollü aralıklarla çalıştırır. Bu, küçük ekranlarda ardışık touch ve
  // viewport olaylarının harita/ölçüm işini yığmasını önler.
  function throttle(fn, wait) {
    var last = 0;
    var timer = null;
    var lastArgs = null;
    var lastThis = null;
    function invoke() {
      last = Date.now();
      timer = null;
      if (lastArgs) {
        fn.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }
    function wrapped() {
      lastArgs = arguments;
      lastThis = this;
      var remaining = Math.max(0, (wait || 0) - (Date.now() - last));
      if (!timer && remaining === 0) {
        invoke();
      } else if (!timer && typeof root.setTimeout === "function") {
        timer = root.setTimeout(invoke, remaining || wait || 1);
      }
    }
    wrapped.cancel = function() {
      if (timer !== null && typeof root.clearTimeout === "function") root.clearTimeout(timer);
      timer = null;
      lastArgs = null;
      lastThis = null;
    };
    return wrapped;
  }

  function debounce(fn, wait) {
    var timer = null;
    function wrapped() {
      var args = arguments;
      var context = this;
      if (timer !== null && typeof root.clearTimeout === "function") root.clearTimeout(timer);
      if (typeof root.setTimeout !== "function") {
        fn.apply(context, args);
        return;
      }
      timer = root.setTimeout(function() {
        timer = null;
        fn.apply(context, args);
      }, wait || 0);
    }
    wrapped.cancel = function() {
      if (timer !== null && typeof root.clearTimeout === "function") root.clearTimeout(timer);
      timer = null;
    };
    return wrapped;
  }

  function currentScrollTop(event) {
    var target = event && event.target;
    var values = [target && target.scrollTop, root.scrollY, root.pageYOffset];
    var doc = root.document;
    if (doc && doc.documentElement) values.push(doc.documentElement.scrollTop);
    if (doc && doc.body) values.push(doc.body.scrollTop);
    for (var i = 0; i < values.length; i++) {
      var value = safeNumber(values[i]);
      if (value !== null) return Math.max(0, value);
    }
    return 0;
  }

  function handlePerformanceScroll(event) {
    performanceState.scrollHandled++;
    performanceState.lastScrollTop = currentScrollTop(event);
  }

  function invalidateMapSizes() {
    var doc = root.document;
    if (!doc || typeof doc.querySelectorAll !== "function") return;
    var update = function() {
      var containers = doc.querySelectorAll(".loc-map");
      containers.forEach(function(el) {
        var map = el && el._leaflet_map;
        if (map && typeof map.invalidateSize === "function") map.invalidateSize({ pan: false });
      });
    };
    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(update);
    else update();
  }

  function handlePerformanceResize() {
    performanceState.resizeHandled++;
    performanceState.lastResizeAt = new Date().toISOString();
    invalidateMapSizes();
    scheduleMapInitialization();
  }

  function bindPerformanceScrollTarget(app) {
    var next = null;
    if (app && typeof app.querySelector === "function") next = app.querySelector(".ae-app__body");
    if (next === performanceBinding.scrollElement) return;
    if (performanceBinding.scrollElement && typeof performanceBinding.scrollElement.removeEventListener === "function" && performanceBinding.scroll) {
      performanceBinding.scrollElement.removeEventListener("scroll", performanceBinding.scroll);
    }
    performanceBinding.scrollElement = next;
    performanceState.scrollTargetBound = false;
    if (next && typeof next.addEventListener === "function" && performanceBinding.scroll) {
      next.addEventListener("scroll", performanceBinding.scroll, { passive: true });
      performanceState.scrollTargetBound = true;
    }
  }

  function bindPerformanceListeners() {
    if (performanceState.rootListenersBound) return;
    if (!root || typeof root.addEventListener !== "function") return;
    performanceBinding.resize = debounce(handlePerformanceResize, 160);
    performanceBinding.scroll = throttle(handlePerformanceScroll, 80);
    root.addEventListener("resize", performanceBinding.resize, { passive: true });
    root.addEventListener("scroll", performanceBinding.scroll, { passive: true });
    performanceState.rootListenersBound = true;
  }

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

  function updateLatencyTelemetry(durationMs) {
    var duration = safeNumber(durationMs);
    if (duration === null || duration < 0) return;
    var window = Array.isArray(syncStatus._latencyWindow) ? syncStatus._latencyWindow.slice() : [];
    window.push(Math.round(duration));
    if (window.length > 20) window.shift();
    syncStatus._latencyWindow = window;
    var sorted = window.slice().sort(function(a, b) { return a - b; });
    if (!sorted.length) {
      syncStatus.p50LatencyMs = null;
      syncStatus.p95LatencyMs = null;
      return;
    }
    var percentile = function(p) {
      return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1))];
    };
    syncStatus.p50LatencyMs = percentile(0.5);
    syncStatus.p95LatencyMs = percentile(0.95);
  }

  function recordFetchTelemetry(durationMs, success, meta) {
    var duration = safeNumber(durationMs);
    meta = meta || {};
    var completedAt = new Date().toISOString();
    syncStatus.lastFetchDurationMs = duration === null ? null : Math.max(0, Math.round(duration));
    syncStatus.totalFetchCount = Math.max(0, Number(syncStatus.totalFetchCount) || 0) + 1;
    if (duration !== null) updateLatencyTelemetry(duration);
    var requests = Array.isArray(syncStatus.requestHistory) ? syncStatus.requestHistory.slice() : [];
    requests.push({
      at: completedAt,
      durationMs: duration === null ? null : Math.max(0, Math.round(duration)),
      success: !!success,
      status: safeNumber(meta.status)
    });
    syncStatus.requestHistory = requests.slice(-1440);
    if (success) {
      syncStatus.consecutiveErrors = 0;
      syncStatus.lastSuccessAt = new Date().toISOString();
    } else {
      syncStatus.errorCount = Math.max(0, Number(syncStatus.errorCount) || 0) + 1;
      syncStatus.consecutiveErrors = Math.max(0, Number(syncStatus.consecutiveErrors) || 0) + 1;
      syncStatus.lastErrorAt = completedAt;
      var errors = Array.isArray(syncStatus.errorHistory) ? syncStatus.errorHistory.slice() : [];
      errors.push({
        at: completedAt,
        code: safeText(meta.code || "request_failed", 40),
        status: safeNumber(meta.status)
      });
      syncStatus.errorHistory = errors.slice(-50);
    }
  }

  function requestHistory24h(nowMs) {
    var now = safeNumber(nowMs);
    if (now === null) now = Date.now();
    var cutoff = now - (24 * 60 * 60 * 1000);
    var sums = [], counts = [];
    for (var i = 0; i < 24; i += 1) { sums.push(0); counts.push(0); }
    (Array.isArray(syncStatus.requestHistory) ? syncStatus.requestHistory : []).forEach(function(item) {
      var at = new Date(item && item.at).getTime();
      var duration = safeNumber(item && item.durationMs);
      if (!isFinite(at) || at < cutoff || at > now || duration === null) return;
      var bucket = Math.min(23, Math.max(0, Math.floor((at - cutoff) / (60 * 60 * 1000))));
      sums[bucket] += Math.max(0, duration);
      counts[bucket] += 1;
    });
    return sums.map(function(sum, index) { return counts[index] ? Math.round(sum / counts[index]) : null; });
  }

  function requestCount24h(nowMs) {
    var now = safeNumber(nowMs);
    if (now === null) now = Date.now();
    var cutoff = now - (24 * 60 * 60 * 1000);
    return (Array.isArray(syncStatus.requestHistory) ? syncStatus.requestHistory : []).filter(function(item) {
      var at = new Date(item && item.at).getTime();
      return isFinite(at) && at >= cutoff && at <= now;
    }).length;
  }

  function syncErrorRatePercent(status) {
    status = status || syncStatus;
    var total = Math.max(0, Number(status.totalFetchCount) || 0);
    var errors = Math.max(0, Number(status.errorCount) || 0);
    if (!total) return null;
    return Math.min(100, Math.round((errors / total) * 1000) / 10);
  }

  function syncErrorRateLabel(status) {
    var rate = syncErrorRatePercent(status);
    return rate === null ? "—" : rate.toFixed(1).replace(".", ",") + "%";
  }

  function syncHealthInfo(status) {
    status = status || {};
    var code = String(status.status || "idle");
    if (code === "accepted" && !(Number(status.consecutiveErrors) > 0)) return { label: "Sağlıklı", tone: "ok", meta: "Senkron kabul edildi" };
    if (["error", "unauthorized", "forbidden", "not_found", "rate_limited"].indexOf(code) !== -1 || Number(status.consecutiveErrors) >= 3) {
      return { label: "Kritik", tone: "drop", meta: code };
    }
    if (Number(status.errorCount) > 0 || Number(status.consecutiveErrors) > 0 || code === "saving" || code === "loading" || code === "retrying") {
      return { label: "Uyarı", tone: "warn", meta: code };
    }
    return { label: "Bekliyor", tone: "muted", meta: ui.panelToken ? "İlk kontrol bekleniyor" : "Token ayarlanmadı" };
  }

  function dataAgeMinutes(ts, nowMs) {
    if (!ts) return null;
    var thenMs = new Date(ts).getTime();
    if (!isFinite(thenMs)) return null;
    var now = safeNumber(nowMs);
    if (now === null) now = Date.now();
    return Math.max(0, Math.floor((now - thenMs) / 60000));
  }

  function dataFreshnessLabel(ts) {
    var age = dataAgeMinutes(ts);
    syncStatus.dataAgeMinutes = age;
    if (age === null) return "Henüz senkron yok";
    if (age < 1) return "Az önce";
    return age + " dk önce";
  }

  function numberOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === "") return null;
    return safeNumber(v);
  }

  function formatHours(h) {
    var n = safeNumber(h);
    if (n === null || n <= 0) return null;
    var hInt = Math.floor(n), min = Math.round((n - hInt) * 60);
    return min ? hInt + "sa " + min + "dk" : hInt + "sa";
  }

  function countNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    return safeNumber(value);
  }

  function formatCountValue(value, format) {
    var n = countNumber(value);
    if (n === null) return "—";
    format = format || "number";
    if (format === "hours") return formatHours(n) || "0sa";
    if (format === "mood") return Math.round(n) + "/7";
    if (format === "integer") return Math.round(n).toLocaleString("tr-TR");
    if (format === "decimal") {
      return n.toLocaleString("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
    }
    return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  }

  function countTargetAttrs(value, format) {
    var n = countNumber(value);
    if (n === null) return "";
    return ' data-count-target="' + escapeHtml(n) + '" data-count-format="' +
           escapeHtml(format || "number") + '"';
  }

  function prefersReducedMotion() {
    try {
      return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {
      return false;
    }
  }

  function setCountText(element, value) {
    if (!element) return;
    var format = element.getAttribute ? element.getAttribute("data-count-format") : "number";
    var text = formatCountValue(value, format);
    if ("textContent" in element) element.textContent = text;
    else if ("innerText" in element) element.innerText = text;
  }

  function animateCountUp(element, targetValue, duration) {
    var target = countNumber(targetValue);
    if (!element || target === null) return;

    var durationValue = countNumber(duration);
    var durationMs = durationValue === null ? 650 : Math.max(0, Math.min(2000, durationValue));
    var previous = element.getAttribute ? countNumber(element.getAttribute("data-count-value")) : null;
    var startValue = previous === null ? 0 : previous;
    if (element.__aeCountAnimation && root.cancelAnimationFrame) {
      root.cancelAnimationFrame(element.__aeCountAnimation);
    }
    if (element.setAttribute) element.setAttribute("data-count-value", String(target));

    if (prefersReducedMotion() || typeof root.requestAnimationFrame !== "function" || durationMs === 0) {
      setCountText(element, target);
      element.__aeCountAnimation = null;
      return;
    }

    var startedAt = null;
    function tick(timestamp) {
      var now = countNumber(timestamp);
      if (now === null) now = Date.now();
      if (startedAt === null) startedAt = now;
      var progress = Math.max(0, Math.min(1, (now - startedAt) / durationMs));
      var eased = 1 - Math.pow(1 - progress, 3);
      setCountText(element, startValue + ((target - startValue) * eased));
      if (progress < 1) {
        element.__aeCountAnimation = root.requestAnimationFrame(tick);
      } else {
        setCountText(element, target);
        element.__aeCountAnimation = null;
      }
    }
    element.__aeCountAnimation = root.requestAnimationFrame(tick);
  }

  function runCountUps() {
    var doc = root.document;
    if (!doc || typeof doc.querySelectorAll !== "function") return;
    var elements = doc.querySelectorAll("[data-count-target]");
    Array.prototype.forEach.call(elements, function(element) {
      animateCountUp(element, element.getAttribute("data-count-target"), 650);
    });
  }

  function isObject(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function(m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function inlineArg(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n]/g, " ");
  }

  // Panel-v2 ikonları metin emoji yerine tek, erişilebilir SVG yüzeyinden
  // üretilir. Böylece veri etiketleri ile ikon sunumu birbirine karışmaz.
  var ICON_PATHS = {
    dashboard: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    list: "M5 6h14M5 12h14M5 18h14",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
    trend: "M4 17l5-5 4 3 7-8M15 7h5v5",
    calendar: "M6 3v4M18 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
    archive: "M4 7h16v13H4zM3 4h18v3H3zM9 11h6",
    settings: "M12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5v.2h-2.6v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H6.3v-2.6h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.5V4h2.6v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.5 1h.2v2.6h-.2a1.7 1.7 0 00-1.5 1z",
    mood: "M4 14c2-5 5-7 8-7s6 2 8 7M7 17h.01M17 17h.01M8 20h8",
    cloud: "M5 17h13a4 4 0 000-8 6 6 0 00-11.4 2A3 3 0 005 17z",
    sun: "M12 5V3M12 21v-2M5 12H3M21 12h-2M6.3 6.3L4.9 4.9M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4M12 8a4 4 0 110 8 4 4 0 010-8z",
    spark: "M12 3l1.4 6.6L20 12l-6.6 1.4L12 20l-1.4-6.6L4 12l6.6-2.4L12 3z",
    leaf: "M20 4C11 4 5 8 5 14a6 6 0 006 6c6 0 9-7 9-16zM5 20c2-4 5-7 10-10",
    sleep: "M19 14.5A7.5 7.5 0 019.5 5 7.5 7.5 0 1019 14.5z",
    steps: "M6 4a2 2 0 110 4 2 2 0 010-4zM15 16a2 2 0 110 4 2 2 0 010-4zM8 8l7 8",
    sos: "M12 4l8 16H4L12 4zM12 10v4M12 17h.01",
    water: "M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z",
    journal: "M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM8 4v16M10 9h5M10 13h5",
    note: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
    intention: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z",
    gratitude: "M12 20S5 16 5 10a4 4 0 017-2 4 4 0 017 2c0 6-7 10-7 10z",
    shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
    reflection: "M5 5h14v11H9l-4 4V5zM8 9h8M8 12h5",
    prayer: "M12 3v18M5 8h14M7 8v5M17 8v5M9 21h6",
    saygi: "M12 3l2.2 5 5.3.5-4 3.5 1.2 5.2-4.7-2.8-4.7 2.8 1.2-5.2-4-3.5L9.8 8 12 3z",
    book: "M5 4h8a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM16 7a3 3 0 013-3v16h-3",
    watch: "M6 4h12v16H6zM9 7h6M9 17h6",
    listen: "M6 9v6M10 6v12M14 4v16M18 9v6",
    learning: "M4 6l8-3 8 3-8 3-8-3zM6 9v6l6 3 6-3V9M20 7v7",
    soul: "M12 4a8 8 0 108 8M12 4v8h8",
    meal: "M6 4v16M4 4v6a2 2 0 004 0V4M18 4v16M18 4c2 2 2 5 0 7",
    caffeine: "M5 8h12v8a4 4 0 01-4 4H9a4 4 0 01-4-4V8zM17 10h2a2 2 0 010 4h-2M8 4h8",
    medicine: "M7 5a3 3 0 014.2 0l7.8 7.8a3 3 0 01-4.2 4.2L7 9.2A3 3 0 017 5zM5 7l4 4",
    anxiety: "M12 4v16M4 12h16M7 7l10 10M17 7L7 17",
    crisis: "M12 4l8 16H4L12 4zM12 10v4M12 17h.01",
    magnesium: "M5 7h14v10H5zM8 10h8M8 14h5",
    cycle: "M5 12a7 7 0 0112-5l2 2M19 12a7 7 0 01-12 5l-2-2M19 7v3h-3M5 17v-3h3",
    nutrition: "M5 4v16M3 4v6a2 2 0 004 0V4M18 4v16M18 4c2 2 2 5 0 7",
    movement: "M5 18l4-6 3 3 4-7 3 3M16 5h3v3",
    location: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
    phone: "M7 3h10v18H7zM10 6h4M11 18h2",
    messages: "M4 5h16v11H8l-4 4V5z",
    check: "M5 12l4 4L19 6",
    close: "M6 6l12 12M18 6L6 18",
    arrowLeft: "M19 12H5M11 6l-6 6 6 6",
    arrowRight: "M5 12h14M13 6l6 6-6 6",
    copy: "M8 8h10v10H8zM5 5h10v3H8v7H5z",
    refresh: "M20 11a8 8 0 00-14-4L4 9M4 5v4h4M4 13a8 8 0 0014 4l2-2M20 19v-4h-4",
    lock: "M6 10h12v10H6zM8 10V7a4 4 0 018 0v3",
    dot: "M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0"
  };

  function renderIcon(name, size, label) {
    var key = safeText(name || "dot", 32).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "dot";
    var path = ICON_PATHS[key] || ICON_PATHS.dot;
    var px = Math.max(12, Math.min(32, safeNumber(size) || 18));
    var accessible = label ? ' role="img" aria-label="' + escapeHtml(label) + '"' : ' aria-hidden="true"';
    return '<svg class="ae-icon ae-icon--' + key + '" width="' + px + '" height="' + px + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"' + accessible + '><path d="' + path + '"></path></svg>';
  }

  function nl2br(s) {
    return String(s || "").replace(/\n/g, "<br>");
  }

  function classNames(arr) { return arr.filter(Boolean).join(" "); }

  var FULL_DETAIL = true;

  // ── Projection adapter ────────────────────────────────────────────────
  function projectData(data) {
    var coverage = null;
    var adapter = root.SeymaPanelCoverage || root.PanelCoverageV1;
    if (typeof adapter !== "undefined" &&
        typeof adapter.coverageForData === "function") {
      try {
        coverage = adapter.coverageForData(data, { fullDetail: FULL_DETAIL });
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
    var icon = opts.icon || "dot";
    var title = safeText(opts.title || "Henüz veri yok", 80);
    var message = safeText(opts.message || "Bu bölümde görüntülenecek veri şu an yok.", 240);
    var variant = safeText(opts.variant || "", 20).replace(/[^A-Za-z0-9_-]/g, "");
    var cls = classNames(["ae-empty", "ae-scale-in", variant ? "ae-empty--" + variant : "", opts.className]);
    return '<div class="' + escapeHtml(cls) + '" role="' + escapeHtml(opts.role || "status") + '" aria-live="polite">' +
           '<div class="ae-empty__icon">' + renderIcon(icon, 24) + "</div>" +
           '<div class="ae-empty__title">' + escapeHtml(title) + "</div>" +
           '<div class="ae-empty__text">' + escapeHtml(message) + "</div>" +
           "</div>";
  }

  function AeCard(opts) {
    opts = opts || {};
    var cardVariants = ["glass", "solid", "gradient", "outline"];
    var requestedVariant = safeText(opts.variant || "", 24);
    var visualVariant = cardVariants.indexOf(opts.visualVariant) !== -1
      ? opts.visualVariant
      : cardVariants.indexOf(requestedVariant) !== -1
        ? requestedVariant
        : requestedVariant === "summary" ? "solid" : "glass";
    var semanticClass = requestedVariant && cardVariants.indexOf(requestedVariant) === -1
      ? "ae-card--" + requestedVariant.replace(/[^A-Za-z0-9_-]/g, "")
      : "";
    var cls = classNames(["ae-card", "ae-slide-up", semanticClass, "ae-card--" + visualVariant, opts.className]);
    return '<div class="' + escapeHtml(cls) + '">' + (opts.children || "") + "</div>";
  }

  function AeSkeleton(opts) {
    opts = opts || {};
    var allowed = ["text", "card", "circle"];
    var variant = allowed.indexOf(opts.variant) !== -1 ? opts.variant : "text";
    var cls = classNames(["ae-skeleton", "ae-skeleton--" + variant, "ae-shimmer", opts.className]);
    return '<span class="' + escapeHtml(cls) + '" aria-hidden="true"></span>';
  }

  function AeTooltip(opts) {
    opts = opts || {};
    var positions = ["top", "right", "bottom", "left"];
    var position = positions.indexOf(opts.position) !== -1 ? opts.position : "top";
    var id = String(opts.id || "ae-tooltip").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 48) || "ae-tooltip";
    var text = safeText(opts.text || opts.message || "Daha fazla bilgi", 240);
    var label = safeText(opts.label || "i", 24);
    var triggerClass = classNames(["ae-tooltip-trigger", opts.triggerClass]);
    var ariaLabel = safeText(opts.ariaLabel || text, 120);
    return '<span class="ae-tooltip-wrap" data-tooltip-position="' + position + '">' +
           '<button type="button" class="' + escapeHtml(triggerClass) + '" tabindex="0" aria-label="' + escapeHtml(ariaLabel) + '" aria-describedby="' + escapeHtml(id) + '">' +
           escapeHtml(label) +
           "</button>" +
           '<span class="ae-tooltip" id="' + escapeHtml(id) + '" role="tooltip">' + escapeHtml(text) + "</span>" +
           "</span>";
  }

  function AeDivider(opts) {
    opts = opts || {};
    var label = safeText(opts.label || "", 80);
    var tag = opts.inline ? "span" : "div";
    var classes = classNames(["ae-divider", label ? "ae-divider--label" : "", opts.className]);
    var aria = label ? ' aria-label="' + escapeHtml(label) + '"' : "";
    return '<' + tag + ' class="' + escapeHtml(classes) + '" role="separator"' + aria + '>' +
           (label ? '<span class="ae-divider__label">' + escapeHtml(label) + "</span>" : "") +
           "</" + tag + ">";
  }

  function AeToast(opts) {
    opts = opts || {};
    var allowedTypes = ["success", "error", "info"];
    var type = allowedTypes.indexOf(opts.type) !== -1 ? opts.type : "info";
    var message = safeText(opts.message || opts.text || "Bildirim", 240);
    var id = String(opts.id || "toast").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 48) || "toast";
    var icons = { success: "check", error: "crisis", info: "messages" };
    var role = type === "error" ? "alert" : "status";
    var close = opts.dismissible === false ? "" :
      '<button type="button" class="ae-toast__close" tabindex="0" onclick="AeonV2.dismissToast(\'' + escapeHtml(id) + '\')" aria-label="Bildirimi kapat">×</button>';
    return '<div class="ae-toast ae-toast--' + type + '" id="ae-toast-' + escapeHtml(id) +
           '" role="' + role + '" aria-live="polite" aria-atomic="true">' +
           '<span class="ae-toast__icon">' + renderIcon(icons[type], 16) + "</span>" +
           '<span class="ae-toast__message">' + escapeHtml(message) + "</span>" +
           close +
           "</div>";
  }

  var AE_RING_COLORS = {
    accent: "var(--ae-accent)",
    ok: "var(--ae-ok)",
    warn: "var(--ae-warn)",
    drop: "var(--ae-drop)",
    info: "var(--ae-info)"
  };

  function AeProgressRing(opts) {
    opts = opts || {};
    var value = safeNumber(opts.value);
    var pct = value === null ? 0 : Math.max(0, Math.min(100, value));
    var radius = 18;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference * (1 - pct / 100);
    var colorKey = String(opts.color || "accent");
    var color = AE_RING_COLORS[colorKey] || AE_RING_COLORS.accent;
    var label = safeText(opts.label || "İlerleme", 60);
    var pctText = Math.round(pct) + "%";
    return '<div class="ae-ring" role="img" aria-label="' + escapeHtml(label + ": " + pctText) + '">' +
           '<svg class="ae-ring__svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
           '<circle class="ae-ring__track" cx="24" cy="24" r="' + radius + '"></circle>' +
           '<circle class="ae-ring__progress" cx="24" cy="24" r="' + radius +
           '" stroke="' + color + '" stroke-dasharray="' + circumference.toFixed(2) +
           '" stroke-dashoffset="' + offset.toFixed(2) + '"></circle>' +
           '</svg>' +
           '<span class="ae-ring__value" aria-hidden="true">' + pctText + "</span>" +
           "</div>";
  }

  function metricSparkPcts(values) {
    var numbers = (Array.isArray(values) ? values : []).map(safeNumber).filter(function(v) { return v !== null; });
    var min = numbers.length ? Math.min.apply(Math, numbers) : 0;
    var max = numbers.length ? Math.max.apply(Math, numbers) : 0;
    return (Array.isArray(values) ? values : []).map(function(v) {
      var n = safeNumber(v);
      if (n === null) return { pct: 0, empty: true };
      if (max === min) return { pct: max === 0 ? 18 : 72, empty: false };
      return { pct: Math.max(8, Math.min(100, Math.round(18 + ((n - min) / (max - min)) * 82))), empty: false };
    });
  }

  function AeMetric(opts) {
    opts = opts || {};
    var color = String(opts.color || "accent").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20) || "accent";
    var compact = opts.compact === true;
    var metricStatus = safeText(opts.status || "normal", 20).replace(/[^A-Za-z0-9_-]/g, "") || "normal";
    var metricVariant = ["glass", "solid", "gradient", "outline"].indexOf(opts.variant) !== -1
      ? opts.variant
      : compact ? "solid" : "gradient";
    var title = safeText(opts.title || opts.label || "Metrik", 40);
    var value = opts.value !== undefined && opts.value !== null ? String(opts.value) : "—";
    var countValue = countNumber(opts.countValue);
    var countFormat = safeText(opts.countFormat || "number", 20).replace(/[^A-Za-z0-9_-]/g, "") || "number";
    var countAttrs = countTargetAttrs(countValue, countFormat);
    var countBadge = opts.countBadge === true && countValue !== null
      ? '<span class="ae-metric__count ae-count-up"' + countAttrs + '>' +
        escapeHtml(formatCountValue(countValue, countFormat)) + "</span>"
      : "";
    var valueCountAttrs = opts.countBadge === true ? "" : countAttrs;
    var unit = opts.unit ? '<span class="ae-metric__unit">' + escapeHtml(opts.unit) + "</span>" : "";
    var sparklineLimit = countNumber(opts.sparklineLimit);
    sparklineLimit = sparklineLimit === null ? 7 : Math.max(1, Math.min(30, Math.round(sparklineLimit)));
    var series = Array.isArray(opts.sparkline) ? opts.sparkline.slice(0, sparklineLimit) : [];
    var sparkPcts = metricSparkPcts(series);
    var spark = sparkPcts.map(function(item) {
      var sparkPct = Math.round(item.pct / 10) * 10;
      return '<span class="ae-metric__spark-bar' + (item.empty ? " is-empty" : "") +
             '" data-pct="' + sparkPct + '" aria-hidden="true"></span>';
    }).join("");
    var delta = opts.delta;
    var deltaValue = typeof delta === "object" && delta ? delta.value : delta;
    var deltaTone = typeof delta === "object" && delta ? delta.tone : "muted";
    var deltaLabel = typeof delta === "object" && delta ? delta.label : "Önceki kayda göre değişim";
    var allowedTones = ["ok", "warn", "drop", "info", "muted"];
    if (allowedTones.indexOf(deltaTone) === -1) deltaTone = "muted";
    var sparkLabel = safeText(opts.sparklineLabel || title + " son 7 kayıt", 80);
    var metricClass = classNames([
      "ae-card", compact ? "ae-card--summary" : "ae-card--hero", compact ? "summary-card" : "hero-card",
      "ae-metric", "ae-slide-up", "ae-card--" + metricVariant,
      compact ? "summary-card--" + metricStatus : "hero-card--" + color, opts.className
    ]);
    var head = '<div class="ae-metric__head">' +
               '<span class="ae-metric__icon">' + renderIcon(opts.icon || "dot", 18) + "</span>" +
               '<span class="ae-metric__title">' + escapeHtml(title) + "</span>" +
               (opts.ring ? AeProgressRing({
                 value: opts.ring.value,
                 color: opts.ring.color || color,
                 label: opts.ring.label || title + " ilerlemesi"
               }) : "") +
               "</div>";
    var sparkMarkup;
    if (opts.sparklineType === "svg") {
      var sparkColor = safeText(opts.sparklineColor || color, 20).replace(/[^A-Za-z0-9_-]/g, "") || "accent";
      sparkMarkup = '<div class="ae-metric__sparkline ae-metric__sparkline--svg" data-sparkline-window="' +
                    sparklineLimit + '">' +
                    AeSparkline(series, sparkColor, opts.sparklineHeight || 28, sparkLabel) +
                    "</div>";
    } else {
      sparkMarkup = '<span class="ae-metric__sparkline" role="img" aria-label="' + escapeHtml(sparkLabel) + '">' +
                    (spark || '<span class="ae-metric__spark-empty" aria-hidden="true">—</span>') +
                    "</span>";
    }
    var footer = '<div class="ae-metric__footer">' +
                 '<span class="ae-metric__delta ae-metric__delta--' + deltaTone +
                 '" title="' + escapeHtml(deltaLabel) + '" aria-label="' + escapeHtml(deltaLabel) + '">' +
                 escapeHtml(deltaValue === undefined || deltaValue === null ? "—" : String(deltaValue)) +
                 "</span>" +
                 sparkMarkup +
                 "</div>";
    return '<article class="' + escapeHtml(metricClass) + '">' +
           head +
           '<div class="ae-metric__value"><span class="ae-count-up"' + valueCountAttrs + '>' +
           escapeHtml(value) + "</span>" + unit + "</div>" +
           countBadge +
           (opts.sub ? '<div class="ae-metric__sub">' + escapeHtml(safeText(opts.sub, 80)) + "</div>" : "") +
           footer +
           "</article>";
  }

  function AeButton(opts) {
    opts = opts || {};
    var variant = safeText(opts.variant || "", 24).replace(/[^A-Za-z0-9_-]/g, "");
    var hasGlow = opts.glow === true || (opts.glow !== false && ["primary", "drop"].indexOf(variant) !== -1);
    var cls = classNames(["ae-btn", variant ? "ae-btn--" + variant : "", hasGlow ? "ae-btn--glow" : "", opts.className]);
    var label = safeText(opts.label, 80);
    var attrs = opts.onclick ? ' onclick="' + escapeHtml(opts.onclick) + '"' : "";
    var accessibleLabel = safeText(opts.ariaLabel || label, 120);
    if (accessibleLabel) attrs += ' aria-label="' + escapeHtml(accessibleLabel) + '"';
    var tabIndex = opts.tabIndex !== undefined && opts.tabIndex !== null ? Math.round(safeNumber(opts.tabIndex) || 0) : 0;
    attrs += ' tabindex="' + (tabIndex < 0 ? "-1" : "0") + '"';
    if (opts.focusKey) attrs += ' data-focus-key="' + escapeHtml(safeText(opts.focusKey, 120)) + '"';
    if (opts.disabled) attrs += ' disabled aria-disabled="true"';
    var content = opts.labelHtml ? String(opts.labelHtml) : escapeHtml(label);
    return '<button type="button" class="' + escapeHtml(cls) + '"' + attrs + '>' + content + "</button>";
  }

  function AeStatusBadge(opts) {
    opts = opts || {};
    var status = opts.status || "idle";
    var labels = {
      idle: "Bekliyor", local_saved: "Kaydedildi", queued: "Sıraya alındı",
      saving: "Gönderiliyor", loading: "Kontrol ediliyor", retrying: "Yeniden deneniyor", accepted: "Senkronize",
      error: "Hata", offline: "Çevrimdışı", permission: "İzin hatası",
      unauthorized: "Yetkisiz", forbidden: "Yasak", not_found: "Bulunamadı",
      conflict: "Çakışma", anti_clobber: "Koruma", rate_limited: "Limit",
      receipt_failed: "Makbuz hatası"
    };
    var palette = {
      idle: "muted", local_saved: "info", queued: "info", saving: "warn", loading: "info", retrying: "warn",
      accepted: "ok", error: "drop", offline: "pause", permission: "drop",
      unauthorized: "drop", forbidden: "drop", not_found: "drop", conflict: "warn",
      anti_clobber: "warn", rate_limited: "warn", receipt_failed: "drop"
    };
    var tone = palette[status] || "muted";
    if (["ok", "warn", "drop", "info", "pause", "muted"].indexOf(opts.tone) !== -1) {
      tone = opts.tone;
    }
    var label = safeText(opts.label || labels[status] || status, 80);
    var classes = classNames(["ae-status", "ae-status--" + tone, opts.className]);
    return '<span class="' + escapeHtml(classes) + '" role="status" aria-label="' + escapeHtml(label) + '">' +
           '<span class="ae-status__dot"></span>' +
           '<span class="ae-status__label">' + escapeHtml(label) + "</span>" +
           "</span>";
  }

  function renderLoadingState() {
    return '<section class="ae-loading ae-slide-up" role="status" aria-live="polite" aria-label="Veriler yükleniyor">' +
           '<div class="ae-loading__head">' +
           AeSkeleton({ variant: "text", className: "ae-loading__title" }) +
           AeSkeleton({ variant: "text", className: "ae-loading__meta" }) +
           "</div>" +
           '<div class="ae-loading__grid">' +
           AeSkeleton({ variant: "card" }) +
           AeSkeleton({ variant: "card" }) +
           AeSkeleton({ variant: "card" }) +
           AeSkeleton({ variant: "card" }) +
           "</div>" +
           '<div class="ae-loading__body">' +
           AeSkeleton({ variant: "text" }) +
           AeSkeleton({ variant: "text", className: "ae-loading__line--short" }) +
           '<span class="ae-loading__label">Veriler yükleniyor…</span>' +
           "</div>" +
           "</section>";
  }

  function pullRefreshLabel(mode) {
    if (mode === "ready") return "Bırak ve yenile";
    if (mode === "refreshing") return "Yenileniyor…";
    if (mode === "pulling") return "Yenilemek için çek";
    return "Yenilemek için aşağı çek";
  }

  function renderPullRefreshIndicator() {
    var mode = pullRefresh.mode || "idle";
    var visible = mode !== "idle";
    var classes = classNames([
      "ae-pull-refresh",
      visible ? "is-visible" : "",
      mode === "ready" ? "is-ready" : "",
      mode === "refreshing" ? "is-refreshing" : ""
    ]);
    return '<div id="ae-pull-refresh" class="' + escapeHtml(classes) +
           '" data-state="' + escapeHtml(mode) + '" role="status" aria-live="polite" aria-hidden="' +
           (visible ? "false" : "true") + '" aria-label="' + escapeHtml(pullRefreshLabel(mode)) + '">' +
           '<span class="ae-pull-refresh__icon" aria-hidden="true">' + renderIcon("refresh", 18) + "</span>" +
           '<span class="ae-pull-refresh__label">' + escapeHtml(pullRefreshLabel(mode)) + "</span>" +
           "</div>";
  }

  function updatePullRefreshIndicator(mode, distance) {
    var allowed = ["idle", "pulling", "ready", "refreshing"];
    pullRefresh.mode = allowed.indexOf(mode) !== -1 ? mode : "idle";
    pullRefresh.distance = Math.max(0, Math.min(PULL_REFRESH_MAX_DISTANCE, safeNumber(distance) || 0));
    var doc = root.document;
    var indicator = doc && typeof doc.getElementById === "function" ? doc.getElementById("ae-pull-refresh") : null;
    if (!indicator) return;
    var visible = pullRefresh.mode !== "idle";
    var label = pullRefreshLabel(pullRefresh.mode);
    var offset = pullRefresh.mode === "refreshing"
      ? 10
      : -48 + Math.min(64, pullRefresh.distance);
    if (indicator.style) {
      indicator.style.transform = "translate3d(-50%, " + offset + "px, 0)";
      indicator.style.opacity = visible ? "1" : "0";
      if (typeof indicator.style.setProperty === "function") {
        indicator.style.setProperty("--ae-pull-progress", String(Math.min(1, pullRefresh.distance / PULL_REFRESH_THRESHOLD)));
      }
    }
    if (typeof indicator.setAttribute === "function") {
      indicator.setAttribute("data-state", pullRefresh.mode);
      indicator.setAttribute("aria-hidden", visible ? "false" : "true");
      indicator.setAttribute("aria-label", label);
    }
    if (typeof indicator.querySelector === "function") {
      var labelNode = indicator.querySelector(".ae-pull-refresh__label");
      if (labelNode) labelNode.textContent = label;
    }
  }

  function getPullRefreshState() {
    return {
      mode: pullRefresh.mode,
      distance: pullRefresh.distance,
      refreshing: pullRefresh.refreshing,
      threshold: PULL_REFRESH_THRESHOLD,
      mobileMaxWidth: 460
    };
  }

  // ── Date helpers / state access ─────────────────────────────────────────
  function todayStr() { return ui.date || isoDate(new Date()); }
  function setDate(date) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    ui.date = date;
    announce("Gün seçildi: " + date);
    render();
  }
  function setData(data) {
    appData = unwrapPanelData(data);
    resetArchivePageCache();
    announce("Panel verisi güncellendi.");
    render();
  }

  function unwrapPanelData(data) {
    var value = isObject(data) ? data : {};
    // latest.json doğrudan uygulama objesi olabilir; günlük snapshot/relay
    // sarmalayıcıları da read-only panelde güvenle açılır.
    if (isObject(value.data) && (value.data.days || value.data.settings)) value = value.data;
    else if (isObject(value.app) && (value.app.days || value.app.settings)) value = value.app;
    else if (isObject(value.payload) && (value.payload.days || value.payload.settings)) value = value.payload;
    return value;
  }
  function getDay(date) {
    return isObject(appData) && isObject(appData.days) ? (appData.days[date] || null) : null;
  }
  function lastNDates(n, ref, includeFuture) {
    var out = [], base = ref || todayStr();
    var today = todayStr();
    for (var i = n - 1; i >= 0; i--) {
      var d = dateOffset(base, -i);
      if (!includeFuture && d > today) {
        out.push(null);
        continue;
      }
      out.push(d);
    }
    // Sondaki boş (gelecek) gün kayıtlarını at; çağrıcı 30 gerçek hücre görmeli.
    while (out.length < n) out.push(null);
    while (out.length > n && out[out.length - 1] === null) out.pop();
    return out;
  }

  // ── Mood label map (app.js MOODS ids are string ids, numeric kept for backward compatibility) ──
  var MOOD_LABELS = {
    1: "Fırtınalı", 2: "Bulutlu", 3: "Durağan", 4: "Huzurlu",
    5: "Aydınlık", 6: "Neşeli", 7: "Coşkulu"
  };
  var MOOD_ICONS = { 1: "crisis", 2: "cloud", 3: "dot", 4: "mood", 5: "sun", 6: "trend", 7: "spark" };
  var MOOD_ID_LABELS = {
    "cok-iyi": "Çok iyi", "iyi": "İyi", "normal": "Normal",
    "zorlandim": "Zorlandım", "cok-zorlandim": "Çok zorlandım"
  };
  var MOOD_ID_ICONS = {
    "cok-iyi": "sun", "iyi": "gratitude", "normal": "leaf",
    "zorlandim": "cloud", "cok-zorlandim": "water"
  };
  var MOOD_ORDER = ["cok-zorlandim", "zorlandim", "normal", "iyi", "cok-iyi"];

  function moodIdToNumber(id) {
    var map = { "cok-zorlandim": 1, "zorlandim": 2, "normal": 3, "iyi": 4, "cok-iyi": 5 };
    return map[id] || null;
  }

  function getMood(day) {
    if (!isObject(day)) return { value: null, label: null, icon: "dot", note: "" };
    var raw = day.mood;
    var val = null, note = "";
    if (typeof raw === "string" && raw) {
      val = moodIdToNumber(raw);
      note = day.moodNote || "";
    } else if (isObject(raw)) {
      val = safeNumber(raw.value);
      note = raw.note || "";
    }
    var label = (val ? (MOOD_LABELS[val] || "Bilinmiyor") : (MOOD_ID_LABELS[String(raw || "")] || null));
    var icon = (val ? (MOOD_ICONS[val] || "dot") : (MOOD_ID_ICONS[String(raw || "")] || "dot"));
    return { value: val, raw: raw, label: label, icon: icon, note: note };
  }

  function getSteps(day) {
    if (!isObject(day)) return null;
    var h = day.health || {}, w = day.walk || {}, m = day.movement || {};
    // app.js'nin kanonik önceliği: elle girilen walk.steps, Sağlık senkronu
    // health.steps, son çare olarak gerçek walkM'den türetilen tahmin. Varsayılan
    // movement.walkM=0 ölçüm değildir; onu sıfır olarak döndürmek grafiği sahte
    // sıfırlarla doldurur.
    var v = numberOrNull(w.steps);
    if (v !== null) return Math.max(0, v);
    v = numberOrNull(h.steps);
    if (v !== null && (v > 0 || h.updatedAt)) return Math.max(0, v);
    var walkM = numberOrNull(m.walkM);
    if (walkM !== null && walkM > 0) return Math.round(walkM / 0.72);
    return null;
  }

  function getWater(day) {
    return isObject(day) ? numberOrNull(day.water) : null;
  }

  function getSleepHours(day) {
    return isObject(day) && isObject(day.sleep) ? numberOrNull(day.sleep.hours) : null;
  }

  function getSleepQuality(day) {
    return isObject(day) && isObject(day.sleep) ? numberOrNull(day.sleep.quality) : null;
  }

  function getCaffeine(day) {
    return isObject(day) && isObject(day.caffeine) ? day.caffeine : { last: null, cups: null, drinks: [] };
  }

  function getMovement(day) {
    var m = isObject(day) ? (day.movement || {}) : {};
    var wM = safeNumber(m.walkM) || 0;
    var vM = safeNumber(m.vehicleM) || 0;
    var tM = safeNumber(m.totalM) || (wM + vM);
    return { walkM: wM, vehicleM: vM, totalM: tM, maxSpeed: safeNumber(m.maxSpeed), samples: safeNumber(m.samples) || 0, walkSec: safeNumber(m.walkSec) || 0, vehicleSec: safeNumber(m.vehicleSec) || 0 };
  }

  function getPrayer(day) {
    return isObject(day) && isObject(day.prayer) ? day.prayer : null;
  }

  function getZikrCount(date) {
    var session = getZikrSession(date);
    return session ? safeNumber(session.totalCount) : null;
  }

  function getZikrSession(date) {
    if (!isObject(appData) || !isObject(appData.zikr) || !isObject(appData.zikr.sessions)) return null;
    var session = appData.zikr.sessions[date];
    return isObject(session) ? session : null;
  }

  function getZikrPreset(date, presetId) {
    var z = isObject(appData) && isObject(appData.zikr) ? appData.zikr : {};
    var presets = Array.isArray(z.presets) ? z.presets : [];
    for (var i = 0; i < presets.length; i++) {
      if (presets[i] && String(presets[i].id || "") === String(presetId || "")) return presets[i];
    }
    return null;
  }

  function getZikrReflections(date) {
    var z = isObject(appData) && isObject(appData.zikr) ? appData.zikr : {};
    if (!Array.isArray(z.reflections)) return [];
    return z.reflections.filter(function(ref) {
      return isObject(ref) && String(ref.date || "") === String(date || "") &&
        (ref.mood || ref.feelings || ref.thoughts || ref.intention);
    }).sort(function(a, b) {
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
  }

  function zikrReflectionWordCount(ref) {
    var text = [ref && ref.feelings, ref && ref.thoughts, ref && ref.intention].filter(Boolean).join(" ").trim();
    if (!text) return 0;
    return safeNumber(ref.wordCount) || text.split(/\s+/).length;
  }

  function renderZikrDetail(date) {
    var session = getZikrSession(date) || {};
    var total = safeNumber(session.totalCount) || 0;
    var completedSets = safeNumber(session.completedSets) || 0;
    var perPreset = isObject(session.perPreset) ? session.perPreset : {};
    var presetIds = Object.keys(perPreset);
    var entries = presetIds.map(function(id) {
      var raw = perPreset[id];
      var count = isObject(raw) ? safeNumber(raw.count) : safeNumber(raw);
      var preset = getZikrPreset(date, id) || {};
      return {
        id: id,
        name: safeText(preset.name || id, 60),
        kind: preset.kind === "esma" ? "Esmâ-i Hüsnâ" : "Temel zikir",
        count: count === null ? 0 : Math.max(0, count),
        target: safeNumber(preset.ebced || preset.target),
        completedCycles: isObject(raw) ? (safeNumber(raw.completedCycles) || 0) : 0
      };
    }).filter(function(entry) {
      return entry.count > 0 || entry.completedCycles > 0;
    }).sort(function(a, b) { return b.count - a.count; });
    var reflections = getZikrReflections(date);
    if (!total && !entries.length && !reflections.length) return "";

    var kpis = '<div class="zikr-detail__kpis">' +
      '<div class="zikr-detail__kpi"><span>Bugün</span><strong>' + total.toLocaleString("tr-TR") + '</strong><small>toplam zikir</small></div>' +
      '<div class="zikr-detail__kpi"><span>Tur</span><strong>' + completedSets.toLocaleString("tr-TR") + '</strong><small>tamamlanan</small></div>' +
      '<div class="zikr-detail__kpi"><span>Zikir</span><strong>' + entries.length.toLocaleString("tr-TR") + '</strong><small>ayrıntılı kayıt</small></div>' +
      '<div class="zikr-detail__kpi"><span>Tefekkür</span><strong>' + reflections.length.toLocaleString("tr-TR") + '</strong><small>not</small></div>' +
      '</div>';

    var breakdown = entries.length ? '<div class="zikr-detail__section">' +
      '<div class="zikr-detail__section-head"><span>Zikir dökümü</span><span>' + entries.length + ' kalem</span></div>' +
      '<div class="zikr-breakdown">' + entries.map(function(entry) {
        var targetText = entry.target !== null && entry.target > 0 ? " · hedef " + entry.target.toLocaleString("tr-TR") : "";
        var cycleText = entry.completedCycles ? " · " + entry.completedCycles.toLocaleString("tr-TR") + " tur" : "";
        return '<div class="zikr-breakdown__row">' +
          '<div class="zikr-breakdown__identity"><strong>' + escapeHtml(entry.name) + '</strong><span>' + escapeHtml(entry.kind) + '</span></div>' +
          '<div class="zikr-breakdown__count"><strong>' + entry.count.toLocaleString("tr-TR") + '</strong><span>bugün' + escapeHtml(targetText + cycleText) + '</span></div>' +
          '</div>';
      }).join("") + '</div></div>' :
      '<div class="zikr-detail__empty">Bu gün için preset bazında ayrıntılı sayaç kaydı yok; toplam sayaç korunuyor.</div>';

    var reflectionHtml = reflections.length ? '<div class="zikr-detail__section zikr-detail__section--reflections">' +
      '<div class="zikr-detail__section-head"><span>Tefekkürler</span><span>' + reflections.length + ' kayıt</span></div>' +
      '<div class="zikr-reflections">' + reflections.map(function(ref) {
        var preset = getZikrPreset(date, ref.presetId) || {};
        var title = safeText(ref.presetName || preset.name || ref.presetId || "Zikir tefekkürü", 60);
        var mood = ref.mood ? '<span class="zikr-reflection__mood">' + escapeHtml(safeText(ref.mood, 40)) + '</span>' : "";
        var updatedAt = ref.updatedAt || ref.createdAt || "";
        var time = updatedAt && updatedAt.length >= 16 ? updatedAt.slice(11, 16) : "";
        var text = "";
        if (ref.feelings) text += '<div><b>Hislerim</b><span>' + nl2br(escapeHtml(ref.feelings)) + '</span></div>';
        if (ref.thoughts) text += '<div><b>Düşüncelerim</b><span>' + nl2br(escapeHtml(ref.thoughts)) + '</span></div>';
        if (ref.intention) text += '<div><b>Duam · niyetim</b><span>' + nl2br(escapeHtml(ref.intention)) + '</span></div>';
        return '<article class="zikr-reflection">' +
          '<div class="zikr-reflection__head"><strong>' + escapeHtml(title) + '</strong>' + mood + '</div>' +
          (text ? '<div class="zikr-reflection__body">' + text + '</div>' : "") +
          '<div class="zikr-reflection__meta">' + zikrReflectionWordCount(ref).toLocaleString("tr-TR") + ' kelime' + (time ? ' · ' + escapeHtml(time) : "") + '</div>' +
          '</article>';
      }).join("") + '</div></div>' :
      '<div class="zikr-detail__empty">Bugün için tefekkür notu yok.</div>';

    return '<details class="zikr-detail"' + (reflections.length ? ' data-reflection-count="' + reflections.length + '"' : "") + '>' +
      '<summary class="zikr-detail__summary"><span class="zikr-detail__summary-title">' + renderIcon("prayer", 16) + ' Zikir ve Esmâ</span><span class="zikr-detail__summary-total">' + total.toLocaleString("tr-TR") + ' toplam</span><span class="zikr-detail__summary-chevron" aria-hidden="true">' + renderIcon("arrowRight", 14) + '</span></summary>' +
      '<div class="zikr-detail__body">' + kpis + breakdown + reflectionHtml + '</div>' +
      '</details>';
  }

  function getSaygiInfo(day) {
    if (!isObject(day) || !isObject(day.saygi)) return null;
    var pid = day.saygi.personId;
    var collection = isObject(appData) && isObject(appData.saygi) && isObject(appData.saygi.collection) ? appData.saygi.collection : {};
    var person = pid ? collection[pid] : null;
    return { personId: pid, name: (person && person.name) || day.saygi.personName || "", read: !!day.saygi.readAt };
  }

  function getQuranInfo(day) {
    if (!isObject(day) || !Array.isArray(day.quranRequests)) return null;
    return { requests: day.quranRequests };
  }

  function contentEntries(day, key) {
    if (!isObject(day)) return [];
    var obj = day[key] || (day.media ? day.media[key] : null);
    return isObject(obj) && Array.isArray(obj.entries) ? obj.entries : [];
  }

  function getLearningEntries(day) {
    return contentEntries(day, "learning");
  }

  function getSoulActivities(day) {
    return isObject(day) && Array.isArray(day.soulActivities) ? day.soulActivities : [];
  }

  function getMealItems(day, meal) {
    if (!isObject(day) || !isObject(day.mealItems)) return [];
    return Array.isArray(day.mealItems[meal]) ? day.mealItems[meal] : [];
  }

  function getMeals(day) {
    return isObject(day) && isObject(day.meals) ? day.meals : {};
  }

  function getDiscomfort(day) {
    return isObject(day) && isObject(day.discomfort) ? day.discomfort : { regions: {}, note: "", meds: [] };
  }

  function getDiscomfortDetail(day) {
    var dis = getDiscomfort(day);
    var regions = isObject(dis.regions) ? dis.regions : {};
    var regionKeys = Object.keys(regions);
    var regionList = regionKeys.map(function(k) {
      var r = regions[k];
      var level = isObject(r) ? safeNumber(r.level) : safeNumber(r);
      return { id: k, level: level !== null ? level : 0 };
    });
    return {
      regions: regionList,
      note: dis.note || "",
      meds: Array.isArray(dis.meds) ? dis.meds : [],
      totalRegions: regionList.length,
      maxLevel: regionList.reduce(function(m, r) { return Math.max(m, r.level); }, 0)
    };
  }

  function getTherapy(day) {
    return isObject(day) && isObject(day.therapy) ? day.therapy : emptyTherapyShape();
  }

  function emptyTherapyShape() {
    return { firstStep: {}, selfCompassion: {}, breath: {}, decision: {}, thoughts: [], dailyWin: {}, share: {} };
  }

  function getHabits(day) {
    return isObject(day) && isObject(day.habits) ? day.habits : {};
  }

  function getEnergy(day) {
    return isObject(day) ? numberOrNull(day.energy) : null;
  }

  function getStress(day) {
    return isObject(day) ? numberOrNull(day.stress) : null;
  }

  function getNutri(day) {
    return isObject(day) && isObject(day.nutri) ? day.nutri : null;
  }

  function getMagnesium(day) {
    return isObject(day) && isObject(day.magnesium) ? day.magnesium : null;
  }

  function getCycleInfo(day) {
    if (!isObject(day)) return { flow: null, symptoms: [] };
    return {
      flow: day.flow || null,
      symptoms: Array.isArray(day.symptoms) ? day.symptoms : []
    };
  }

  function getCravingDetails(day) {
    if (!isObject(day)) return {};
    return {
      sosCount: safeNumber(day.cravingSOSCount) || 0,
      optionsUsed: Array.isArray(day.cravingOptionsUsed) ? day.cravingOptionsUsed : [],
      triggers: Array.isArray(day.cravingTriggers) ? day.cravingTriggers : [],
      triggerNote: day.cravingTriggerNote || "",
      tenMinDone: !!day.craving10MinDone,
      foodDone: !!day.foodCravingDone,
      coffeeDone: !!day.coffeeCravingDone
    };
  }

  function getWindDown(day) {
    if (!isObject(day) || !isObject(day.sleep)) return null;
    var wd = day.sleep.windDown;
    if (!isObject(wd)) return null;
    var steps = isObject(wd.steps) ? wd.steps : {};
    return {
      light: !!steps.light,
      breath: !!steps.breath,
      dump: !!steps.dump,
      cool: !!steps.cool,
      lastMinutes: safeNumber(wd.lastMinutes),
      offloadNote: wd.offloadNote || "",
      events: Array.isArray(wd.events) ? wd.events : [],
      sessions: Array.isArray(wd.sessions) ? wd.sessions : []
    };
  }

  function getSleepMed(day) {
    if (!isObject(day) || !isObject(day.sleep)) return null;
    var med = day.sleep.med;
    if (!isObject(med)) return null;
    return { type: med.type || null, note: med.note || "" };
  }

  var HABIT_LABELS = {
    sweetManaged: "Tatlı krizi", foodManaged: "Yemek krizi", coffeeManaged: "Kahve krizi",
    eveningControl: "Akşam atıştırma", walked20: "Yürüyüş", protein: "Protein",
    water: "Su", vitaminD: "D₃K₂", sleepReg: "Uyku düzeni", journaled: "Günlük",
    mediaFed: "Zihin besleme", freshAir: "Temiz hava", selfKind: "Kendine şefkat",
    caffeineOk: "Kafein limiti", magnesium: "Magnezyum"
  };
  var HABIT_ICONS = {
    sweetManaged: "meal", foodManaged: "nutrition", coffeeManaged: "caffeine",
    eveningControl: "sleep", walked20: "steps", protein: "nutrition",
    water: "water", vitaminD: "medicine", sleepReg: "sleep", journaled: "journal",
    mediaFed: "book", freshAir: "leaf", selfKind: "gratitude",
    caffeineOk: "check", magnesium: "magnesium"
  };

  function getHabitSummary(day) {
    var habits = getHabits(day);
    var done = [], undone = [];
    Object.keys(HABIT_LABELS).forEach(function(k) {
      if (habits[k]) done.push(k);
      else undone.push(k);
    });
    return { done: done, undone: undone, total: done.length + undone.length, doneCount: done.length };
  }

  function getRootCycle() {
    return isObject(appData) && isObject(appData.cycle) ? appData.cycle : null;
  }

  function getRootBody() {
    return isObject(appData) && isObject(appData.body) ? appData.body : null;
  }

  function getRootQuranJourney() {
    return isObject(appData) && isObject(appData.quranJourney) ? appData.quranJourney : null;
  }

  var QURAN_STATUS_V2={
    idle:{label:"İstenebilir",tone:"muted"},submitting:{label:"İletiliyor",tone:"wait"},queued:{label:"İstek kaydedildi",tone:"wait"},
    notified:{label:"Raşit’e haber verildi",tone:"wait"},awaiting_reply:{label:"Cevap bekleniyor",tone:"wait"},validating_reply:{label:"Cevap doğrulanıyor",tone:"wait"},
    ready:{label:"Anlatım hazır",tone:"ready"},watching:{label:"İzleniyor",tone:"ready"},watched:{label:"İzlendi",tone:"done"},question_opened:{label:"Soru açıldı",tone:"done"},
    request_error:{label:"İletilemedi",tone:"error"},notification_error:{label:"Bildirilemedi",tone:"error"},invalid_reply:{label:"Bağlantı doğrulanamadı",tone:"error"},video_unavailable:{label:"Anlatım erişilemiyor",tone:"error"}
  };
  function quranJourneyV2Rows(){
    var q=getRootQuranJourney(), reqs=q&&q.requests&&typeof q.requests==='object'?q.requests:{};
    var catalog=root.QuranRevelationOrderV1, rows=[];
    Object.keys(reqs).forEach(function(surahId){
      var req=reqs[surahId]; if(!isObject(req)) return;
      var surah=catalog&&typeof catalog.byId==='function'?catalog.byId(surahId):null;
      rows.push({surahId:surahId,req:req,name:surah&&surah.nameTr?surah.nameTr:surahId,order:surah&&surah.revelationOrder?surah.revelationOrder:null});
    });
    rows.sort(function(a,b){ return String((b.req&&b.req.updatedAt)||'').localeCompare(String((a.req&&a.req.updatedAt)||'')); });
    return rows;
  }
  function renderQuranJourneyV2(){
    var q=getRootQuranJourney(), rows=quranJourneyV2Rows();
    if(!q||!rows.length) return AeCard({className:'ae-quran-card',children:AeEmpty({icon:'book',title:'Kur’an Yolculuğu',message:'Henüz senkronize edilmiş bir Kur’an isteği yok.'})});
    var counts={requested:0,waiting:0,ready:0,watched:0};
    rows.forEach(function(row){
      var s=String(row.req.status||'idle'); if(s!=='idle') counts.requested++;
      if(['submitting','queued','notified','awaiting_reply','validating_reply','request_error','notification_error','invalid_reply','video_unavailable'].indexOf(s)>=0) counts.waiting++;
      if(['ready','watching'].indexOf(s)>=0) counts.ready++;
      if(['watched','question_opened'].indexOf(s)>=0) counts.watched++;
    });
    var active=rows[0], meta=QURAN_STATUS_V2[active.req.status]||QURAN_STATUS_V2.idle;
    var detail='<div class="ae-quran-card__head"><div><div class="ae-label">KUR’AN YOLCULUĞU · KANONİK DURUM</div><h2>Raşit’in anlatım akışı</h2><p>Panel 1 ile aynı <code>data.quranJourney</code> kaynağı; yalnızca senkronize edilmiş özet gösterilir.</p></div><span class="ae-quran-card__status is-'+escapeHtml(meta.tone)+'">'+escapeHtml(meta.label)+'</span></div>';
    detail+='<div class="ae-quran-card__metrics"><span><b>'+counts.requested+'</b><small>istenen</small></span><span><b>'+counts.waiting+'</b><small>bekleyen</small></span><span><b>'+counts.ready+'</b><small>hazır</small></span><span><b>'+counts.watched+'</b><small>izlendi</small></span></div>';
    detail+='<div class="ae-quran-card__rows">';
    rows.slice(0,5).forEach(function(row){
      var req=row.req, st=QURAN_STATUS_V2[req.status]||QURAN_STATUS_V2.idle;
      detail+='<article class="ae-quran-card__row"><div class="ae-quran-card__row-top"><strong>'+escapeHtml(row.name)+'</strong><span class="ae-quran-card__badge is-'+escapeHtml(st.tone)+'">'+escapeHtml(st.label)+'</span></div>';
      detail+='<div class="ae-quran-card__row-meta"><span>requestId: <code>'+escapeHtml(req.requestId||'—')+'</code></span><span>responseId: <code>'+escapeHtml(req.responseId||'—')+'</code></span><span>video: '+escapeHtml(req.videoId||'—')+'</span></div>';
      detail+='<div class="ae-quran-card__row-meta"><span>teslim: '+escapeHtml(formatTs(req.deliverySentAt||req.notifiedAt||''))+'</span><span>provenance: '+escapeHtml(req.responseSource||'state')+'</span><span>alındı: '+escapeHtml(formatTs(req.responseReceivedAt||''))+'</span><span>doğrulandı: '+escapeHtml(formatTs(req.responseValidatedAt||''))+'</span></div></article>';
    });
    detail+='</div>';
    if(rows.length>5) detail+='<div class="ae-quran-card__foot">+'+(rows.length-5)+' istek daha · en güncel 5 kayıt gösteriliyor</div>';
    return AeCard({className:'ae-quran-card',visualVariant:'gradient',children:detail});
  }

  function getLocationInfo() {
    if (!isObject(appData)) return null;
    var loc = appData.location || null;
    var history = Array.isArray(appData.locationHistory) ? appData.locationHistory : [];
    var settings = isObject(appData.settings) ? appData.settings : {};
    return {
      current: loc,
      history: history,
      historyCount: history.length,
      lastTs: appData.locationLastTs || null,
      enabled: !!settings.locationEnabled,
      mode: settings.locationMode || 'auto',
      enabledAt: settings.locationEnabledAt || null,
      enabledReason: settings.locationEnabledReason || null,
      disabledAt: settings.locationDisabledAt || null,
      disabledReason: settings.locationDisabledReason || null
    };
  }

  // GPS örneklerini gerçek yer değişikliklerine indirger. Aynı konumda alınan
  // sık örnekler tek kayıtta tutulur; kullanıcı yine kaç ham örneğin birleştiğini
  // görür. Eşik, GPS titreşimini ayırmak için 120 metredir.
  function normalizeLocationPoint(point) {
    if (!isObject(point)) return null;
    var lat = safeNumber(point.lat);
    var lng = safeNumber(point.lng);
    if (lat === null) lat = safeNumber(point.latitude);
    if (lng === null) lng = safeNumber(point.longitude);
    if (lat === null || lng === null) return null;
    return {
      lat: lat,
      lng: lng,
      ts: point.ts || point.timestamp || "",
      acc: safeNumber(point.acc) || safeNumber(point.accuracy) || null
    };
  }

  function locationDistanceMeters(a, b) {
    if (!a || !b) return Infinity;
    var rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad;
    var dLng = (b.lng - a.lng) * rad;
    var lat1 = a.lat * rad;
    var lat2 = b.lat * rad;
    var sinLat = Math.sin(dLat / 2);
    var sinLng = Math.sin(dLng / 2);
    var h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function compressLocationHistory(history) {
    var source = (Array.isArray(history) ? history : []).map(function(point, index) {
      var normalized = normalizeLocationPoint(point);
      if (normalized) normalized._order = index;
      return normalized;
    }).filter(Boolean).sort(function(a, b) {
      if (!a.ts || !b.ts) return a._order - b._order;
      return String(a.ts).localeCompare(String(b.ts)) || a._order - b._order;
    });
    var clusters = [];
    source.forEach(function(point) {
      var current = clusters[clusters.length - 1];
      if (!current || locationDistanceMeters(current.lastPoint, point) > 120) {
        clusters.push({
          latSum: point.lat,
          lngSum: point.lng,
          samples: 1,
          firstTs: point.ts,
          lastTs: point.ts,
          acc: point.acc,
          lastPoint: point
        });
        return;
      }
      current.latSum += point.lat;
      current.lngSum += point.lng;
      current.samples += 1;
      current.lastTs = point.ts || current.lastTs;
      current.acc = point.acc || current.acc;
      current.lastPoint = point;
    });
    return clusters.map(function(cluster) {
      return {
        lat: cluster.latSum / cluster.samples,
        lng: cluster.lngSum / cluster.samples,
        ts: cluster.lastTs || cluster.firstTs,
        firstTs: cluster.firstTs || cluster.lastTs || "",
        lastTs: cluster.lastTs || cluster.firstTs || "",
        acc: cluster.acc,
        samples: cluster.samples
      };
    });
  }

  function locationMapsUrl(point) {
    var normalized = normalizeLocationPoint(point);
    if (!normalized) return "";
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(normalized.lat.toFixed(6) + "," + normalized.lng.toFixed(6));
  }

  function locationHistoryWithCurrent(locInfo) {
    var history = Array.isArray(locInfo && locInfo.history) ? locInfo.history.slice() : [];
    var current = normalizeLocationPoint(locInfo && locInfo.current);
    if (current) {
      history.push({
        lat: current.lat,
        lng: current.lng,
        ts: current.ts || (locInfo && locInfo.lastTs) || "",
        acc: current.acc
      });
    }
    return history;
  }

  function getAppSessionInfo() {
    if (!isObject(appData)) return null;
    return {
      startDate: appData.startDate || null,
      lastOpenedDate: appData.lastOpenedDate || null,
      lastOpenedAt: appData.lastOpenedAt || null,
      savedAt: appData.savedAt || null,
      dayCount: isObject(appData.days) ? Object.keys(appData.days).length : 0
    };
  }

  function getDaySavedAt(date) {
    var day = getDay(date);
    if (!isObject(day)) return null;
    return day.savedAt || null;
  }

  function getTarget(key, fallback) {
    if (!isObject(appData) || !isObject(appData.settings) || !isObject(appData.settings.targets)) return fallback;
    var v = numberOrNull(appData.settings.targets[key]);
    return v !== null ? v : fallback;
  }

  function fmtDuration(mins) {
    var n = safeNumber(mins);
    if (n === null || n <= 0) return "";
    if (n < 60) return n + " dk";
    var h = Math.floor(n / 60), r = Math.round(n % 60);
    return r ? h + " sa " + r + " dk" : h + " sa";
  }

  // ── Metric helpers ───────────────────────────────────────────────────────
  function metricSeries(date, getter) {
    return lastNDates(7, date).map(function(d) {
      return d ? getter(getDay(d) || {}) : null;
    });
  }

  function metricDelta(values, inverse) {
    var numbers = (Array.isArray(values) ? values : []).map(safeNumber).filter(function(v) { return v !== null; });
    if (numbers.length < 2) return { value: "→", tone: "muted", label: "Karşılaştırma için yeterli veri yok" };
    var current = numbers[numbers.length - 1];
    var previous = numbers[numbers.length - 2];
    if (current === previous) return { value: "→", tone: "info", label: "Önceki kayda göre değişmedi" };
    var rising = current > previous;
    var positive = inverse ? !rising : rising;
    return {
      value: rising ? "↑" : "↓",
      tone: positive ? "ok" : "drop",
      label: rising ? "Önceki kayda göre yükseldi" : "Önceki kayda göre düştü"
    };
  }

  function renderHeroGrid(date) {
    var day = getDay(date) || {};
    var yesterday = getDay(dateOffset(date, -1)) || {};

    var mood = getMood(day);
    var moodText = mood.label ? mood.label : (mood.raw ? ("ID: " + mood.raw) : "—");
    var moodSub = mood.note ? mood.note : (mood.raw ? "ID: " + mood.raw : "");

    var sleepH = getSleepHours(yesterday);
    var sleepQ = getSleepQuality(yesterday);
    var sleepText = formatHours(sleepH) || "—";
    var sleepSub = sleepQ !== null ? "Kalite: " + sleepQ + "/10" : "";

    var sosCount = safeNumber(day.cravingSOSCount) || 0;
    var sosText = sosCount > 0 ? sosCount.toString() : "—";
    var sosSub = sosCount > 0 ? "SOS kaydı" : "Sessiz";

    var steps = getSteps(day);
    var stepsText = steps !== null ? steps.toLocaleString("tr-TR") : "—";

    var moodSeries = metricSeries(date, function(d) { return getMood(d).value; });
    var sleepSeries = metricSeries(date, function(d) { return getSleepHours(getDay(dateOffset(d, -1)) || {}); });
    var sosSeries = metricSeries(date, function(d) {
      if (!isObject(d) || d.cravingSOSCount === undefined) return null;
      return safeNumber(d.cravingSOSCount);
    });
    var stepsSeries = metricSeries(date, getSteps);

    return '<div class="ae-grid--hero ae-stagger">' +
           AeMetric({
             icon: "mood", title: "Mod", value: moodText, countValue: mood.value, countFormat: "mood", countBadge: true, color: "mood", sub: moodSub,
             sparkline: moodSeries, delta: metricDelta(moodSeries),
             ring: { value: mood.value === null ? 0 : (mood.value / 7) * 100, color: "accent", label: "Mod ilerlemesi" }
           }) +
           AeMetric({
             icon: "sleep", title: "Uyku", value: sleepText, countValue: sleepH, countFormat: "hours", color: "sleep", sub: sleepSub,
             sparkline: sleepSeries, delta: metricDelta(sleepSeries),
             ring: { value: sleepH === null ? 0 : (sleepH / 8) * 100, color: "info", label: "Uyku hedefi" }
           }) +
           AeMetric({
             icon: "sos", title: "SOS", value: sosText, countValue: sosCount > 0 ? sosCount : null, countFormat: "integer", color: sosCount > 0 ? "drop" : "ok", sub: sosSub,
             sparkline: sosSeries, delta: metricDelta(sosSeries, true),
             ring: { value: Math.min(100, sosCount * 20), color: sosCount > 0 ? "drop" : "ok", label: "SOS yoğunluğu" }
           }) +
           AeMetric({
             icon: "steps", title: "Adım", value: stepsText, countValue: steps, countFormat: "integer", color: "info", unit: steps !== null ? "adım" : null,
             sparkline: stepsSeries, delta: metricDelta(stepsSeries),
             ring: { value: steps === null ? 0 : (steps / (getTarget("steps", 10000))) * 100, color: "info", label: "Adım hedefi" }
           }) +
           "</div>";
  }

  // ── SVG sparkline ────────────────────────────────────────────────────────
  function sparklinePath(segment) {
    return segment.map(function(point, index) {
      return (index ? "L " : "M ") + point.x.toFixed(2) + " " + point.y.toFixed(2);
    }).join(" ");
  }

  function sparklineAreaPath(segment, baseline) {
    if (!segment.length) return "";
    return "M " + segment[0].x.toFixed(2) + " " + baseline.toFixed(2) +
           " L " + segment.map(function(point) {
             return point.x.toFixed(2) + " " + point.y.toFixed(2);
           }).join(" L ") +
           " L " + segment[segment.length - 1].x.toFixed(2) + " " + baseline.toFixed(2) + " Z";
  }

  function AeSparkline(data, color, height, label) {
    var values = Array.isArray(data) ? data.slice(0, 30).map(function(value) {
      return value === null || value === undefined || value === "" ? null : safeNumber(value);
    }) : [];
    var valid = values.filter(function(value) { return value !== null; });
    var colorKey = String(color || "accent").toLowerCase();
    if (colorKey === "mood") colorKey = "accent";
    if (!AE_RING_COLORS[colorKey]) colorKey = "accent";
    var h = safeNumber(height);
    h = h === null ? 42 : Math.max(24, Math.min(120, Math.round(h)));
    var width = 160;
    var pad = 4;
    var baseline = h - pad;
    var title = safeText(label || "Son 7 gün trendi", 100);
    var baseClass = "ae-sparkline ae-sparkline--" + colorKey;
    var viewBox = 'viewBox="0 0 ' + width + " " + h + '"';
    if (!valid.length) {
      return '<div class="' + baseClass + ' ae-sparkline--empty" role="img" aria-label="' +
             escapeHtml(title + ": veri yok") + '">' +
             '<svg class="ae-sparkline__svg" ' + viewBox + ' aria-hidden="true" focusable="false">' +
             '<line class="ae-sparkline__empty-line" x1="' + pad + '" y1="' + (h / 2).toFixed(2) +
             '" x2="' + (width - pad) + '" y2="' + (h / 2).toFixed(2) + '"></line>' +
             "</svg>" +
             '<span class="ae-sparkline__empty-label" aria-hidden="true">—</span>' +
             "</div>";
    }

    var min = Math.min.apply(Math, valid);
    var max = Math.max.apply(Math, valid);
    var range = max - min || 1;
    var span = width - (pad * 2);
    var innerHeight = h - (pad * 2);
    var points = values.map(function(value, index) {
      if (value === null) return null;
      var x = values.length === 1 ? width / 2 : pad + (index / (values.length - 1)) * span;
      var y = max === min ? h / 2 : pad + ((max - value) / range) * innerHeight;
      return { x: x, y: y, value: value };
    });
    var segments = [];
    var segment = [];
    points.forEach(function(point) {
      if (point) {
        segment.push(point);
      } else if (segment.length) {
        segments.push(segment);
        segment = [];
      }
    });
    if (segment.length) segments.push(segment);

    var linePaths = segments.map(sparklinePath).map(function(path) {
      return '<path class="ae-sparkline__line" d="' + path + '"></path>';
    }).join("");
    var areaPaths = segments.map(function(pointsInSegment) {
      return '<path class="ae-sparkline__area" d="' + sparklineAreaPath(pointsInSegment, baseline) + '"></path>';
    }).join("");
    var validPoints = points.filter(Boolean);
    var lastPoint = validPoints.length ? validPoints[validPoints.length - 1] : null;
    var dots = validPoints.map(function(point) {
      var isLast = point === lastPoint;
      return '<circle class="ae-sparkline__dot" cx="' + point.x.toFixed(2) +
             '" cy="' + point.y.toFixed(2) + '" r="' + (isLast ? "3.75" : "2.5") +
             '" data-last="' + (isLast ? "true" : "false") + '" aria-hidden="true"></circle>';
    }).join("");

    return '<div class="' + baseClass + '" role="img" aria-label="' + escapeHtml(title) + '">' +
           '<svg class="ae-sparkline__svg" ' + viewBox +
           ' preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
           areaPaths + linePaths + dots +
           "</svg></div>";
  }

  function renderTrendStrip(date) {
    var dates = lastNDates(7, date);
    var metrics = [
      { key: "mood", label: "Mod", color: "accent" },
      { key: "sleep", label: "Uyku", color: "info" },
      { key: "steps", label: "Adım", color: "info" },
      { key: "water", label: "Su", color: "ok" }
    ];
    var html = '<div class="ae-card ae-card--glass ae-slide-up trend-strip">' +
               '<div class="ae-label">Son 7 gün</div>';
    metrics.forEach(function(meta) {
      var values = [];
      dates.forEach(function(d) {
        var day = d ? (getDay(d) || {}) : {};
        var v = null;
        if (meta.key === "mood") { var m = getMood(day); v = m.value; }
        else if (meta.key === "sleep") v = getSleepHours(day);
        else if (meta.key === "steps") v = getSteps(day);
        else if (meta.key === "water") v = getWater(day);
        values.push(v);
      });
      var latestValue = null;
      for (var i = values.length - 1; i >= 0; i--) {
        if (countNumber(values[i]) !== null) {
          latestValue = values[i];
          break;
        }
      }
      var countFormat = meta.key === "mood" ? "mood" : meta.key === "sleep" ? "hours" :
        meta.key === "steps" ? "integer" : "decimal";
      html += '<div class="trend-strip__row">' +
              '<div class="trend-strip__label">' + escapeHtml(meta.label) + "</div>" +
              '<div class="trend-strip__value ae-count-up"' + countTargetAttrs(latestValue, countFormat) + '>' +
              escapeHtml(formatCountValue(latestValue, countFormat)) + "</div>" +
              '<div class="trend-strip__sparkline">';
      html += AeSparkline(values, meta.color, 42, meta.label + " son 7 gün");
      html += "</div></div>";
    });
    html += "</div>";
    return html;
  }

  // ── Quick notes / therapy share card ────────────────────────────────────
  function renderQuickNotes(date) {
    var day = getDay(date) || {};
    var items = [];
    if (day.journal && day.journal.text) items.push({ kind: "Günlük", icon: "journal", detail: String(day.journal.text || "") });
    if (day.note) items.push({ kind: "Not", icon: "note", detail: String(day.note || "") });
    if (day.intention) items.push({ kind: "Niyet", icon: "intention", detail: String(day.intention || "") });
    if (day.gratitude) {
      if (Array.isArray(day.gratitude)) {
        items.push({ kind: "Şükür", icon: "gratitude", detail: day.gratitude.map(function(x){ return "• " + String(x || ""); }).join("\n") });
      } else {
        items.push({ kind: "Şükür", icon: "gratitude", detail: String(day.gratitude || "") });
      }
    }
    var therapy = getTherapy(day);
    var share = therapy.share || {};
    if (share.text || share.note || share.summary) {
      items.push({ kind: "Terapi paylaşımı", icon: "shield", redacted: true, detail: "Ham terapi notu gizli; özet güvenli gösterilebilir." });
    }

    if (!items.length) return "";

    var chips = items.map(function(it) {
      return '<span class="ae-chip ' + (it.redacted ? "ae-chip--redacted" : "") + '">' +
             renderIcon(it.icon, 15) + escapeHtml(it.kind) +
             (it.redacted ? ' <span class="ae-chip__hint">redacted</span>' : "") +
             "</span>";
    }).join("");

    var list = items.map(function(it) {
      var body = it.detail ? '<div class="quick-notes__detail">' + nl2br(escapeHtml(it.detail)) + "</div>" : "";
      return '<div class="quick-notes__item ' + (it.redacted ? "quick-notes__item--redacted" : "") + '">' +
             '<div class="quick-notes__kind">' + renderIcon(it.icon, 15) + escapeHtml(it.kind) + (it.redacted ? ' <span class="ae-chip__hint">gizli</span>' : "") + "</div>" +
             body +
             "</div>";
    }).join("");

    return AeCard({
      variant: "glass",
      className: "today-section-card today-section-card--notes",
      children: '<div class="quick-notes">' +
                '<div class="ae-label">Hızlı notlar</div>' +
                '<div class="quick-notes__chips">' + chips + "</div>" +
                '<div class="quick-notes__list">' + list + "</div>" +
                "</div>"
    });
  }

  // ── Date picker ────────────────────────────────────────────────────────
  function renderDatePicker() {
    var today = isoDate(new Date());
    var isToday = ui.date === today;
    var dateText = isToday ? "Bugün" : formatDateLabel(ui.date);
    return '<div class="ae-card ae-card--outline ae-card--summary date-picker">' +
           AeButton({ labelHtml: renderIcon("arrowLeft", 16), variant: "mini", className: "date-picker__nav", onclick: "AeonV2.shiftDate(-1)", ariaLabel: "Önceki gün" }) +
           '<div class="date-picker__display">' +
           '<div class="date-picker__label">' + escapeHtml(dateText) + "</div>" +
           '<div class="date-picker__iso">' + escapeHtml(ui.date) + "</div>" +
           "</div>" +
           AeButton({ labelHtml: renderIcon("arrowRight", 16), variant: "mini", className: "date-picker__nav", onclick: "AeonV2.shiftDate(1)", ariaLabel: "Sonraki gün" }) +
           AeButton({ label: "Detay", variant: "text", onclick: "AeonV2.goToDayDetail()" }) +
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

  function swipeViewportEnabled() {
    if (typeof root.matchMedia !== "function") return false;
    try {
      return root.matchMedia("(max-width: 460px)").matches;
    } catch (e) {
      return true;
    }
  }

  function pullRefreshAtTop(app) {
    var doc = root.document;
    var scrollValues = [];
    if (app) {
      scrollValues.push(app.scrollTop);
      if (typeof app.querySelector === "function") {
        var body = app.querySelector(".ae-app__body");
        if (body) scrollValues.push(body.scrollTop);
      }
    }
    scrollValues.push(root.scrollY, root.pageYOffset);
    if (doc && doc.documentElement) scrollValues.push(doc.documentElement.scrollTop);
    if (doc && doc.body) scrollValues.push(doc.body.scrollTop);
    var top = 0;
    scrollValues.forEach(function(value) {
      var n = safeNumber(value);
      if (n !== null) top = Math.max(top, n);
    });
    return top <= 0;
  }

  function swipeExcludedTarget(target) {
    if (!target || typeof target.closest !== "function") return false;
    return !!target.closest("a,button,input,select,textarea,summary,[contenteditable=\"true\"],.loc-map,.ae-tabs,.sub-tabs");
  }

  function clearSwipeBinding() {
    if (!swipeBinding.element || !swipeBinding.handlers || typeof swipeBinding.element.removeEventListener !== "function") {
      swipeBinding.element = null;
      swipeBinding.handlers = null;
      return;
    }
    swipeBinding.element.removeEventListener("touchstart", swipeBinding.handlers.start);
    swipeBinding.element.removeEventListener("touchmove", swipeBinding.handlers.move);
    swipeBinding.element.removeEventListener("touchend", swipeBinding.handlers.end);
    swipeBinding.element.removeEventListener("touchcancel", swipeBinding.handlers.cancel);
    swipeBinding.element = null;
    swipeBinding.handlers = null;
  }

  function initSwipeGestures(app) {
    clearSwipeBinding();
    var mobile = swipeViewportEnabled();
    var swipeEnabled = ui.tab === "day" && mobile;
    var pullEnabled = mobile;
    if ((!swipeEnabled && !pullEnabled) || !app || typeof app.addEventListener !== "function") return;

    var gesture = {
      active: false,
      canceled: false,
      horizontal: false,
      startX: 0,
      startY: 0,
      pullCandidate: false,
      pullActive: false,
      pullDistance: 0
    };
    var threshold = 50;

    function pointFromTouchList(list) {
      return list && list.length ? list[0] : null;
    }

    function onTouchStart(event) {
      var touch = pointFromTouchList(event && event.touches);
      if (!touch || (event.touches && event.touches.length !== 1) || swipeExcludedTarget(event.target)) {
        gesture.active = false;
        return;
      }
      gesture.active = true;
      gesture.canceled = false;
      gesture.horizontal = false;
      gesture.startX = Number(touch.clientX) || 0;
      gesture.startY = Number(touch.clientY) || 0;
      gesture.pullCandidate = pullEnabled && !pullRefresh.refreshing && pullRefreshAtTop(app);
      gesture.pullActive = false;
      gesture.pullDistance = 0;
    }

    function onTouchMove(event) {
      if (!gesture.active) return;
      var touch = pointFromTouchList(event && event.touches);
      if (!touch) return;
      var dx = (Number(touch.clientX) || 0) - gesture.startX;
      var dy = (Number(touch.clientY) || 0) - gesture.startY;

      if (gesture.pullActive) {
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
          gesture.pullActive = false;
          gesture.pullCandidate = false;
          gesture.canceled = true;
          updatePullRefreshIndicator("idle", 0);
          return;
        }
        gesture.pullDistance = Math.min(PULL_REFRESH_MAX_DISTANCE, dy);
        updatePullRefreshIndicator(
          gesture.pullDistance >= PULL_REFRESH_THRESHOLD ? "ready" : "pulling",
          gesture.pullDistance
        );
        if (event && event.cancelable && typeof event.preventDefault === "function") event.preventDefault();
        return;
      }

      if (gesture.pullCandidate && dy > 0 && Math.abs(dy) >= Math.abs(dx) && Math.abs(dy) >= 10) {
        gesture.pullActive = true;
        gesture.pullDistance = Math.min(PULL_REFRESH_MAX_DISTANCE, dy);
        updatePullRefreshIndicator(
          gesture.pullDistance >= PULL_REFRESH_THRESHOLD ? "ready" : "pulling",
          gesture.pullDistance
        );
        if (event && event.cancelable && typeof event.preventDefault === "function") event.preventDefault();
        return;
      }

      if (gesture.pullCandidate && (dy < 0 || Math.abs(dx) > Math.abs(dy))) {
        gesture.pullCandidate = false;
      }

      if (!swipeEnabled) return;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) >= 10) {
        gesture.canceled = true;
        gesture.horizontal = false;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 10) {
        gesture.horizontal = true;
        if (event && event.cancelable && typeof event.preventDefault === "function") event.preventDefault();
      }
    }

    function onTouchEnd(event) {
      if (!gesture.active) return;
      var touch = pointFromTouchList(event && event.changedTouches) || pointFromTouchList(event && event.touches);
      var dx = touch ? (Number(touch.clientX) || 0) - gesture.startX : 0;
      if (gesture.pullActive) {
        var shouldRefresh = gesture.pullDistance >= PULL_REFRESH_THRESHOLD;
        gesture.active = false;
        gesture.pullActive = false;
        gesture.pullCandidate = false;
        gesture.pullDistance = 0;
        if (shouldRefresh) refresh();
        else updatePullRefreshIndicator("idle", 0);
        return;
      }
      var shouldShift = gesture.horizontal && !gesture.canceled && Math.abs(dx) >= threshold;
      gesture.active = false;
      if (!shouldShift) return;
      // Sol: sonraki gün, sağ: önceki gün.
      shiftDate(dx < 0 ? 1 : -1);
    }

    function onTouchCancel() {
      gesture.active = false;
      gesture.canceled = true;
      gesture.horizontal = false;
      gesture.pullCandidate = false;
      gesture.pullActive = false;
      gesture.pullDistance = 0;
      updatePullRefreshIndicator("idle", 0);
    }

    var handlers = { start: onTouchStart, move: onTouchMove, end: onTouchEnd, cancel: onTouchCancel };
    app.addEventListener("touchstart", handlers.start, { passive: true });
    app.addEventListener("touchmove", handlers.move, { passive: false });
    app.addEventListener("touchend", handlers.end, { passive: true });
    app.addEventListener("touchcancel", handlers.cancel, { passive: true });
    swipeBinding.element = app;
    swipeBinding.handlers = handlers;
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
    var m = getMood(day);
    var hasMood = m.value !== null;
    var hasDetail = !!(day.sleep || day.water != null || day.health || day.journal || day.note || day.prayer || day.reading || day.watching || day.listening || day.learning || day.therapy || day.movement || day.meals || day.mealItems || day.soulActivities || day.zikr || day.saygi);
    return hasMood && !hasDetail;
  }

  function getGoal(key, fallback) {
    return getTarget(key, fallback);
  }

  function summaryForWindow(endDate, days) {
    var dates = lastNDates(days, endDate);
    var moods = [], sleeps = [], steps = [], waters = [], sosCounts = [], missing = 0, moh = 0, maxMoh = 0;
    var moodSeries = [], sleepSeries = [], stepsSeries = [], waterSeries = [], sosSeries = [], missingSeries = [], mohSeries = [];
    dates.forEach(function(d) {
      var day = getDay(d);
      if (!day) {
        missing++;
        maxMoh = 0;
        moodSeries.push(null);
        sleepSeries.push(null);
        stepsSeries.push(null);
        waterSeries.push(null);
        sosSeries.push(null);
        missingSeries.push(1);
        mohSeries.push(null);
        return;
      }
      missing = 0;
      var quickEntry = isQuickEntry(day);
      if (quickEntry) { moh++; maxMoh = Math.max(maxMoh, moh); }
      else { maxMoh = Math.max(maxMoh, moh); moh = 0; }
      var m = getMood(day); moodSeries.push(m.value); if (m.value !== null) moods.push(m.value);
      var sh = getSleepHours(day); sleepSeries.push(sh); if (sh !== null) sleeps.push(sh);
      var s = getSteps(day); stepsSeries.push(s); if (s !== null) steps.push(s);
      var w = getWater(day); waterSeries.push(w); if (w !== null) waters.push(w);
      var sos = safeNumber(day.cravingSOSCount) || 0;
      sosCounts.push(sos);
      sosSeries.push(sos);
      missingSeries.push(0);
      mohSeries.push(quickEntry ? 1 : 0);
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
      _sos: sosCounts,
      _moodSeries: moodSeries,
      _sleepSeries: sleepSeries,
      _stepsSeries: stepsSeries,
      _waterSeries: waterSeries,
      _sosSeries: sosSeries,
      _missingSeries: missingSeries,
      _mohSeries: mohSeries
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
    var trend = opts.trend || "→";
    var status = opts.status || "normal";
    var statusTone = { normal: "ok", attention: "warn", risk: "drop" }[status] || "info";
    return AeMetric({
      title: opts.title,
      value: value,
      countValue: opts.countValue,
      countFormat: opts.countFormat || "decimal",
      unit: opts.unit,
      color: opts.color || statusTone,
      compact: true,
      variant: opts.variant || "solid",
      status: status,
      sparkline: opts.sparkline,
      sparklineType: opts.sparklineType,
      sparklineColor: opts.sparklineColor,
      sparklineLimit: opts.sparklineLimit || opts.windowDays,
      sparklineHeight: opts.sparklineHeight,
      sparklineLabel: opts.sparklineLabel || (String(opts.title || "Metrik") + " son " + String(opts.windowDays || 7) + " gün"),
      delta: {
        value: trend,
        tone: statusTone,
        label: opts.delta || "Trend yönü"
      },
      sub: "Son " + String(opts.windowDays || 7) + " gün",
      className: opts.className
    });
  }

  function AnomalyCard(a) {
    a = a || {};
    var severity = safeText(a.severity || "info", 16).replace(/[^A-Za-z0-9_-]/g, "") || "info";
    var dateLabel = a.linkDate ? formatDateLabel(a.linkDate) : "";
    var body = '<div class="anomaly-card__row">' +
               '<div class="anomaly-card__icon">' + renderIcon({ sleep: "sleep", sos: "sos", missing: "dot", moh: "cloud", steps: "steps", water: "water" }[a.kind] || "dot", 18) + "</div>" +
               '<div class="anomaly-card__body">' +
               '<div class="anomaly-card__message">' + escapeHtml(a.message || "Dikkat gerektiren durum") + "</div>" +
               '<div class="anomaly-card__meta">' + escapeHtml(dateLabel) +
               '<span class="anomaly-card__severity anomaly-card__severity--' + escapeHtml(severity) + '">' + escapeHtml(severity) + "</span></div>" +
               "</div>" +
               AeButton({ label: "Detay gör", variant: "text", onclick: "AeonV2.goToDayDetail('" + escapeHtml(a.linkDate || "") + "')" }) +
               "</div>";
    return AeCard({
      variant: "gradient",
      className: "ae-card--summary anomaly-card anomaly-card--" + severity,
      children: body
    });
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

    return '<div class="ae-grid--summary ae-stagger">' +
           SummaryCard({ title: "Uyku ort.", value: fmtMean(s.sleepMean, 1), countValue: s.sleepMean, countFormat: "decimal", unit: "sa", windowDays: windowDays, trend: sleepTrend, status: sleepStatus, color: "info", sparkline: s._sleepSeries, sparklineType: "svg", sparklineColor: "info" }) +
           SummaryCard({ title: "Adım ort.", value: fmtMean(s.stepsMean, 0), countValue: s.stepsMean, countFormat: "integer", unit: "adım", windowDays: windowDays, trend: s.stepsMean !== null && prev.stepsMean !== null ? (s.stepsMean > prev.stepsMean ? "↑" : s.stepsMean < prev.stepsMean ? "↓" : "→") : "→", status: "normal", color: "info", sparkline: s._stepsSeries, sparklineType: "svg", sparklineColor: "info" }) +
           SummaryCard({ title: "Su ort.", value: fmtMean(s.waterMean, 1), countValue: s.waterMean, countFormat: "decimal", unit: "bardak", windowDays: windowDays, trend: s.waterMean !== null && prev.waterMean !== null ? (s.waterMean > prev.waterMean ? "↑" : s.waterMean < prev.waterMean ? "↓" : "→") : "→", status: "normal", color: "ok", sparkline: s._waterSeries, sparklineType: "svg", sparklineColor: "ok" }) +
           SummaryCard({ title: "SOS yoğ.", value: s.sosTotal, countValue: s.sosTotal, countFormat: "integer", unit: "kayıt", windowDays: windowDays, trend: sosTrend, status: sosStatus, color: s.sosTotal > 0 ? "drop" : "ok", sparkline: s._sosSeries, sparklineType: "svg", sparklineColor: s.sosTotal > 0 ? "drop" : "ok" }) +
           SummaryCard({ title: "Eksik gün", value: s.missingDays, countValue: s.missingDays, countFormat: "integer", unit: "gün", windowDays: windowDays, trend: "→", status: missingStatus, color: missingStatus === "risk" ? "drop" : "warn", sparkline: s._missingSeries, sparklineType: "svg", sparklineColor: missingStatus === "risk" ? "drop" : "warn" }) +
           SummaryCard({ title: "MOH gün", value: s.mohStreak, countValue: s.mohStreak, countFormat: "integer", unit: "gün", windowDays: windowDays, trend: "→", status: mohStatus, color: mohStatus === "risk" ? "drop" : "accent", sparkline: s._mohSeries, sparklineType: "svg", sparklineColor: mohStatus === "risk" ? "drop" : "accent" }) +
           "</div>";
  }

  function renderMoodTrendChart(endDate) {
    var dates = lastNDates(30, endDate);
    var width = 720;
    var height = 280;
    var pad = { top: 22, right: 16, bottom: 42, left: 42 };
    var plotWidth = width - pad.left - pad.right;
    var plotHeight = height - pad.top - pad.bottom;
    var baseline = pad.top + plotHeight;
    var values = dates.map(function(date) {
      if (!date) return null;
      var mood = getMood(getDay(date) || {}).value;
      if (mood === null) return null;
      var n = safeNumber(mood);
      return n === null ? null : Math.max(1, Math.min(5, n));
    });
    var points = values.map(function(value, index) {
      if (value === null) return null;
      var x = dates.length === 1 ? width / 2 : pad.left + (index / (dates.length - 1)) * plotWidth;
      var y = pad.top + ((5 - value) / 4) * plotHeight;
      return { x: x, y: y, value: value, date: dates[index] };
    });
    var segments = [];
    var segment = [];
    points.forEach(function(point) {
      if (point) {
        segment.push(point);
      } else if (segment.length) {
        segments.push(segment);
        segment = [];
      }
    });
    if (segment.length) segments.push(segment);

    var gridLines = [];
    for (var moodLevel = 5; moodLevel >= 1; moodLevel--) {
      var y = pad.top + ((5 - moodLevel) / 4) * plotHeight;
      gridLines.push('<line class="ae-mood-chart__grid-line" x1="' + pad.left +
        '" y1="' + y.toFixed(2) + '" x2="' + (width - pad.right) +
        '" y2="' + y.toFixed(2) + '"></line>');
      gridLines.push('<text class="ae-mood-chart__y-label" x="' + (pad.left - 10) +
        '" y="' + (y + 4).toFixed(2) + '" text-anchor="end">' + moodLevel + '</text>');
    }

    var xLabels = dates.map(function(date, index) {
      if (!date || (index % 5 !== 0 && index !== dates.length - 1)) return "";
      var x = pad.left + (index / Math.max(1, dates.length - 1)) * plotWidth;
      return '<text class="ae-mood-chart__x-label" data-day-index="' + index +
        '" x="' + x.toFixed(2) + '" y="' + (height - 14) +
        '" text-anchor="middle">' + escapeHtml(formatDateLabel(date).slice(0, 5)) + '</text>';
    }).join("");

    var areaPaths = segments.map(function(pointsInSegment) {
      return '<path class="ae-mood-chart__area" d="' +
        sparklineAreaPath(pointsInSegment, baseline) + '"></path>';
    }).join("");
    var linePaths = segments.map(function(pointsInSegment) {
      return '<path class="ae-mood-chart__line" d="' + sparklinePath(pointsInSegment) + '"></path>';
    }).join("");
    var dots = points.filter(Boolean).map(function(point) {
      var label = formatDateLabel(point.date) + ": " + point.value + "/5";
      return '<circle class="ae-mood-chart__point" cx="' + point.x.toFixed(2) +
        '" cy="' + point.y.toFixed(2) + '" r="4" tabindex="0" focusable="true"' +
        ' data-date="' + escapeHtml(point.date) + '" data-value="' + point.value +
        '" aria-label="' + escapeHtml(label) + '">' +
        '<title>' + escapeHtml(label) + '</title></circle>';
    }).join("");
    var empty = points.filter(Boolean).length ? "" :
      '<text class="ae-mood-chart__empty" x="' + (pad.left + plotWidth / 2) +
      '" y="' + (pad.top + plotHeight / 2) + '" text-anchor="middle">Mod verisi yok</text>';

    return AeCard({
      variant: "glass",
      className: "ae-mood-chart-card",
      children: '<section class="ae-mood-chart" aria-labelledby="ae-mood-chart-title">' +
        '<div class="ae-mood-chart__head">' +
        '<div><div class="ae-label" id="ae-mood-chart-title">Mod Trendi</div>' +
        '<div class="ae-mood-chart__subtitle">Son 30 gün · 1–5 arası ruh hali</div></div>' +
        '<span class="ae-chip ae-chip--accent">30 gün</span>' +
        '</div>' +
        '<div class="ae-mood-chart__plot">' +
        '<svg class="ae-mood-chart__svg" viewBox="0 0 ' + width + ' ' + height +
        '" preserveAspectRatio="none" role="img" aria-label="Son 30 gün mod trendi" focusable="false">' +
        gridLines.join("") + xLabels + areaPaths + linePaths + dots + empty +
        '</svg></div>' +
        '</section>'
    });
  }

  function renderMetricChart(metricKey, data, color) {
    var configs = {
      sleep: { key: "sleep", icon: "sleep", title: "Uyku Trendi", unit: "sa", min: 0, max: 12, targetKey: "sleepHours", target: 8 },
      steps: { key: "steps", icon: "steps", title: "Adım Trendi", unit: "adım", min: 0, max: 12000, targetKey: "steps", target: 10000 },
      water: { key: "water", icon: "water", title: "Su Trendi", unit: "bardak", min: 0, max: 12, targetKey: "waterGlasses", target: 8 }
    };
    var config = configs[String(metricKey)] || configs.sleep;
    var windowDays = data && !Array.isArray(data) && safeNumber(data.windowDays) !== null
      ? Math.max(1, Math.min(30, Math.round(safeNumber(data.windowDays)))) : 30;
    var sourceValues = Array.isArray(data) ? data : data && Array.isArray(data.values) ? data.values : [];
    var sourceDates = data && Array.isArray(data.dates) ? data.dates : lastNDates(sourceValues.length || windowDays, todayStr());
    var values = sourceValues.slice(0, windowDays).map(function(value) {
      if (value === null || value === undefined || value === "") return null;
      var n = safeNumber(value);
      return n === null ? null : Math.max(config.min, Math.min(config.max, n));
    });
    var dates = sourceDates.slice(0, values.length);
    var targetSource = data && !Array.isArray(data) && data.target !== undefined
      ? data.target
      : getTarget(config.targetKey, config.target);
    var target = safeNumber(targetSource);
    if (target !== null) target = Math.max(config.min, Math.min(config.max, target));

    var width = 720;
    var height = 248;
    var pad = { top: 22, right: 16, bottom: 40, left: 54 };
    var plotWidth = width - pad.left - pad.right;
    var plotHeight = height - pad.top - pad.bottom;
    var baseline = pad.top + plotHeight;
    var points = values.map(function(value, index) {
      if (value === null) return null;
      var x = values.length === 1 ? width / 2 : pad.left + (index / Math.max(1, values.length - 1)) * plotWidth;
      var y = pad.top + ((config.max - value) / (config.max - config.min)) * plotHeight;
      return { x: x, y: y, value: value, date: dates[index] || null };
    });
    var segments = [];
    var segment = [];
    points.forEach(function(point) {
      if (point) {
        segment.push(point);
      } else if (segment.length) {
        segments.push(segment);
        segment = [];
      }
    });
    if (segment.length) segments.push(segment);

    function formatValue(value) {
      if (value === null || value === undefined) return "—";
      var digits = config.key === "steps" ? 0 : 1;
      return value.toLocaleString("tr-TR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
    }

    var yTicks = [config.max, (config.max + config.min) / 2, config.min];
    var gridLines = yTicks.map(function(value) {
      var y = pad.top + ((config.max - value) / (config.max - config.min)) * plotHeight;
      return '<line class="ae-metric-chart__grid-line" x1="' + pad.left +
        '" y1="' + y.toFixed(2) + '" x2="' + (width - pad.right) +
        '" y2="' + y.toFixed(2) + '"></line>' +
        '<text class="ae-metric-chart__y-label" x="' + (pad.left - 10) +
        '" y="' + (y + 4).toFixed(2) + '" text-anchor="end">' +
        escapeHtml(formatValue(value)) + '</text>';
    }).join("");
    var xLabels = dates.map(function(date, index) {
      if (!date || (index % 5 !== 0 && index !== dates.length - 1)) return "";
      var x = pad.left + (index / Math.max(1, values.length - 1)) * plotWidth;
      return '<text class="ae-metric-chart__x-label" data-day-index="' + index +
        '" x="' + x.toFixed(2) + '" y="' + (height - 13) +
        '" text-anchor="middle">' + escapeHtml(formatDateLabel(date).slice(0, 5)) + '</text>';
    }).join("");
    var areaPaths = segments.map(function(pointsInSegment) {
      return '<path class="ae-metric-chart__area" d="' +
        sparklineAreaPath(pointsInSegment, baseline) + '"></path>';
    }).join("");
    var linePaths = segments.map(function(pointsInSegment) {
      return '<path class="ae-metric-chart__line" d="' +
        sparklinePath(pointsInSegment) + '"></path>';
    }).join("");
    var dots = points.filter(Boolean).map(function(point) {
      var label = point.date ? formatDateLabel(point.date) + ": " : "";
      label += formatValue(point.value) + " " + config.unit;
      return '<circle class="ae-metric-chart__point" cx="' + point.x.toFixed(2) +
        '" cy="' + point.y.toFixed(2) + '" r="3.5" tabindex="0" focusable="true"' +
        ' data-date="' + escapeHtml(point.date || "") + '" data-value="' + point.value +
        '" aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) +
        '</title></circle>';
    }).join("");
    var targetLine = target === null ? "" : (function() {
      var y = pad.top + ((config.max - target) / (config.max - config.min)) * plotHeight;
      var label = "Hedef: " + formatValue(target) + " " + config.unit;
      return '<line class="ae-metric-chart__target" x1="' + pad.left +
        '" y1="' + y.toFixed(2) + '" x2="' + (width - pad.right) +
        '" y2="' + y.toFixed(2) + '" data-target="' + target +
        '" aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) +
        '</title></line>';
    })();
    var empty = points.filter(Boolean).length ? "" :
      '<text class="ae-metric-chart__empty" x="' + (pad.left + plotWidth / 2) +
      '" y="' + (pad.top + plotHeight / 2) + '" text-anchor="middle">Veri yok</text>';
    var colorKey = ["info", "ok", "accent", "warn", "drop"].indexOf(String(color)) !== -1 ? String(color) : "info";
    var titleId = "ae-metric-chart-title-" + config.key;
    var gradientId = "ae-metric-chart-fill-" + config.key;

    return AeCard({
      variant: "glass",
      className: "ae-metric-chart-card ae-metric-chart-card--" + config.key,
      children: '<section class="ae-metric-chart ae-metric-chart--' + colorKey + '" aria-labelledby="' + titleId + '">' +
        '<div class="ae-metric-chart__head">' +
        '<div><div class="ae-label" id="' + titleId + '">' + renderIcon(config.icon, 16) + " " + escapeHtml(config.title) + '</div>' +
        '<div class="ae-metric-chart__subtitle">Son ' + windowDays + ' gün · 0–' + escapeHtml(formatValue(config.max)) + " " + escapeHtml(config.unit) + '</div></div>' +
        '<span class="ae-chip ae-metric-chart__target-chip">Hedef ' + escapeHtml(formatValue(target)) + " " + escapeHtml(config.unit) + '</span>' +
        '</div><div class="ae-metric-chart__plot"><svg class="ae-metric-chart__svg" viewBox="0 0 ' + width + " " + height +
        '" preserveAspectRatio="none" role="img" aria-label="' + escapeHtml(config.title + ", son " + windowDays + " gün") + '" focusable="false">' +
        '<defs><linearGradient id="' + gradientId + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--ae-chart-color)" stop-opacity="0.32"></stop>' +
        '<stop offset="100%" stop-color="var(--ae-chart-color)" stop-opacity="0"></stop>' +
        '</linearGradient></defs>' + gridLines + xLabels + targetLine +
        areaPaths + linePaths + dots + empty + '</svg></div></section>'
    });
  }

  function renderMetricCharts(endDate) {
    var windowDays = arguments.length > 1 && safeNumber(arguments[1]) !== null ? Math.round(safeNumber(arguments[1])) : 30;
    windowDays = Math.max(1, Math.min(30, windowDays));
    var summary = summaryForWindow(endDate, windowDays);
    return '<div class="ae-metric-chart-grid ae-stagger" aria-label="Uyku, adım ve su trend grafikleri">' +
      renderMetricChart("sleep", { values: summary._sleepSeries, dates: summary.dates, windowDays: windowDays }, "info") +
      renderMetricChart("steps", { values: summary._stepsSeries, dates: summary.dates, windowDays: windowDays }, "info") +
      renderMetricChart("water", { values: summary._waterSeries, dates: summary.dates, windowDays: windowDays }, "ok") +
      '</div>';
  }

  // ── Geçmiş kullanıcı kayıtları ────────────────────────────────────────
  // Trend grafikleri ile metin/sayaç kayıtları aynı tarih penceresinden
  // beslenir. Bu katman yalnızca appData'yı okur; hiçbir alanı normalize ederek
  // kaynağa geri yazmaz.
  function historyDate(value) {
    var raw = String(value || "");
    var match = raw.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }

  function historyText(value, max) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(function(item) { return historyText(item, max); }).filter(Boolean).join("\n");
    if (isObject(value)) return "";
    return safeText(String(value).trim(), max || 240);
  }

  function historyRecord(records, seen, opts) {
    opts = opts || {};
    var source = safeText(opts.source || "Kayıt", 40);
    var title = safeText(opts.title || source, 120);
    var text = historyText(opts.text, 1800);
    var value = numberOrNull(opts.value);
    var target = numberOrNull(opts.target);
    var date = historyDate(opts.date);
    if (!text && value === null && target === null && !opts.redacted) return;
    var fingerprintText = String(opts.identity || text || title).toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
    var fingerprint = String(opts.id || "") || [date, source, title, fingerprintText, value === null ? "" : value].join("|");
    if (seen[fingerprint]) return;
    seen[fingerprint] = true;
    records.push({
      id: fingerprint,
      date: date,
      source: source,
      title: title,
      text: text,
      value: value,
      target: target,
      meta: safeText(opts.meta || "", 180),
      redacted: opts.redacted === true,
      percent: target !== null && target > 0 && value !== null ? Math.max(0, Math.min(100, Math.round(value / target * 100))) : null
    });
  }

  function historyWindowAllows(date, endDate, window) {
    if (window === "all") return true;
    if (!date) return false;
    var n = safeNumber(window);
    if (n === null) n = 7;
    return date >= dateOffset(endDate, -(Math.max(1, n) - 1)) && date <= endDate;
  }

  function addHistoryText(records, seen, date, source, title, text, meta, identity) {
    historyRecord(records, seen, {
      date: date,
      source: source,
      title: title,
      text: historyText(text, 1800) || (meta ? "Kayıtlı kullanıcı kaydı." : ""),
      meta: meta,
      identity: identity
    });
  }

  function addHistoryEntries(records, seen, date, entries, source, fallbackTitle) {
    if (!Array.isArray(entries)) return;
    entries.forEach(function(entry, index) {
      if (!isObject(entry)) return;
      var title = historyText(entry.title || entry.name || entry.topic || fallbackTitle, 120) || fallbackTitle;
      var note = historyText(entry.note || entry.text || "", 1800);
      var meta = [entry.author, entry.artist, entry.kind, entry.pages ? entry.pages + " sayfa" : "", entry.minutes ? entry.minutes + " dk" : "", entry.episodes ? entry.episodes + " bölüm" : ""].filter(Boolean).join(" · ");
      if (!note && !meta && !title) return;
      historyRecord(records, seen, {
        id: entry.id ? source + "|" + entry.id : "",
        date: date,
        source: source,
        title: title,
        text: note || "Kayıtlı içerik",
        meta: meta,
        value: numberOrNull(entry.pages !== undefined ? entry.pages : entry.minutes),
        identity: title + "|" + note + "|" + index
      });
    });
  }

  function addHistoryRootArchive(records, seen, root) {
    var library = isObject(root.library) ? root.library : {};
    (Array.isArray(library.books) ? library.books : []).forEach(function(book) {
      if (!isObject(book)) return;
      var date = historyDate(book.finishedAt || book.startedAt || book.createdAt);
      addHistoryText(records, seen, date, "Arşiv · Kütüphane", book.title || "Kitap notu", book.note, [book.author, book.status, book.rating ? book.rating + "/5" : ""].filter(Boolean).join(" · ") || "Kayıtlı kitap", book.id ? "archive-book|" + book.id : "");
      (Array.isArray(book.quotes) ? book.quotes : []).forEach(function(quote) {
        if (!isObject(quote)) return;
        addHistoryText(records, seen, historyDate(quote.ts || date), "Arşiv · Alıntı", book.title || "Kitap alıntısı", quote.text, quote.page ? "Sayfa " + quote.page : "", quote.id ? "archive-quote|" + quote.id : "");
      });
    });
    var watchlist = isObject(root.watchlist) ? root.watchlist : {};
    (Array.isArray(watchlist.items) ? watchlist.items : []).forEach(function(item) {
      if (!isObject(item)) return;
      var date = historyDate(item.finishedAt || item.startedAt || item.createdAt);
      addHistoryText(records, seen, date, "Arşiv · İzleme", item.title || "İzleme notu", item.note, [item.kind, item.status, item.rating ? item.rating + "/5" : ""].filter(Boolean).join(" · ") || "Kayıtlı izleme", item.id ? "archive-watch|" + item.id : "");
      (Array.isArray(item.quotes) ? item.quotes : []).forEach(function(quote) {
        if (!isObject(quote)) return;
        addHistoryText(records, seen, historyDate(quote.ts || date), "Arşiv · Alıntı", item.title || "İzleme alıntısı", quote.text, quote.page ? "Sayfa " + quote.page : "", quote.id ? "archive-quote|" + quote.id : "");
      });
    });
    var music = isObject(root.music) ? root.music : {};
    (Array.isArray(music.items) ? music.items : []).forEach(function(item) {
      if (!isObject(item)) return;
      var date = historyDate(item.createdAt);
      addHistoryText(records, seen, date, "Arşiv · Dinleme", item.title || "Dinleme notu", item.note, [item.artist, item.kind, item.rating ? item.rating + "/5" : ""].filter(Boolean).join(" · ") || "Kayıtlı dinleme", item.id ? "archive-music|" + item.id : "");
      (Array.isArray(item.quotes) ? item.quotes : []).forEach(function(quote) {
        if (!isObject(quote)) return;
        addHistoryText(records, seen, historyDate(quote.ts || date), "Arşiv · Alıntı", item.title || "Müzik alıntısı", quote.text, item.artist || "", quote.id ? "archive-quote|" + quote.id : "");
      });
    });
    var soulArchive = isObject(root.soulArchive) ? root.soulArchive : {};
    var soulItems = Array.isArray(root.soulArchive) ? root.soulArchive : (Array.isArray(soulArchive.items) ? soulArchive.items : []);
    soulItems.forEach(function(item) {
      if (!isObject(item)) return;
      addHistoryText(records, seen, historyDate(item.date || item.createdAt || item.savedAt), "Arşiv · Zihin-Beden", item.label || item.type || "Pratik", item.note, item.duration ? item.duration + " dk" : "Kayıtlı pratik", item.id ? "archive-soul|" + item.id : "");
    });
  }

  function collectHistoryRecords(endDate, window) {
    var root = isObject(appData) ? appData : {};
    var records = [], seen = {}, days = isObject(root.days) ? root.days : {};
    Object.keys(days).sort().forEach(function(date) {
      if (!historyWindowAllows(date, endDate, window)) return;
      var day = isObject(days[date]) ? days[date] : {};
      if (day.note) addHistoryText(records, seen, date, "Günün Notu", "Günün notu", day.note, "", "");
      var moodInfo = getMood(day);
      if (moodInfo.note) addHistoryText(records, seen, date, "Ruh Hali Notu", "Ruh hali notu", moodInfo.note, moodInfo.label || "", "");
      if (day.moodNote) addHistoryText(records, seen, date, "Ruh Hali Notu", "Ruh hali notu", day.moodNote, day.mood || "", "");
      if (day.intention) addHistoryText(records, seen, date, "Niyet", "Günün niyeti", day.intention, "", "");
      if (typeof day.journal === "string") addHistoryText(records, seen, date, "Günlük", "Günlük Işığı", day.journal, "", "");
      if (day.journal && day.journal.text) addHistoryText(records, seen, date, "Günlük", "Günlük Işığı", day.journal.text, day.journal.mode || "", "");
      ["notes", "otherNotes", "otherNote", "dailyNote", "freeNote", "noteText"].forEach(function(key) {
        var value = day[key];
        if (isObject(value)) value = value.text || value.note || value.body || "";
        if (value) addHistoryText(records, seen, date, "Diğer Notlar", key, value, "", "");
      });
      if (day.gratitude) {
        (Array.isArray(day.gratitude) ? day.gratitude : [day.gratitude]).forEach(function(item, index) {
          addHistoryText(records, seen, date, "Şükür", "Şükür " + (index + 1), item, "", "");
        });
      }
      var meals = getMeals(day);
      ["breakfast", "lunch", "dinner", "snack"].forEach(function(key) {
        if (meals[key]) addHistoryText(records, seen, date, "Beslenme", key, meals[key], "", "");
      });
      var mealItems = isObject(day.mealItems) ? day.mealItems : {};
      Object.keys(mealItems).forEach(function(key) {
        if (!Array.isArray(mealItems[key]) || !mealItems[key].length) return;
        var itemText = mealItems[key].map(function(item) {
          return isObject(item) ? [item.name, item.qty, item.unit].filter(Boolean).join(" ") : String(item || "");
        }).filter(Boolean).join("\n");
        addHistoryText(records, seen, date, "Beslenme", key + " içerikleri", itemText, mealItems[key].length + " kalem", "");
      });
      var caffeine = getCaffeine(day);
      if (caffeine.drinks && caffeine.drinks.length) {
        addHistoryText(records, seen, date, "Kafein", "Kafein kayıtları", caffeine.drinks.map(function(drink) {
          return isObject(drink) ? [drink.type, drink.qty, drink.time].filter(Boolean).join(" ") : String(drink || "");
        }).join("\n"), caffeine.drinks.length + " içecek", "");
      } else if (caffeine.cups || caffeine.last) {
        historyRecord(records, seen, { date: date, source: "Kafein", title: "Kafein toplamı", text: "Gün içi kafein kaydı", value: safeNumber(caffeine.cups) || 0, meta: caffeine.last ? "Son kayıt " + caffeine.last : "", identity: "caffeine|" + date });
      }
      if (day.cravingTriggerNote) addHistoryText(records, seen, date, "Kriz", "Tetikleyici notu", day.cravingTriggerNote, "", "");
      if (Array.isArray(day.cravingTriggers) && day.cravingTriggers.length) addHistoryText(records, seen, date, "Kriz", "Tetikleyiciler", day.cravingTriggers.join("\n"), day.cravingTriggers.length + " tetikleyici", "");
      if (safeNumber(day.cravingSOSCount) !== null && safeNumber(day.cravingSOSCount) > 0) {
        historyRecord(records, seen, { date: date, source: "Kriz", title: "SOS kullanımı", text: "Gün içi SOS aktivasyonu", value: safeNumber(day.cravingSOSCount), meta: "Kriz kaydı", identity: "sos|" + date });
      }
      var energyValue = numberOrNull(day.energy);
      var stressValue = numberOrNull(day.stress);
      if (energyValue !== null) historyRecord(records, seen, { date: date, source: "Enerji", title: "Enerji seviyesi", text: "Günlük enerji ölçümü", value: energyValue, target: 5, meta: "1–5 ölçeği", identity: "energy|" + date });
      if (stressValue !== null) historyRecord(records, seen, { date: date, source: "Stres", title: "Stres seviyesi", text: "Günlük stres ölçümü", value: stressValue, target: 5, meta: "1–5 ölçeği", identity: "stress|" + date });
      var magnesium = isObject(day.magnesium) ? day.magnesium : {};
      if (magnesium.taken || magnesium.skipped || magnesium.effectNote || magnesium.feedback) {
        addHistoryText(records, seen, date, "Takviye", "Magnezyum kaydı", [magnesium.taken ? "Alındı" : "", magnesium.skipped ? "Atlandı" : "", magnesium.form, magnesium.mg ? magnesium.mg + " mg" : "", magnesium.effectNote, magnesium.feedback].filter(Boolean).join("\n"), "", "");
      }
      var saygi = getSaygiInfo(day);
      if (saygi && (saygi.name || saygi.read)) {
        addHistoryText(records, seen, date, "Saygı", saygi.name || "Günün öncüsü", saygi.read ? "Okundu olarak işaretlendi." : "Günün öncüsü kaydı", saygi.read ? "Okundu" : "", saygi.personId ? "saygi|" + saygi.personId + "|" + date : "");
      }
      if (Array.isArray(day.quranRequests) && day.quranRequests.length) {
        day.quranRequests.forEach(function(request, index) {
          if (!isObject(request)) return;
          var requestText = [request.status, request.note, request.title, request.surahName].filter(Boolean).join("\n");
          addHistoryText(records, seen, date, "Kur’an", request.surahName || request.title || "Kur’an talebi", requestText || "Kur’an yolculuğu kaydı", request.status || "", request.id ? "quran|" + request.id : "quran|" + date + "|" + index);
        });
      }
      addHistoryEntries(records, seen, date, contentEntries(day, "reading"), "Okuma", "Kitap");
      addHistoryEntries(records, seen, date, contentEntries(day, "watching"), "İzleme", "İzleme");
      addHistoryEntries(records, seen, date, contentEntries(day, "listening"), "Dinleme", "Parça");
      addHistoryEntries(records, seen, date, getLearningEntries(day), "Öğrenme", "Konu");
      addHistoryEntries(records, seen, date, getSoulActivities(day), "Zihin-Beden", "Pratik");
      (Array.isArray(day.quotes) ? day.quotes : []).forEach(function(quote) {
        if (isObject(quote) && quote.text) addHistoryText(records, seen, historyDate(quote.ts || date), "Alıntı", quote.source || "Gün içi alıntı", quote.text, "", quote.id ? "day-quote|" + quote.id : "");
      });
      var discomfort = getDiscomfort(day);
      if (discomfort.note) addHistoryText(records, seen, date, "Beden Notu", "Rahatsızlık notu", discomfort.note, "", "");
      var sleep = isObject(day.sleep) ? day.sleep : {};
      if (sleep.med && sleep.med.note) addHistoryText(records, seen, date, "Uyku Notu", "Uyku ilacı / takviye notu", sleep.med.note, sleep.med.type || "", "");
      if (sleep.windDown && sleep.windDown.offloadNote) addHistoryText(records, seen, date, "Zihin Boşaltma", "Uykuya geçiş notu", sleep.windDown.offloadNote, "", "");
      var therapy = getTherapy(day);
      if ((therapy.thoughts && therapy.thoughts.length) || therapy.share && (therapy.share.note || therapy.share.sentAt)) {
        historyRecord(records, seen, { date: date, source: "Terapi", title: "Terapi kaydı", text: "Hassas terapi içeriği gizli tutulur.", meta: "Kayıt özeti", redacted: true, identity: "therapy|" + date });
      }
      if (therapy.dailyWin && therapy.dailyWin.text) addHistoryText(records, seen, date, "Yansıma", "Günün kazanımı", therapy.dailyWin.text, "", "");
      if (therapy.selfCompassion && therapy.selfCompassion.note) addHistoryText(records, seen, date, "Yansıma", "Öz şefkat notu", therapy.selfCompassion.note, "", "");
      if (therapy.firstStep && therapy.firstStep.text) addHistoryText(records, seen, date, "Yansıma", "İlk adım", therapy.firstStep.text, "", "");

      var prayer = getPrayer(day) || {};
      var prayerKeys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
      var prayerCountKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      var prayerSeen = prayerKeys.some(function(key) { return isObject(prayer[key]) || typeof prayer[key] === "boolean"; });
      if (prayerSeen) {
        var prayerDone = prayerCountKeys.filter(function(key) { return prayer[key] === true || prayer[key] && prayer[key].performed; }).length;
        var prayerNotes = prayerKeys.map(function(key) { return isObject(prayer[key]) && prayer[key].note ? PRAYER_LABELS[key] + ": " + prayer[key].note : ""; }).filter(Boolean).join("\n");
        historyRecord(records, seen, { date: date, source: "İbadet", title: "Namaz kaydı", text: prayerNotes || "Vakit durumu kaydedildi.", value: prayerDone, target: 5, meta: prayerDone + "/5 vakit", identity: "prayer|" + date });
      }
      if (!getZikrSession(date) && isObject(day.zikr)) {
        var legacyCount = numberOrNull(day.zikr.count);
        if (legacyCount !== null) historyRecord(records, seen, { date: date, source: "Zikir", title: day.zikr.name || "Zikir", text: "Günlük zikir sayacı", value: legacyCount, meta: "Eski günlük kayıt", identity: "legacy-zikr|" + date });
      }
    });

    var sessions = isObject(root.zikr) && isObject(root.zikr.sessions) ? root.zikr.sessions : {};
    Object.keys(sessions).forEach(function(date) {
      if (!historyWindowAllows(date, endDate, window) || !isObject(sessions[date])) return;
      var session = sessions[date], total = numberOrNull(session.totalCount);
      if (total === null) total = numberOrNull(session.total);
      if (total === null) total = numberOrNull(session.count);
      var perPreset = isObject(session.perPreset) ? session.perPreset : {};
      var target = 0, names = [], derivedTotal = 0, hasDerivedTotal = false;
      Object.keys(perPreset).forEach(function(id) {
        var preset = getZikrPreset(date, id) || {};
        var count = isObject(perPreset[id]) ? numberOrNull(perPreset[id].count) : numberOrNull(perPreset[id]);
        var presetTarget = safeNumber(preset.ebced || preset.target);
        if (presetTarget !== null && presetTarget > 0) target += presetTarget;
        if (count !== null) { derivedTotal += Math.max(0, count); hasDerivedTotal = true; }
        if (count !== null && count > 0) names.push((preset.name || id) + ": " + count.toLocaleString("tr-TR"));
      });
      if (total !== null) total = Math.max(0, total);
      else if (hasDerivedTotal) total = derivedTotal;
      historyRecord(records, seen, { date: date, source: "Zikir", title: "Esma / zikir kaydı", text: names.join("\n") || "Günlük zikir sayacı", value: total, target: target || null, meta: (session.completedSets || 0) + " tamamlanan tur" + (target ? " · hedef " + target.toLocaleString("tr-TR") : ""), identity: "zikr|" + date });
    });
    var reflections = isObject(root.zikr) && Array.isArray(root.zikr.reflections) ? root.zikr.reflections : [];
    reflections.forEach(function(ref, index) {
      if (!isObject(ref) || !historyWindowAllows(historyDate(ref.date || ref.updatedAt || ref.createdAt), endDate, window)) return;
      var text = [ref.feelings, ref.thoughts, ref.intention].filter(Boolean).join("\n");
      if (!text) return;
      addHistoryText(records, seen, historyDate(ref.date || ref.updatedAt || ref.createdAt), "Tefekkür", ref.presetName || "Zikir tefekkürü", text, ref.wordCount ? ref.wordCount + " kelime" : "", ref.id ? "reflection|" + ref.id : "reflection|" + index);
    });
    addHistoryRootArchive(records, seen, root);
    return records.filter(function(record) {
      return historyWindowAllows(record.date, endDate, window);
    }).sort(function(a, b) {
      return String(b.date || "").localeCompare(String(a.date || "")) || String(a.source).localeCompare(String(b.source), "tr");
    });
  }

  function historySourceLabel(source) { return safeText(source || "Kayıt", 40); }

  function historyRecordHtml(record, index) {
    var valueHtml = record.value !== null ? '<span class="history-record__value">' + record.value.toLocaleString("tr-TR") + (record.target !== null ? " / " + record.target.toLocaleString("tr-TR") : "") + '</span>' : "";
    var progress = record.percent !== null ? '<div class="history-record__progress" aria-label="Tamamlanma yüzde ' + record.percent + '"><span style="width:' + record.percent + '%"></span></div>' : "";
    var detail = record.redacted ? "Hassas içerik güvenlik nedeniyle gösterilmiyor; yalnızca kayıt özeti tutuluyor." : (record.text || "Ayrıntı yok.");
    return '<details class="history-record ae-slide-up" data-history-index="' + index + '">' +
      '<summary class="history-record__summary"><span class="history-record__source">' + escapeHtml(historySourceLabel(record.source)) + '</span><span class="history-record__date">' + escapeHtml(record.date ? formatDateLabel(record.date) : "Tarih bilgisi yok") + '</span>' + valueHtml + '<span class="history-record__chevron" aria-hidden="true">' + renderIcon("arrowRight", 14) + '</span></summary>' +
      '<div class="history-record__content"><strong>' + escapeHtml(record.title) + '</strong>' + (record.meta ? '<span class="history-record__meta">' + escapeHtml(record.meta) + '</span>' : "") + '<p>' + nl2br(escapeHtml(detail)) + '</p>' + progress + '</div></details>';
  }

  function renderHistoryFilters(records, endDate) {
    var sources = ["all"].concat(records.map(function(record) { return record.source; }).filter(function(source, index, arr) { return arr.indexOf(source) === index; }).sort(function(a, b) { return a.localeCompare(b, "tr"); }));
    var days = ["all"].concat(records.map(function(record) { return record.date; }).filter(function(date, index, arr) { return date && arr.indexOf(date) === index; }).sort().reverse());
    var source = sources.indexOf(ui.historySource) >= 0 ? ui.historySource : "all";
    var day = days.indexOf(ui.historyDay) >= 0 ? ui.historyDay : "all";
    var sourceOptions = sources.map(function(value) { return '<option value="' + escapeHtml(value) + '"' + (value === source ? " selected" : "") + '>' + escapeHtml(value === "all" ? "Tüm kaynaklar" : value) + '</option>'; }).join("");
    var dayOptions = days.map(function(value) { return '<option value="' + escapeHtml(value) + '"' + (value === day ? " selected" : "") + '>' + escapeHtml(value === "all" ? "Tüm günler" : formatDateLabel(value)) + '</option>'; }).join("");
    var options = [7, 14, 30, "all"].map(function(value) {
      var active = String(ui.historyWindow) === String(value) ? "is-active" : "";
      return AeButton({ label: value === "all" ? "Tümü" : value + " gün", variant: "pill", className: active, onclick: "AeonV2.setHistoryWindow('" + value + "')", ariaLabel: value === "all" ? "Tüm geçmiş" : value + " günlük kayıt penceresi" });
    }).join("");
    return '<div class="history-filters" role="group" aria-label="Geçmiş kayıt filtreleri"><div class="history-filters__window"><span class="ae-label">Kayıt penceresi</span><div class="history-filters__buttons">' + options + '</div></div><label class="history-filter"><span class="ae-label">Kaynak</span><select aria-label="Kayıt kaynağı" onchange="AeonV2.setHistoryFilter(\'source\',this.value)">' + sourceOptions + '</select></label><label class="history-filter"><span class="ae-label">Gün</span><select aria-label="Kayıt günü" onchange="AeonV2.setHistoryFilter(\'day\',this.value)">' + dayOptions + '</select></label></div>';
  }

  function renderHistorySection(endDate) {
    var window = ui.historyWindow === "all" ? "all" : (safeNumber(ui.historyWindow) || ui.trendWindow || 7);
    var allRecords = collectHistoryRecords(endDate, window);
    var activeSource = allRecords.some(function(record) { return record.source === ui.historySource; }) ? ui.historySource : "all";
    var activeDay = allRecords.some(function(record) { return record.date === ui.historyDay; }) ? ui.historyDay : "all";
    var filtered = allRecords.filter(function(record) {
      return (activeSource === "all" || record.source === activeSource) && (activeDay === "all" || record.date === activeDay);
    });
    var zikirTotal = filtered.filter(function(record) { return record.source === "Zikir"; }).reduce(function(sum, record) { return sum + (record.value || 0); }, 0);
    var prayerCount = filtered.filter(function(record) { return record.source === "İbadet"; }).reduce(function(sum, record) { return sum + (record.value || 0); }, 0);
    var body = filtered.length ? filtered.map(historyRecordHtml).join("") : AeEmpty({ icon: "note", title: "Bu aralıkta kayıt yok", message: "Seçili pencere veya filtreler için gösterilecek kullanıcı kaydı bulunamadı." });
    return '<section class="trends-view__section trends-view__section--history" aria-labelledby="trends-history-title"><div class="trends-view__section-head"><div><div class="ae-label" id="trends-history-title">Notlar, Zikirler ve İbadetler</div><p>Tüm anlamlı kayıtlar kaynak ve tarih bilgisiyle korunur; hassas terapi metinleri özetlenir.</p></div><span class="ae-chip ae-chip--accent">' + filtered.length.toLocaleString("tr-TR") + ' kayıt</span></div>' +
      '<div class="history-kpis"><div><span>Kayıt</span><strong>' + filtered.length.toLocaleString("tr-TR") + '</strong></div><div><span>Zikir toplamı</span><strong>' + zikirTotal.toLocaleString("tr-TR") + '</strong></div><div><span>Namaz vakti</span><strong>' + prayerCount.toLocaleString("tr-TR") + '</strong></div></div>' +
      renderHistoryFilters(allRecords, endDate) + '<div class="history-records" aria-live="polite">' + body + '</div></section>';
  }

  function setHistoryWindow(value) {
    if (String(value) === "all") ui.historyWindow = "all";
    else { var n = safeNumber(value); if (n === null) return; ui.historyWindow = n === 14 ? 14 : n >= 30 ? 30 : 7; }
    ui.historySource = "all";
    ui.historyDay = "all";
    render();
  }

  function setHistoryFilter(key, value) {
    if (key === "source") ui.historySource = safeText(value || "all", 40) || "all";
    if (key === "day") ui.historyDay = /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "all";
    render();
  }

  function renderAnomalies(endDate) {
    var anomalies = detectAnomalies(endDate);
    if (!anomalies.length) {
      return AeEmpty({
        icon: "check",
        title: "Uyarı yok",
        message: "Seçili pencerede dikkat çeken bir durum tespit edilmedi."
      });
    }
    return '<div class="anomaly-list ae-stagger">' +
           '<div class="ae-label">Tespit edilen durumlar</div>' +
           anomalies.map(AnomalyCard).join("") +
           "</div>";
  }

  function renderWindowSelector() {
    var options = [7, 14, 30];
    var buttons = options.map(function(d) {
      var active = ui.trendWindow === d ? "is-active" : "";
      return AeButton({
        label: d + " gün",
        variant: "pill",
        className: active,
        onclick: "AeonV2.setTrendWindow(" + d + ")",
        ariaLabel: d + " günlük pencere"
      });
    }).join("");
    return '<div class="window-selector" role="group" aria-label="Trend zaman penceresi">' +
           '<div class="ae-label">Pencere</div>' +
           '<div class="window-selector__buttons">' + buttons + "</div>" +
           "</div>";
  }

  function setTrendWindow(days) {
    var n = safeNumber(days);
    if (n === null) return;
    ui.trendWindow = Math.max(7, Math.min(30, n === 14 ? 14 : n <= 7 ? 7 : 30));
    ui.historyWindow = ui.trendWindow;
    ui.historySource = "all";
    ui.historyDay = "all";
    render();
  }

  // ── Topbar ──────────────────────────────────────────────────────────────
  function renderTopbar() {
    return '<header class="ae-topbar" role="banner">' +
           '<div class="ae-topbar__brand">' +
           AeTooltip({ id: "aeon-brand-tooltip", label: "Æ", triggerClass: "ae-topbar__logo", ariaLabel: "ÆON Observer Dashboard", text: "ÆON gözlem paneli" }) +
           '<span class="ae-topbar__title">ÆON</span>' +
           "</div>" +
           '<div class="ae-topbar__tools">' +
           '<button type="button" class="ae-status-btn" tabindex="0" onclick="AeonV2.setTab(\'system\');AeonV2.setSystemSubTab(\'status\')" aria-label="Senkron durumu" data-focus-key="sync-status">' +
           AeStatusBadge({ status: syncStatus.status }) +
           "</button>" +
           AeButton({ labelHtml: renderIcon("refresh", 17), variant: "mini", className: "ae-btn--icon", onclick: "AeonV2.refresh()", ariaLabel: "Yenile" }) +
           AeButton({ labelHtml: renderIcon("close", 17), variant: "mini", className: "ae-btn--icon", onclick: "AeonV2.logout()", ariaLabel: "Oturumu sonlandır" }) +
           "</div>" +
           "</header>";
  }

  // ── Tabs ──────────────────────────────────────────────────────────────
  function renderTabs() {
    var html = '<div class="ae-tabs" role="tablist" aria-label="Ana sekmeler">';
    TABS.forEach(function(t) {
      var active = t.id === ui.tab ? " is-active" : "";
      html += '<button type="button" class="ae-tab' + active + '" ' +
              'id="ae-tab-' + t.id + '" ' +
              'role="tab" ' +
              'tabindex="' + (t.id === ui.tab ? "0" : "-1") + '" ' +
              'aria-selected="' + (t.id === ui.tab ? "true" : "false") + '" ' +
              'aria-controls="ae-panel-' + t.id + '" ' +
              'aria-label="' + escapeHtml(safeText(t.label, 32)) + '" ' +
              'data-tab="' + escapeHtml(t.id) + '" ' +
              'onclick="AeonV2.setTab(\'' + t.id + '\')">' +
              '<span class="ae-tab__icon">' + renderIcon(t.icon, 17) + "</span>" +
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
    var quranCount = quranJourneyV2Rows().length;
    if (!dayCount && !quranCount) {
      return '<div class="today-view ae-stagger">' +
             AeCard({
               children: AeEmpty({
                 icon: "dashboard",
                 title: "Genel Bakış",
                 message: "Henüz synced veri yok. Veri geldiğinde bugünün sinyal kartları burada görünecek."
               })
             }) +
             "</div>";
    }
    var isCurrentDate = date === isoDate(new Date());
    var title = isCurrentDate ? "Bugünün sinyalleri" : formatDateLabel(date) + " sinyalleri";
    return '<div class="today-view ae-slide-up ae-stagger">' +
           '<header class="today-view__intro">' +
             '<div class="today-view__intro-copy">' +
               '<div class="today-view__eyebrow">ÆON / GENEL BAKIŞ</div>' +
               '<h1 class="today-view__title">' + escapeHtml(title) + '</h1>' +
               '<p class="today-view__meta">Günün ritmini, küçük sinyallerden okuyalım.</p>' +
             '</div>' +
             '<span class="today-view__signal ae-status ae-status--info" role="status">' +
               '<span class="ae-status__dot"></span><span class="ae-status__label">Canlı özet</span>' +
             '</span>' +
           '</header>' +
           '<div class="today-view__section today-view__section--picker">' +
             renderDatePicker() +
           '</div>' +
           '<section class="today-view__section today-view__section--hero" aria-label="Günün metrikleri">' +
             (dayCount ? renderHeroGrid(date) : AeCard({children:AeEmpty({icon:"dashboard",title:"Günün sinyalleri",message:"Henüz günlük kayıt yok; Kur’an Yolculuğu özeti aşağıda hazır."})})) +
           '</section>' +
           '<section class="today-view__section today-view__section--trend" aria-label="Son yedi günlük trendler">' +
             renderTrendStrip(date) +
           '</section>' +
           '<section class="today-view__secondary-grid ae-stagger" aria-label="Günün notları ve konum akışı">' +
             renderQuickNotes(date) +
             renderLocationTimeline(date) +
           '</section>' +
           '<section class="today-view__section" aria-label="Kur’an Yolculuğu">' +
             renderQuranJourneyV2() +
           '</section>' +
           "</div>";
  }

  function renderTrends() {
    var date = todayStr();
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    var historyCount = collectHistoryRecords(date, "all").length;
    if (!dayCount && !historyCount) {
      return '<div class="trends-view ae-stagger">' +
             AeCard({
               children: AeEmpty({
                 icon: "trend",
                 title: "Trendler & Uyarılar",
                 message: "Henüz synced veri yok. Veri geldiğinde 7/14/30 günlük özetler ve anomaliler burada görünecek."
               })
             }) +
             "</div>";
    }
    var windowDays = ui.trendWindow || 7;
    return '<div class="trends-view ae-slide-up ae-stagger">' +
           '<header class="trends-view__intro">' +
             '<div class="trends-view__intro-copy">' +
               '<div class="trends-view__eyebrow">ÆON / TRENDLER</div>' +
               '<h1 class="trends-view__title">Trendler &amp; Uyarılar</h1>' +
               '<p class="trends-view__meta">Ruh hali, beden ritmi ve dikkat gerektiren sinyaller tek bir görünümde.</p>' +
             '</div>' +
             '<span class="trends-view__signal ae-status ae-status--info" role="status"><span class="ae-status__dot"></span><span class="ae-status__label">Analiz hazır</span></span>' +
           '</header>' +
           '<section class="trends-view__section trends-view__section--controls" aria-label="Trend zaman penceresi">' +
             renderWindowSelector() +
           '</section>' +
           '<section class="trends-view__section trends-view__section--summary" aria-labelledby="trends-summary-title">' +
             '<div class="trends-view__section-head"><div><div class="ae-label" id="trends-summary-title">Özet metrikler</div><p>Seçili pencerenin ortalamaları, yönü ve günlük mini trendi.</p></div><span class="ae-chip ae-chip--accent">' + windowDays + ' gün</span></div>' +
             renderSummaryGrid(date, windowDays) +
           '</section>' +
           '<section class="trends-view__section trends-view__section--mood" aria-labelledby="trends-mood-title">' +
             '<div class="trends-view__section-head"><div><div class="ae-label" id="trends-mood-title">Ruh hali eğrisi</div><p>Son 30 günün mod seviyesindeki değişim.</p></div><span class="ae-chip ae-chip--accent">1–5 ölçeği</span></div>' +
             renderMoodTrendChart(date) +
           '</section>' +
           '<section class="trends-view__section trends-view__section--metrics" aria-labelledby="trends-metrics-title">' +
             '<div class="trends-view__section-head"><div><div class="ae-label" id="trends-metrics-title">Beden ritmi</div><p>Uyku, adım ve su hedef çizgileriyle birlikte.</p></div><span class="ae-chip">' + windowDays + ' gün</span></div>' +
             renderMetricCharts(date, windowDays) +
           '</section>' +
           renderHistorySection(date) +
           '<section class="trends-view__section trends-view__section--anomalies" aria-labelledby="trends-anomalies-title">' +
             '<div class="trends-view__section-head"><div><div class="ae-label" id="trends-anomalies-title">Dikkat sinyalleri</div><p>Rutin dışına çıkan veya takip gerektiren örüntüler.</p></div><span class="ae-chip ae-chip--warn">Kontrol</span></div>' +
             renderAnomalies(date) +
           '</section>' +
           "</div>";
  }

  // ── Day detail ────────────────────────────────────────────────────────
  function DetailSection(opts) {
    opts = opts || {};
    var title = safeText(opts.title || "Bölüm", 40);
    var icon = safeText(opts.icon || "dot", 32);
    var emptyText = safeText(opts.emptyText || "Bu bölümde kayıt yok.", 160);
    var bodyHtml = opts.children && String(opts.children).trim()
      ? '<div class="detail-section__body">' + opts.children + "</div>"
      : '<div class="detail-section__empty">' + escapeHtml(emptyText) + "</div>";
    return AeCard({
      variant: "summary",
      visualVariant: opts.visualVariant || "glass",
      className: "detail-section",
      children: '<div class="detail-section__head">' +
                '<span class="detail-section__icon">' + renderIcon(icon, 19) + "</span>" +
                '<span class="detail-section__title">' + escapeHtml(title) + "</span>" +
                "</div>" + bodyHtml
    });
  }

  function DetailBlock(opts) {
    opts = opts || {};
    var icon = safeText(opts.icon || "dot", 32);
    var title = safeText(opts.title || "", 80);
    var body = opts.body || "";
    var meta = opts.meta ? '<div class="detail-block__meta">' + escapeHtml(opts.meta) + "</div>" : "";
    var classes = classNames(["detail-block", "ae-scale-in", opts.redacted ? "detail-block--redacted" : "", opts.className]);
    return '<div class="' + escapeHtml(classes) + '">' +
           '<div class="detail-block__head">' +
           '<span class="detail-block__icon">' + renderIcon(icon, 17) + "</span>" +
           '<span class="detail-block__title">' + escapeHtml(title) + "</span>" +
           "</div>" +
           meta +
           '<div class="detail-block__body">' + body + "</div>" +
           "</div>";
  }

  function renderChip(label, redacted, icon) {
    return '<span class="ae-chip ' + (redacted ? "ae-chip--redacted" : "") + '">' +
           (icon ? renderIcon(icon, 14) : "") + escapeHtml(label) +
           (redacted ? ' <span class="ae-chip__hint">redacted</span>' : "") +
           "</span>";
  }

  function renderDayDatePicker(date) {
    var today = isoDate(new Date());
    var label = date === today ? "Bugün" : formatDateLabel(date);
    return '<div class="ae-card ae-card--outline ae-card--summary day-date-picker">' +
           AeButton({ labelHtml: renderIcon("arrowLeft", 16), variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(-1)", ariaLabel: "Önceki gün" }) +
           '<div class="day-date-picker__display">' +
           '<div class="day-date-picker__label">' + escapeHtml(label) + "</div>" +
           '<div class="day-date-picker__iso">' + escapeHtml(date) + "</div>" +
           "</div>" +
           AeButton({ labelHtml: renderIcon("arrowRight", 16), variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(1)", ariaLabel: "Sonraki gün" }) +
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
    var dates = lastNDates(30, date, true);
    var actualToday = isoDate(new Date());
    var cells = dates.map(function(d) {
      var toneClass = '', label = '', day = null, mood = { value: null, label: null, note: "" };
      if (d) {
        day = getDay(d) || {};
        mood = getMood(day);
        toneClass = mood.value ? ' day-heatmap__cell--mood-' + mood.value : ' day-heatmap__cell--empty';
        if (d === actualToday) toneClass += ' day-heatmap__cell--today';
        if (d === date) toneClass += ' day-heatmap__cell--selected';
        label = '<span class="day-heatmap__day">' + escapeHtml(Number(d.split("-")[2]).toString()) + "</span>";
      } else {
        toneClass = ' day-heatmap__cell--empty';
      }
      var tooltipParts = [d ? formatDateLabel(d) : "Gelecek gün", mood.label || "Mod kaydı yok"];
      if (mood.note) tooltipParts.push("Not: " + safeText(mood.note, 120));
      if (d === date) tooltipParts.push("Seçili gün");
      var tooltip = tooltipParts.join(" · ");
      var dataMood = mood.label || "empty";
      return '<div class="day-heatmap__cell' + toneClass + '" role="gridcell" tabindex="0"' +
             ' data-date="' + escapeHtml(d || "") + '" data-mood="' + escapeHtml(dataMood) +
             '" aria-label="' + escapeHtml(tooltip) + '" title="' + escapeHtml(tooltip) + '">' +
             label + '<span class="day-heatmap__tooltip" role="tooltip">' + escapeHtml(tooltip) +
             '</span></div>';
    }).join("");
    var weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(function(label) {
      return '<span class="day-heatmap__weekday" role="columnheader">' + label + "</span>";
    }).join("");
    return '<div class="ae-card ae-card--solid ae-card--summary day-heatmap">' +
           '<div class="ae-label">Son 30 gün</div>' +
           '<div class="day-heatmap__weekdays" role="row" aria-label="Haftanın günleri">' + weekdays + "</div>" +
           '<div class="day-heatmap__grid" role="grid" aria-label="Son 30 gün ruh hali">' + cells + "</div>" +
           "</div>";
  }

  function renderMoodTherapy(date) {
    var day = getDay(date) || {};
    var mood = getMood(day);
    var html = "";

    var chips = [];
    if (mood.label) chips.push(renderChip(mood.label + (mood.note ? " · " + mood.note : ""), false, mood.icon));
    if (day.journal && day.journal.text) chips.push(renderChip("Günlük", false));
    if (day.note) chips.push(renderChip("Not", false));
    if (day.intention) chips.push(renderChip("Niyet", false));
    if (day.gratitude) chips.push(renderChip("Şükür", false));

    var t = getTherapy(day);
    var thoughts = Array.isArray(t.thoughts) ? t.thoughts : [];
    if (thoughts.length) chips.push(renderChip("Düşünce (" + thoughts.length + ")", false));
    if (isObject(t.decision) && (t.decision.choice || t.decision.optionA || t.decision.optionB)) chips.push(renderChip("Karar: " + safeText(t.decision.choice || "", 40), false));
    if (isObject(t.share) && (t.share.note || t.share.sentAt)) chips.push(renderChip("Terapi paylaşımı", true));
    if (isObject(t.breath) && (t.breath.pattern || t.breath.seconds)) chips.push(renderChip("Nefes " + (t.breath.pattern || ""), false));
    if (isObject(t.dailyWin) && t.dailyWin.text) chips.push(renderChip("Günlük kazanım", false));
    if (isObject(t.selfCompassion) && (t.selfCompassion.prompt || t.selfCompassion.note)) chips.push(renderChip("Kendi şefkati", false));
    if (isObject(t.firstStep) && (t.firstStep.text || t.firstStep.completedAt)) chips.push(renderChip("İlk adım", false));
    if (chips.length) html += '<div class="detail-section__chips">' + chips.join("") + "</div>";

    if (day.journal && day.journal.text) {
      html += DetailBlock({ icon: "journal", title: "Günlük", body: nl2br(escapeHtml(String(day.journal.text || ""))), meta: "Mod: " + (day.journal.mode || "free") + (day.journal.promptUsed ? " · " + day.journal.promptUsed : "") });
    }
    if (day.note) html += DetailBlock({ icon: "note", title: "Not", body: nl2br(escapeHtml(String(day.note || ""))) });
    if (day.intention) html += DetailBlock({ icon: "intention", title: "Niyet", body: nl2br(escapeHtml(String(day.intention || ""))) });
    if (day.gratitude) {
      var gList = Array.isArray(day.gratitude) ? day.gratitude : [day.gratitude];
      var gBody = gList.map(function(x){ return "• " + escapeHtml(String(x || "")); }).join("<br>");
      html += DetailBlock({ icon: "gratitude", title: "Şükür", body: gBody });
    }
    if (thoughts.length) {
      var thoughtsBody = thoughts.map(function(x, i) {
        var title = x.situation || x.thought || "Düşünce " + (i + 1);
        return "<div class='detail-block__sub'><strong>" + escapeHtml(safeText(title, 120)) + "</strong>" +
               (x.altThought ? "<br>Alternatif: " + escapeHtml(x.altThought) : "") + "</div>";
      }).join("");
      html += DetailBlock({ icon: "reflection", title: "Bilişsel düşünce kayıtları (" + thoughts.length + ")", body: thoughtsBody });
    }
    if (isObject(t.dailyWin) && t.dailyWin.text) html += DetailBlock({ icon: "saygi", title: "Günlük kazanım", body: nl2br(escapeHtml(t.dailyWin.text)) });
    if (isObject(t.decision) && (t.decision.choice || t.decision.note)) {
      var dBody = "";
      if (t.decision.optionA) dBody += "A: " + escapeHtml(t.decision.optionA) + "<br>";
      if (t.decision.optionB) dBody += "B: " + escapeHtml(t.decision.optionB) + "<br>";
      if (t.decision.choice) dBody += "Seçim: <strong>" + escapeHtml(t.decision.choice) + "</strong><br>";
      if (t.decision.note) dBody += "Not: " + escapeHtml(t.decision.note);
      html += DetailBlock({ icon: "check", title: "Karar", body: dBody });
    }
    if (isObject(t.selfCompassion) && (t.selfCompassion.prompt || t.selfCompassion.note)) {
      html += DetailBlock({ icon: "gratitude", title: "Kendi şefkati", body: (t.selfCompassion.prompt ? "Prompt: " + escapeHtml(t.selfCompassion.prompt) + "<br>" : "") + nl2br(escapeHtml(t.selfCompassion.note || "")) });
    }
    if (isObject(t.breath) && t.breath.seconds) {
      html += DetailBlock({ icon: "movement", title: "Nefes", body: "Pattern: " + escapeHtml(t.breath.pattern || "4-7-8") + " · " + fmtDuration(t.breath.seconds) });
    }
    if (isObject(t.firstStep) && t.firstStep.text) {
      html += DetailBlock({ icon: "steps", title: "İlk adım", body: nl2br(escapeHtml(t.firstStep.text)) });
    }
    if (isObject(t.share) && (t.share.note || t.share.sentAt)) {
      html += DetailBlock({ icon: "shield", title: "Terapi paylaşımı", body: "Kullanıcı tarafından paylaşıldı · ham metin gizli", redacted: true });
    }

    return DetailSection({
      id: "mood-therapy",
      title: "Ruh hali & Terapi",
      icon: "mood",
      emptyText: "Bu gün için ruh hali veya terapi özeti kaydı yok.",
      children: html
    });
  }

  function renderNutrition(date) {
    var day = getDay(date) || {};
    var chips = [];
    var water = getWater(day);
    if (water !== null && water > 0) chips.push(renderChip("Su: " + water + " bardak", false));

    var mealKeys = ["breakfast", "lunch", "dinner", "snack"];
    var mealLabels = { breakfast: "Kahvaltı", lunch: "Öğle", dinner: "Akşam", snack: "Ara" };
    var mealCount = 0;
    var meals = getMeals(day);
    mealKeys.forEach(function(k){ if (meals[k]) mealCount++; });
    if (mealCount) chips.push(renderChip("Öğün: " + mealCount + "/4", false));

    var caf = getCaffeine(day);
    if (caf.drinks && caf.drinks.length) chips.push(renderChip("Kafein: " + caf.drinks.length + " içecek", false));

    var med = isObject(day.sleep) && isObject(day.sleep.med) ? day.sleep.med : null;
    if (med && (med.type || med.note)) chips.push(renderChip("Uyku ilacı", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    mealKeys.forEach(function(k){
      var label = mealLabels[k];
      var note = meals[k] || "";
      var items = getMealItems(day, k);
      if (!note && !items.length) return;
      var body = note ? "Not: " + nl2br(escapeHtml(note)) + "<br><br>" : "";
      if (items.length) {
        body += items.map(function(it){ return "• " + escapeHtml(String(it.name || "")) + (it.qty ? " · " + escapeHtml(String(it.qty)) + " " + escapeHtml(String(it.unit || "")) : ""); }).join("<br>");
      }
      html += DetailBlock({ icon: "meal", title: label, body: body });
    });

    var hasCaffeine = caf && ((caf.drinks && caf.drinks.length) || caf.last || caf.cups);
    if (water !== null || hasCaffeine) {
      var fluidBody = water !== null ? "Su: " + water + " bardak" : "";
      if (caf.drinks && caf.drinks.length) {
        fluidBody += (fluidBody ? "<br>" : "") + caf.drinks.map(function(d){ return escapeHtml(String(d.type || "")) + (d.qty ? " ×" + d.qty : "") + (d.time ? " @" + escapeHtml(d.time) : ""); }).join("<br>");
      } else if (caf.cups) {
        fluidBody += (fluidBody ? "<br>" : "") + "Kafein: " + caf.cups + " fincan" + (caf.last ? " (son @" + escapeHtml(caf.last) + ")" : "");
      }
      html += DetailBlock({ icon: "caffeine", title: "Sıvı & Kafein", body: fluidBody });
    }

    if (med && (med.type || med.note)) {
      html += DetailBlock({ icon: "medicine", title: "Uyku ilacı", body: (med.type ? escapeHtml(med.type) + "<br>" : "") + nl2br(escapeHtml(med.note || "")) });
    }

    return DetailSection({
      id: "nutrition",
      title: "Beslenme & Öğün",
      icon: "meal",
      emptyText: "Beslenme, su veya kafein kaydı yok.",
      children: html
    });
  }

  var PRAYER_LABELS = { fajr: "İmsak", sunrise: "Güneş", dhuhr: "Öğle", asr: "İkindi", maghrib: "Akşam", isha: "Yatsı" };

  function renderPrayer(date) {
    var day = getDay(date) || {};
    var chips = [];
    var p = getPrayer(day) || {};
    var vakitNames = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    var done = vakitNames.filter(function(k) { var e = p[k]; return e && e.performed; }).length;
    if (done > 0 || p.fajr != null || p.dhuhr != null || p.asr != null || p.maghrib != null || p.isha != null) {
      chips.push(renderChip("Namaz: " + done + "/5", false));
    }
    var zCount = getZikrCount(date);
    if (zCount !== null && zCount > 0) chips.push(renderChip("Zikir: " + zCount.toLocaleString("tr-TR"), false));
    var s = getSaygiInfo(day);
    if (s && s.name) {
      chips.push(renderChip("Öncü: " + safeText(s.name, 40), false));
      if (s.read) chips.push(renderChip("Okundu", false));
    }
    var q = day.quranRequests || (day.quranJourney && day.quranJourney.requests) || [];
    if (Array.isArray(q) && q.length) chips.push(renderChip("Kur'an yolculuğu", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    vakitNames.forEach(function(k) {
      var e = p[k];
      if (!e || (!e.time && e.performed === false && !e.nafile && !e.note)) return;
      var label = PRAYER_LABELS[k] || k;
      var status = [];
      if (e.performed) status.push("Kılındı");
      if (e.inCongregation) status.push("Cemaat");
      if (e.late) status.push("Gecikti");
      if (e.madeUp) status.push("Telafi");
      if (e.nafile) status.push("Nafile " + e.nafile);
      var meta = (e.time ? "Vakit: " + e.time : "Vakit yok") + (status.length ? " · " + status.join(", ") : "");
      html += DetailBlock({ icon: "prayer", title: label, body: meta + (e.note ? "<br>Not: " + escapeHtml(e.note) : "") });
    });

    var zikrDetail = renderZikrDetail(date);
    if (zikrDetail) html += zikrDetail;

    if (s && s.name) {
      html += DetailBlock({ icon: "saygi", title: "Saygı", body: escapeHtml(s.name) + (s.read ? "<br>Okundu" : "") });
    }

    if (Array.isArray(q) && q.length) {
      var qBody = q.map(function(r){ return "• " + escapeHtml(String(r.surah || r.verseRef || r.type || JSON.stringify(r).slice(0, 80))); }).join("<br>");
      html += DetailBlock({ icon: "book", title: "Kur'an yolculuğu", body: qBody });
    }

    return DetailSection({
      id: "prayer",
      title: "İbadet & Saygı",
      icon: "prayer",
      emptyText: "Bugün için ibadet, zikir veya Saygı kaydı yok.",
      children: html
    });
  }

  function renderHabits(date) {
    var day = getDay(date) || {};
    var hs = getHabitSummary(day);
    var hasHabitData = Object.keys(getHabits(day)).length > 0;
    var chips = [];
    if (hasHabitData) chips.push(renderChip(hs.doneCount + "/" + hs.total + " alışkanlık", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (hasHabitData && hs.done.length) {
      var doneBody = hs.done.map(function(k) {
        return '<div class="habit-row habit-row--done"><span class="habit-row__icon">' + renderIcon(HABIT_ICONS[k] || "check", 16) + '</span><span class="habit-row__label">' + escapeHtml(HABIT_LABELS[k] || k) + "</span></div>";
      }).join("");
      html += DetailBlock({ icon: "check", title: "Yapılan alışkanlıklar (" + hs.doneCount + ")", body: doneBody });
    }
    if (hasHabitData && hs.undone.length) {
      var undoneBody = hs.undone.map(function(k) {
        return '<div class="habit-row habit-row--undone"><span class="habit-row__icon">' + renderIcon(HABIT_ICONS[k] || "dot", 16) + '</span><span class="habit-row__label">' + escapeHtml(HABIT_LABELS[k] || k) + "</span></div>";
      }).join("");
      html += DetailBlock({ icon: "dot", title: "Yapılmayan alışkanlıklar (" + hs.undone.length + ")", body: undoneBody });
    }

    return DetailSection({
      id: "habits",
      title: "Alışkanlıklar",
      icon: "check",
      emptyText: "Bugün için alışkanlık kaydı yok.",
      children: html
    });
  }

  function renderEnergyStress(date) {
    var day = getDay(date) || {};
    var energy = getEnergy(day);
    var stress = getStress(day);

    var chips = [];
    if (energy !== null) chips.push(renderChip("Enerji: " + energy + "/5", false));
    if (stress !== null) chips.push(renderChip("Stres: " + stress + "/5", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (energy !== null) {
      var eBar = '<div class="scale-bar"><div class="scale-bar__fill scale-bar__fill--energy" style="width:' + (energy / 5 * 100) + '%"></div></div>';
      html += DetailBlock({ icon: "spark", title: "Enerji seviyesi", body: energy + "/5" + eBar });
    }
    if (stress !== null) {
      var sBar = '<div class="scale-bar"><div class="scale-bar__fill scale-bar__fill--stress" style="width:' + (stress / 5 * 100) + '%"></div></div>';
      html += DetailBlock({ icon: "anxiety", title: "Stres seviyesi", body: stress + "/5" + sBar });
    }

    return DetailSection({
      id: "energy-stress",
      title: "Enerji & Stres",
      icon: "spark",
      emptyText: "Bugün için enerji veya stres ölçümü yok.",
      children: html
    });
  }

  function renderCraving(date) {
    var day = getDay(date) || {};
    var c = getCravingDetails(day);
    var chips = [];
    if (c.sosCount > 0) chips.push(renderChip("SOS: " + c.sosCount, false));
    if (c.tenMinDone) chips.push(renderChip("10 dk gecikme", false));
    if (c.foodDone) chips.push(renderChip("Yemek krizi yönetildi", false));
    if (c.coffeeDone) chips.push(renderChip("Kahve krizi yönetildi", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (c.sosCount > 0) {
      html += DetailBlock({ icon: "sos", title: "SOS aktivasyonları", body: c.sosCount + " kez SOS butonuna basıldı" });
    }
    if (c.optionsUsed.length) {
      html += DetailBlock({ icon: "settings", title: "Kullanılan SOS seçenekleri", body: c.optionsUsed.map(function(o) { return "• " + escapeHtml(String(o)); }).join("<br>") });
    }
    if (c.triggers.length) {
      html += DetailBlock({ icon: "sos", title: "Tetikleyiciler", body: c.triggers.map(function(t) { return "• " + escapeHtml(String(t)); }).join("<br>") });
    }
    if (c.triggerNote) {
      html += DetailBlock({ icon: "note", title: "Tetikleyici notu", body: nl2br(escapeHtml(c.triggerNote)) });
    }
    if (c.tenMinDone || c.foodDone || c.coffeeDone) {
      var copingBody = [];
      if (c.tenMinDone) copingBody.push(renderIcon("check", 14) + " Tatlı krizi: 10 dakika gecikme yapıldı");
      if (c.foodDone) copingBody.push(renderIcon("check", 14) + " Yemek krizi yönetildi");
      if (c.coffeeDone) copingBody.push(renderIcon("check", 14) + " Kahve krizi yönetildi");
      html += DetailBlock({ icon: "movement", title: "Baş etme stratejileri", body: copingBody.join("<br>") });
    }

    return DetailSection({
      id: "craving",
      title: "Kriz & Baş etme",
      icon: "sos",
      emptyText: "Bugün için istek veya SOS kaydı yok.",
      children: html
    });
  }

  function renderMagnesium(date) {
    var day = getDay(date) || {};
    var mg = getMagnesium(day) || {};

    var chips = [];
    if (mg.taken) chips.push(renderChip("Magnezyum alındı", false));
    else if (mg.skipped) chips.push(renderChip("Magnezyum atlandı", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (mg.taken) {
      var mgBody = "";
      if (mg.form) mgBody += "Form: " + escapeHtml(mg.form) + "<br>";
      if (mg.mg) mgBody += "Doz: " + mg.mg + " mg<br>";
      if (mg.time) mgBody += "Saat: " + escapeHtml(mg.time) + "<br>";
      if (Array.isArray(mg.reason) && mg.reason.length) mgBody += "Neden: " + mg.reason.map(function(r) { return escapeHtml(String(r)); }).join(", ") + "<br>";
      if (mg.effectNote) mgBody += "Etki: " + nl2br(escapeHtml(mg.effectNote));
      html += DetailBlock({ icon: "magnesium", title: "Magnezyum takviyesi", body: mgBody || "Alındı" });
    } else if (mg.skipped) {
      html += DetailBlock({ icon: "magnesium", title: "Magnezyum atlandı", body: mg.feedback ? "Geri bildirim: " + escapeHtml(String(mg.feedback)) : "Atlandı" });
    }

    return DetailSection({
      id: "magnesium",
      title: "Magnezyum",
      icon: "magnesium",
      emptyText: "Bugün için magnezyum veya destek kaydı yok.",
      children: html
    });
  }

  function renderWindDown(date) {
    var day = getDay(date) || {};
    var windDown = getWindDown(day);
    var wd = windDown || {};

    var chips = [];
    var stepCount = [wd.light, wd.breath, wd.dump, wd.cool].filter(Boolean).length;
    if (windDown && stepCount > 0) chips.push(renderChip("Wind-down: " + stepCount + "/4 adım", false));
    if (windDown && wd.lastMinutes) chips.push(renderChip(wd.lastMinutes + " dk", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (windDown) {
      var stepsBody = "";
      stepsBody += renderIcon(wd.light ? "check" : "dot", 14) + " Işık azaltma<br>";
      stepsBody += renderIcon(wd.breath ? "check" : "dot", 14) + " Nefes egzersizi<br>";
      stepsBody += renderIcon(wd.dump ? "check" : "dot", 14) + " Zihin boşaltma<br>";
      stepsBody += renderIcon(wd.cool ? "check" : "dot", 14) + " Serinleme<br>";
      if (wd.lastMinutes) stepsBody += "<br>Süre: " + wd.lastMinutes + " dk";
      html += DetailBlock({ icon: "sleep", title: "Wind-down adımları", body: stepsBody });
    }

    if (windDown && wd.offloadNote) {
      html += DetailBlock({ icon: "note", title: "Zihin boşaltma notu", body: nl2br(escapeHtml(wd.offloadNote)) });
    }

    return DetailSection({
      id: "winddown",
      title: "Wind-down (Uyku hazırlık)",
      icon: "sleep",
      emptyText: "Bugün için uyku rutini kaydı yok.",
      children: html
    });
  }

  function renderCycle(date) {
    var day = getDay(date) || {};
    var cyc = getCycleInfo(day);
    var chips = [];
    if (cyc.flow) chips.push(renderChip("Akış: " + escapeHtml(cyc.flow), false));
    if (cyc.symptoms.length) chips.push(renderChip("Semptom: " + cyc.symptoms.length, false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (cyc.flow) {
      html += DetailBlock({ icon: "cycle", title: "Adet akışı", body: escapeHtml(cyc.flow) });
    }
    if (cyc.symptoms.length) {
      html += DetailBlock({ icon: "anxiety", title: "Semptomlar", body: cyc.symptoms.map(function(s) { return "• " + escapeHtml(String(s)); }).join("<br>") });
    }

    return DetailSection({
      id: "cycle",
      title: "Döngü & Semptomlar",
      icon: "cycle",
      emptyText: "Bugün için döngü veya semptom kaydı yok.",
      children: html
    });
  }

  function renderNutri(date) {
    var day = getDay(date) || {};
    var nutriData = getNutri(day);
    var nutri = nutriData || {};

    var chips = [];
    if (nutriData && nutri.calories) chips.push(renderChip(nutri.calories + " kcal", false));
    if (nutriData && nutri.protein) chips.push(renderChip("Protein: " + nutri.protein + "g", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (nutriData && Object.keys(nutriData).length) {
      var body = "";
      if (nutri.calories) body += "Kalori: " + nutri.calories + " kcal<br>";
      if (nutri.protein) body += "Protein: " + nutri.protein + "g<br>";
      if (nutri.carbs) body += "Karbonhidrat: " + nutri.carbs + "g<br>";
      if (nutri.fat) body += "Yağ: " + nutri.fat + "g<br>";
      if (nutri.items) body += "Öğün sayısı: " + nutri.items;
      html += DetailBlock({ icon: "nutrition", title: "Makro besin özeti", body: body });
    }

    return DetailSection({
      id: "nutri",
      title: "Besin değerleri",
      icon: "nutrition",
      emptyText: "Bugün için makro besin kaydı yok.",
      children: html
    });
  }

  function renderMovement(date) {
    var day = getDay(date) || {};
    var steps = getSteps(day);
    var m = getMovement(day);
    var loc = day.location || {};
    var dis = getDiscomfort(day);
    var disDetail = getDiscomfortDetail(day);
    var chips = [];
    if (steps !== null && steps > 0) chips.push(renderChip("Adım: " + steps.toLocaleString("tr-TR"), false));
    if (m.walkM > 0) chips.push(renderChip("Yürüyüş: " + m.walkM + " m", false));
    if (m.vehicleM > 0) chips.push(renderChip("Araç: " + m.vehicleM + " m", false));
    if (m.totalM > 0) chips.push(renderChip("Toplam: " + m.totalM + " m", false));
    if (disDetail.totalRegions > 0) chips.push(renderChip("Rahatsızlık: " + disDetail.totalRegions + " bölge", false));
    var segs = Array.isArray(loc.segments) ? loc.segments : [];
    var cats = [];
    segs.forEach(function(seg) { if (seg && seg.category && cats.indexOf(seg.category) === -1) cats.push(seg.category); });
    if (cats.length) chips.push(renderChip("Konum kategorileri: " + cats.join(", "), false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (steps !== null && steps > 0) {
      html += DetailBlock({ icon: "steps", title: "Adım", body: steps.toLocaleString("tr-TR") + " adım" });
    }
    if (m.walkM > 0 || m.vehicleM > 0 || m.totalM > 0) {
      var movBody = "";
      if (m.walkM) movBody += "Yürüyüş: " + m.walkM + " m";
      if (m.vehicleM) movBody += (movBody ? "<br>" : "") + "Araç: " + m.vehicleM + " m";
      if (m.totalM) movBody += (movBody ? "<br>" : "") + "Toplam: " + m.totalM + " m";
      if (m.maxSpeed) movBody += (movBody ? "<br>" : "") + "Max hız: " + m.maxSpeed + " m/sn";
      if (m.samples) movBody += (movBody ? "<br>" : "") + "Örnek: " + m.samples + " adet";
      if (m.walkSec) movBody += (movBody ? "<br>" : "") + "Yürüyüş süre: " + fmtDuration(m.walkSec / 60);
      if (m.vehicleSec) movBody += (movBody ? "<br>" : "") + "Araç süre: " + fmtDuration(m.vehicleSec / 60);
      html += DetailBlock({ icon: "movement", title: "Hareket", body: movBody });
    }

    if (disDetail.totalRegions > 0 || dis.note || (dis.meds && dis.meds.length)) {
      var regBody = disDetail.regions.map(function(r) {
        var levelStr = ["○", "●", "●●", "●●●"][r.level] || "●";
        return "• " + escapeHtml(r.id) + " " + levelStr;
      }).join("<br>");
      if (dis.note) regBody += (regBody ? "<br>" : "") + "Not: " + escapeHtml(dis.note);
      if (dis.meds && dis.meds.length) regBody += (regBody ? "<br>" : "") + "İlaç: " + dis.meds.map(function(med){ return escapeHtml(String(med)); }).join(", ");
      html += DetailBlock({ icon: "medicine", title: "Rahatsızlık & İlaç (" + disDetail.totalRegions + " bölge)", body: regBody });
    }

    if (cats.length) {
      html += DetailBlock({ icon: "location", title: "Konum kategorileri", body: cats.map(function(c){ return "• " + escapeHtml(c); }).join("<br>"), redacted: false });
    }

    return DetailSection({
      id: "movement",
      title: "Hareket",
      icon: "steps",
      emptyText: "Bugün için hareket veya adım kaydı yok.",
      children: html
    });
  }

  function renderLocationTimeline(date) {
    var locInfo = getLocationInfo();
    if (!locInfo || (!locInfo.historyCount && !locInfo.current)) return "";

    // Gün detayı açık olsa bile geçmişi günle sınırlama: kart, güncel noktayı
    // ve tüm geçmişteki anlamlı yer değişikliklerini birlikte göstermeli.
    var scopedHistory = locationHistoryWithCurrent(locInfo);
    var mapData = compressLocationHistory(scopedHistory);
    var mapId = "ae-map-" + (date || "all");
    var mapDataJson = escapeHtml(JSON.stringify(mapData));

    // En güncel güvenilir noktayı yalnızca Google Maps'te açılacak nokta olarak kullan.
    var navigationPoint = null;
    var pointCandidates = [];
    if (locInfo.current) pointCandidates.push(locInfo.current);
    for (var pointIndex = locInfo.history.length - 1; pointIndex >= 0; pointIndex--) pointCandidates.push(locInfo.history[pointIndex]);
    pointCandidates.some(function(point) {
      var normalized = normalizeLocationPoint(point);
      if (!normalized) return false;
      navigationPoint = normalized;
      return true;
    });
    var mapsUrl = locationMapsUrl(navigationPoint);
    var mapsActionHtml = mapsUrl
      ? '<div class="loc-actions"><a class="ae-btn ae-btn--primary loc-map-link" href="' + escapeHtml(mapsUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="Güncel noktayı Google Maps üzerinde aç">' + renderIcon("arrowRight", 14) + ' Güncel noktayı Google Maps’te aç</a></div>'
      : "";

    // Kompakt üst bilgi
    var infoHtml = '<div class="loc-info">' +
      '<span class="loc-info__item">' + (locInfo.enabled ? "Açık" : "Kapalı") + '</span>' +
      '<span class="loc-info__item">' + escapeHtml(locInfo.mode) + '</span>' +
      '<span class="loc-info__item">' + mapData.length.toLocaleString("tr-TR") + ' anlamlı nokta</span>' +
      '<span class="loc-info__item">' + scopedHistory.length.toLocaleString("tr-TR") + ' örnek</span>' +
      '</div>';

    // Harita konteyneri
    var mapHtml = '<div class="loc-map-wrap">' +
      '<div id="' + mapId + '" class="loc-map" data-points=\'' + mapDataJson + '\'></div>' +
      '</div>';

    // Kompakt zaman çizelgesi (sadece saat farkı + koordinat)
    var timelineHtml = '';
    if (mapData.length) {
      var items = mapData.map(function(h, i) {
        var first = h.firstTs ? new Date(h.firstTs) : null;
        var last = h.lastTs ? new Date(h.lastTs) : null;
        var firstTime = first && !isNaN(first.getTime()) ? first.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "—";
        var lastTime = last && !isNaN(last.getTime()) ? last.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : firstTime;
        var timeStr = firstTime === lastTime ? firstTime : firstTime + "–" + lastTime;
        var latStr = typeof h.lat === 'number' ? h.lat.toFixed(4) : "—";
        var lngStr = typeof h.lng === 'number' ? h.lng.toFixed(4) : "—";
        var accStr = h.samples > 1 ? h.samples + " örnek" : (h.acc ? h.acc + "m" : "1 nokta");
        return '<div class="loc-dot-row">' +
          '<span class="loc-dot"></span>' +
          '<span class="loc-dot__time">' + escapeHtml(timeStr) + '</span>' +
          '<span class="loc-dot__coord">' + escapeHtml(latStr + ", " + lngStr) + '</span>' +
          (accStr ? '<span class="loc-dot__acc">' + escapeHtml(accStr) + '</span>' : '') +
          (locationMapsUrl(h) ? '<a class="loc-dot__map" href="' + escapeHtml(locationMapsUrl(h)) + '" target="_blank" rel="noopener noreferrer" aria-label="Bu geçmiş konumu Google Maps üzerinde aç">' + renderIcon("arrowRight", 13) + ' Maps</a>' : '') +
          '</div>';
      }).join("");
      timelineHtml = '<details class="loc-history-details">' +
        '<summary class="loc-history-details__summary"><span class="loc-history-details__title">Tüm anlamlı konum geçmişi</span><span class="loc-history-details__count">' + mapData.length.toLocaleString("tr-TR") + ' nokta</span><span class="loc-history-details__chevron" aria-hidden="true">' + renderIcon("arrowRight", 14) + '</span></summary>' +
        '<div class="loc-timeline-compact">' + items + '</div>' +
        '</details>';
    }

    // Ayar değişiklikleri (kompakt)
    var eventsHtml = '';
    if (locInfo.enabledAt) {
      eventsHtml += '<div class="loc-event"><span class="loc-event__icon">' + renderIcon("check", 14) + '</span><span class="loc-event__text">' + escapeHtml(formatTs(locInfo.enabledAt)) + (locInfo.enabledReason ? ' · ' + escapeHtml(locInfo.enabledReason) : '') + '</span></div>';
    }
    if (locInfo.disabledAt) {
      eventsHtml += '<div class="loc-event"><span class="loc-event__icon">' + renderIcon("lock", 14) + '</span><span class="loc-event__text">' + escapeHtml(formatTs(locInfo.disabledAt)) + (locInfo.disabledReason ? ' · ' + escapeHtml(locInfo.disabledReason) : '') + '</span></div>';
    }

    return AeCard({
      variant: "glass",
      className: "today-section-card today-section-card--location",
      children: '<div class="loc-section">' +
        '<div class="ae-label">' + renderIcon("location", 16) + ' Konum & Zaman Çizelgesi</div>' +
        infoHtml +
        mapsActionHtml +
        mapHtml +
        timelineHtml +
        (eventsHtml ? '<div class="loc-events">' + eventsHtml + '</div>' : '') +
        '</div>'
    });
  }

  function renderAppSessionInfo() {
    var session = getAppSessionInfo();
    if (!session) return "";

    return AeCard({
      variant: "glass",
      children: '<div class="sess-section">' +
        '<div class="ae-label">' + renderIcon("phone", 16) + ' Uygulama Oturumu</div>' +
        '<div class="sess-grid">' +
        (session.startDate ? '<div class="sess-item"><span class="sess-item__label">Başlangıç</span><span class="sess-item__value">' + escapeHtml(formatDateLabel(session.startDate)) + '</span></div>' : '') +
        (session.lastOpenedDate ? '<div class="sess-item"><span class="sess-item__label">Son açılış</span><span class="sess-item__value">' + escapeHtml(formatDateLabel(session.lastOpenedDate)) + '</span></div>' : '') +
        (session.lastOpenedAt ? '<div class="sess-item"><span class="sess-item__label">Açılış zamanı</span><span class="sess-item__value">' + escapeHtml(formatTs(session.lastOpenedAt)) + '</span></div>' : '') +
        (session.savedAt ? '<div class="sess-item"><span class="sess-item__label">Son kayıt</span><span class="sess-item__value">' + escapeHtml(formatTs(session.savedAt)) + '</span></div>' : '') +
        '<div class="sess-item"><span class="sess-item__label">Toplam gün</span><span class="sess-item__value">' + session.dayCount + '</span></div>' +
        '</div></div>'
    });
  }

  function renderDayTimestamps(date) {
    var day = getDay(date) || {};

    var savedAt = getDaySavedAt(date);
    if (!savedAt) {
      return DetailSection({
        id: "day-timestamps",
        title: "Kayıt zamanları",
        icon: "clock",
        emptyText: "Bu gün için kayıt zamanı bilgisi yok.",
        children: ""
      });
    }

    var items = '<div class="sess-item"><span class="sess-item__label">Kayıt</span><span class="sess-item__value">' + escapeHtml(formatTs(savedAt)) + '</span></div>';
    if (day.journal && day.journal.savedAt) {
      items += '<div class="sess-item"><span class="sess-item__label">Günlük</span><span class="sess-item__value">' + escapeHtml(formatTs(day.journal.savedAt)) + (day.journal.mode ? ' · ' + escapeHtml(day.journal.mode) : '') + '</span></div>';
    }

    return AeCard({
      variant: "summary",
      children: '<div class="sess-section">' +
        '<div class="ae-label">' + renderIcon("clock", 16) + ' Kayıt Zamanları</div>' +
        '<div class="sess-grid">' + items + '</div></div>'
    });
  }

  function renderDayLocation(date) {
    return renderLocationTimeline(date) || DetailSection({
      id: "day-location",
      title: "Konum",
      icon: "location",
      emptyText: "Bu gün için konum geçmişi kaydı yok.",
      children: ""
    });
  }

  function renderContent(date) {
    var day = getDay(date) || {};
    var reading = contentEntries(day, "reading");
    var watching = contentEntries(day, "watching");
    var listening = contentEntries(day, "listening");
    var learning = getLearningEntries(day);
    var soul = getSoulActivities(day);
    var quotes = Array.isArray(day.quotes) ? day.quotes : [];

    var chips = [];
    if (reading.length) chips.push(renderChip("Okuma: " + reading.length, false));
    if (watching.length) chips.push(renderChip("İzleme: " + watching.length, false));
    if (listening.length) chips.push(renderChip("Dinleme: " + listening.length, false));
    if (learning.length) chips.push(renderChip("Öğrenme: " + learning.length, false));
    if (soul.length) chips.push(renderChip("Ruh-beden: " + soul.length, false));
    if (quotes.length) chips.push(renderChip("Alıntı: " + quotes.length, false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    function renderEntryList(items, icon, title, fn) {
      if (!items.length) return "";
      var body = items.map(function(e, i) {
        return '<div class="detail-block__sub">' +
               '<strong>#' + (i + 1) + "</strong> " + escapeHtml(fn(e).title) +
               (fn(e).meta ? '<div class="detail-block__meta">' + escapeHtml(fn(e).meta) + "</div>" : "") +
               (fn(e).note ? '<div class="detail-block__note">' + nl2br(escapeHtml(fn(e).note)) + "</div>" : "") +
               "</div>";
      }).join("");
      return DetailBlock({ icon: icon, title: title + " (" + items.length + ")", body: body });
    }

    html += renderEntryList(reading, "book", "Okuma", function(e) {
      return { title: e.title || "Kitap", meta: (e.pages ? e.pages + " sayfa" : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.author ? " · " + e.author : ""), note: e.note || "" };
    });
    html += renderEntryList(watching, "watch", "İzleme", function(e) {
      return { title: e.title || "İzleme", meta: (e.episodes ? e.episodes + " bölüm" : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.kind ? " · " + e.kind : ""), note: e.note || "" };
    });
    html += renderEntryList(listening, "listen", "Dinleme", function(e) {
      return { title: e.title || "Parça", meta: (e.artist ? e.artist : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.kind ? " · " + e.kind : ""), note: e.note || "" };
    });
    html += renderEntryList(learning, "learning", "Öğrenme", function(e) {
      return { title: e.title || "Konu", meta: (e.minutes ? e.minutes + " dk" : "") + (e.topic ? " · " + e.topic : ""), note: e.note || "" };
    });
    if (soul.length) {
      var soulBody = soul.map(function(a) {
        return '<div class="detail-block__sub"><strong>' + escapeHtml(a.label || a.type || "Aktivite") + "</strong>" +
               (a.duration ? '<div class="detail-block__meta">' + fmtDuration(a.duration) + "</div>" : "") +
               (a.note ? '<div class="detail-block__note">' + escapeHtml(a.note) + "</div>" : "") +
               "</div>";
      }).join("");
      html += DetailBlock({ icon: "soul", title: "Ruh-beden aktiviteleri (" + soul.length + ")", body: soulBody });
    }
    if (quotes.length) {
      var quotesBody = quotes.map(function(q) {
        return '<div class="detail-block__sub">“' + escapeHtml(q.text || "") + "”" +
               (q.source ? '<div class="detail-block__meta">— ' + escapeHtml(q.source) + "</div>" : "") +
               "</div>";
      }).join("");
      html += DetailBlock({ icon: "note", title: "Alıntılar (" + quotes.length + ")", body: quotesBody });
    }

    return DetailSection({
      id: "content",
      title: "İçerik",
      icon: "book",
      emptyText: "Okuma, izleme veya dinleme kaydı yok.",
      children: html
    });
  }

  function showToast(message, type) {
    var text = safeText(message, 240);
    if (!text) return null;
    var allowedTypes = ["success", "error", "info"];
    var toastType = allowedTypes.indexOf(type) !== -1 ? type : "info";
    var id = toastState.id + 1;
    toastState = {
      visible: true,
      id: id,
      message: text,
      type: toastType,
      duration: 4200
    };
    render();
    setTimeout(function() {
      if (toastState.id === id) dismissToast(id);
    }, toastState.duration);
    return id;
  }

  function dismissToast(id) {
    if (!toastState.visible) return;
    if (id !== undefined && id !== null && String(toastState.id) !== String(id)) return;
    toastState.visible = false;
    render();
  }

  function renderToastHost() {
    if (!toastState.visible) return "";
    return '<div class="ae-toast-viewport" id="ae-toast-container">' +
           AeToast({ id: toastState.id, message: toastState.message, type: toastState.type }) +
           "</div>";
  }

  function renderDayGroup(label, contents) {
    var parts = Array.isArray(contents) ? contents : [contents];
    var content = parts.filter(function(part) {
      return part !== null && part !== undefined && String(part).trim();
    }).join("");
    if (!content) return "";
    return '<details class="day-detail-accordion ae-slide-up" open>' +
           '<summary class="day-detail-accordion__summary" aria-label="' + escapeHtml(label + " bölümünü aç veya kapat") + '">' +
           AeDivider({ label: label, inline: true }) +
           '<span class="day-detail-accordion__chevron" aria-hidden="true">' + renderIcon("arrowRight", 14) + '</span>' +
           '</summary>' +
           '<div class="day-detail-accordion__body">' + content + '</div>' +
           '</details>';
  }

  function renderDay() {
    var date = todayStr();
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    if (!dayCount) {
      return '<div class="day-view ae-stagger">' +
             AeCard({
               children: AeEmpty({
                 icon: "calendar",
                 title: "Gün Detayı",
                 message: "Henüz synced veri yok. Veri geldiğinde seçili gün burada görünecek."
               })
             }) +
             "</div>";
    }
    var day = getDay(date);
    var emptyDay = !day ? '<div class="day-view__empty ae-stagger">' + AeCard({
      children: AeEmpty({
        icon: "calendar",
        title: "Boş gün",
        message: "Bu tarihe ait kayıt yok. Takvimden başka bir gün seçebilirsin."
      })
    }) + "</div>" : "";
    var groups = day ? '<div class="day-detail-groups ae-stagger">' +
           renderDayGroup("Zamanlar", [renderDayTimestamps(date)]) +
           renderDayGroup("Ruh Hali", [renderMoodTherapy(date), renderEnergyStress(date)]) +
           renderDayGroup("Alışkanlıklar", [renderHabits(date), renderCraving(date), renderWindDown(date), renderMagnesium(date)]) +
           renderDayGroup("Beslenme", [renderNutrition(date), renderNutri(date)]) +
           renderDayGroup("İbadet", [renderPrayer(date)]) +
           renderDayGroup("Hareket", [renderMovement(date)]) +
           renderDayGroup("Konum", [renderDayLocation(date)]) +
           renderDayGroup("Döngü", [renderCycle(date)]) +
           renderDayGroup("İçerik", [renderContent(date)]) +
           '</div>' : "";
    return '<div class="day-view ae-slide-up ae-stagger">' +
           renderDayDatePicker(date) +
           renderDayHeatmap(date) +
           groups +
           emptyDay +
           "</div>";
  }

  function SubTabs(opts) {
    opts = opts || {};
    var tabs = Array.isArray(opts.tabs) ? opts.tabs : [];
    var active = opts.active || (tabs[0] && tabs[0].id);
    var idPrefix = safeText(opts.idPrefix || "", 48).replace(/[^A-Za-z0-9_-]/g, "");
    var panelPrefix = safeText(opts.panelPrefix || "", 48).replace(/[^A-Za-z0-9_-]/g, "");
    var tablistLabel = safeText(opts.ariaLabel || "Alt sekmeler", 80);
    var scope = idPrefix.indexOf("ae-system-subtab") === 0 ? "system" : "archive";
    var html = '<div class="sub-tabs" role="tablist" aria-label="' + escapeHtml(tablistLabel) + '" data-a11y-scope="' + scope + '">';
    tabs.forEach(function(t) {
      var isActive = t.id === active;
      var tabId = idPrefix ? idPrefix + "-" + t.id : "";
      var panelId = panelPrefix ? panelPrefix + "-" + t.id : "";
      html += '<button type="button" class="sub-tab' + (isActive ? " is-active" : "") + '" ' +
              (tabId ? 'id="' + escapeHtml(tabId) + '" ' : "") +
              'role="tab" aria-selected="' + (isActive ? "true" : "false") + '" ' +
              'tabindex="' + (isActive ? "0" : "-1") + '" ' +
              (panelId ? 'aria-controls="' + escapeHtml(panelId) + '" ' : "") +
              'aria-label="' + escapeHtml(safeText(t.label, 24)) + '" ' +
              'data-a11y-scope="' + scope + '" ' +
              'data-subtab-id="' + escapeHtml(String(t.id || "")) + '" ' +
              'onclick="' + escapeHtml(String(opts.onChange || "").replace(/\{id\}/g, t.id)) + '">' +
              escapeHtml(safeText(t.label, 24)) + "</button>";
    });
    html += "</div>";
    return html;
  }

  function setArchiveSubTab(id) {
    var valid = ["library", "watch", "listen", "quotes"];
    if (valid.indexOf(id) === -1) return;
    if (ui.subTab !== id) {
      ui.archivePage = 1;
      ui.archiveStatus = "all";
      ui.archiveKind = "all";
    }
    ui.subTab = id;
    requestFocus("ae-archive-subtab-" + id);
    announce("Arşiv alt sekmesi: " + id);
    render();
  }

  function setSystemSubTab(id) {
    var valid = SYSTEM_SUB_TABS.map(function(tab) { return tab.id; });
    if (valid.indexOf(id) === -1) return;
    if (ui.systemSubTab !== id) ui.systemSubTabTransition = true;
    ui.systemSubTab = id;
    requestFocus("ae-system-subtab-" + id);
    announce("Sistem alt sekmesi: " + id);
    render();
  }

  function eventAdapter() {
    var adapter = root.PanelCoverageV1 || root.SeymaPanelCoverage;
    return adapter && typeof adapter.parseEventLog === "function" && typeof adapter.normalizeEvent === "function" ? adapter : null;
  }

  function parsePanelEvents() {
    var adapter = eventAdapter();
    if (!adapter) return { ok: false, code: "event_adapter_missing", events: [] };
    var rootData = isObject(appData) ? appData : {};
    var raw = isObject(rootData.eventLog) ? rootData.eventLog : null;
    var parsed;
    try {
      parsed = adapter.parseEventLog(raw, todayStr());
    } catch (e) {
      return { ok: false, code: "event_log_parse_failed", events: [] };
    }
    var events = [];
    (parsed && Array.isArray(parsed.events) ? parsed.events : []).forEach(function(event) {
      var normalized = adapter.normalizeEvent(event, event && event.sourceDeviceId);
      if (normalized) events.push(normalized);
    });
    events.sort(function(a, b) {
      return String(b.occurredAt || "").localeCompare(String(a.occurredAt || "")) || Number(b.sequence || 0) - Number(a.sequence || 0) || String(a.eventId).localeCompare(String(b.eventId));
    });
    return { ok: !!(parsed && parsed.ok), code: parsed && parsed.code || null, date: parsed && parsed.date || null, events: events };
  }

  function eventSectionLabel(section) {
    var value = String(section || "unknown");
    for (var i = 0; i < EVENT_SECTION_OPTIONS.length; i++) {
      if (EVENT_SECTION_OPTIONS[i].value === value) return EVENT_SECTION_OPTIONS[i].label;
    }
    return "Diğer";
  }

  function eventOperationLabel(operation) {
    var value = String(operation || "update");
    return EVENT_OPERATION_LABELS[value] || safeText(value, 32) || "Güncelle";
  }

  function eventIcon(section) {
    return EVENT_SECTION_ICONS[String(section || "unknown")] || EVENT_SECTION_ICONS.unknown;
  }

  function eventDateKey(ts) {
    var date = new Date(ts);
    return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }

  function eventTimeLabel(ts) {
    var date = new Date(ts);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }

  function eventDateTimeLabel(ts) {
    var date = new Date(ts);
    return isNaN(date.getTime()) ? "—" : date.toLocaleString("tr-TR");
  }

  function eventRevisionLabel(revision) {
    var value = safeText(revision, 80);
    return value ? "rev-" + value.slice(0, 8) : "—";
  }

  function auditRevisionValue(value) {
    var revision = safeText(value, 128);
    return /^[a-f0-9]{7,128}$/i.test(revision) ? revision : "";
  }

  function eventJsArg(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function eventMatchesFilters(event) {
    if (ui.eventSection !== "all" && event.section !== ui.eventSection) return false;
    if (ui.eventOperation !== "all" && event.operation !== ui.eventOperation) return false;
    var day = eventDateKey(event.occurredAt);
    if (ui.eventFrom && (!day || day < ui.eventFrom)) return false;
    if (ui.eventTo && (!day || day > ui.eventTo)) return false;
    return true;
  }

  function filteredPanelEvents(parsed) {
    return (parsed && Array.isArray(parsed.events) ? parsed.events : []).filter(eventMatchesFilters);
  }

  function setEventFilter(kind, value) {
    value = String(value || "");
    if (kind === "section") {
      var sections = EVENT_SECTION_OPTIONS.map(function(item) { return item.value; });
      ui.eventSection = value === "all" || sections.indexOf(value) !== -1 ? value : "all";
    } else if (kind === "operation") {
      var operations = EVENT_OPERATION_OPTIONS.map(function(item) { return item.value; });
      ui.eventOperation = value === "all" || operations.indexOf(value) !== -1 ? value : "all";
    } else if (kind === "from" || kind === "to") {
      ui[kind === "from" ? "eventFrom" : "eventTo"] = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
    } else {
      return;
    }
    ui.eventPage = 1;
    render();
  }

  function setEventLimit(limit) {
    limit = Math.round(safeNumber(limit) || 20);
    if ([20, 50, 100].indexOf(limit) === -1) return;
    ui.eventLimit = limit;
    ui.eventPage = 1;
    render();
  }

  function setEventPage(page) {
    page = Math.max(1, Math.round(safeNumber(page) || 1));
    ui.eventPage = page;
    render();
  }

  function selectEvent(eventId) {
    var nextId = eventId ? String(eventId) : "";
    var wasOpen = !!ui.selectedEventId;
    if (nextId && !wasOpen) {
      rememberFocus();
      accessibilityState.trapRestoreKey = accessibilityState.lastFocusKey;
    } else if (!nextId && wasOpen) {
      requestFocus("", accessibilityState.trapRestoreKey);
    }
    ui.selectedEventId = nextId;
    announce(nextId ? "Olay detayı açıldı." : "Olay detayı kapatıldı.");
    render();
  }

  function clearEventFilters() {
    ui.eventSection = "all";
    ui.eventOperation = "all";
    ui.eventFrom = "";
    ui.eventTo = "";
    ui.eventPage = 1;
    render();
  }

  function setDensity(d) {
    var allowed = ["compact", "comfortable", "spacious"];
    if (allowed.indexOf(d) === -1) return;
    ui.density = d;
    var rootEl = root.document && root.document.getElementById("root");
    if (rootEl) rootEl.setAttribute("data-density", d);
    render();
  }

  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    ui.theme = theme;
    var rootEl = root.document && root.document.getElementById("root");
    if (rootEl) rootEl.setAttribute("data-theme", theme);
    render();
  }

  function normalizeToken(v) {
    return String(v || "").replace(/[^\x20-\x7E]/g, "").trim();
  }

  function getLocalToken() {
    try {
      if (root.localStorage) return normalizeToken(root.localStorage.getItem(PTKEY));
    } catch (e) {}
    return "";
  }

  function setLocalToken(token) {
    try {
      if (root.localStorage && token) root.localStorage.setItem(PTKEY, token);
    } catch (e) {}
  }

  function removeLocalToken() {
    try {
      if (root.localStorage) root.localStorage.removeItem(PTKEY);
    } catch (e) {}
  }

  function normalizePollingInterval(value) {
    if (typeof value === "string" && /^(off|kapalı|kapali)$/i.test(value.trim())) return 0;
    var n = safeNumber(value);
    if (n === null) return null;
    n = Math.round(n);
    return POLLING_OPTIONS.some(function(option) { return option.value === n; }) ? n : null;
  }

  function pollingOptionLabel(intervalMs) {
    var value = normalizePollingInterval(intervalMs);
    for (var i = 0; i < POLLING_OPTIONS.length; i++) {
      if (POLLING_OPTIONS[i].value === value) return POLLING_OPTIONS[i].label;
    }
    return "Kapalı";
  }

  function savePollingPreferences() {
    try {
      if (root.localStorage) root.localStorage.setItem(PANEL_SETTINGS_KEY, JSON.stringify({
        intervalMs: pollingState.intervalMs,
        autoRefresh: pollingState.autoRefresh
      }));
    } catch (e) {}
  }

  function restorePollingPreferences() {
    var saved = null;
    try {
      if (root.localStorage) saved = JSON.parse(root.localStorage.getItem(PANEL_SETTINGS_KEY) || "null");
    } catch (e) { saved = null; }
    var intervalMs = saved && normalizePollingInterval(saved.intervalMs);
    pollingState.intervalMs = intervalMs === null ? 60000 : intervalMs;
    pollingState.autoRefresh = saved && typeof saved.autoRefresh === "boolean" ? saved.autoRefresh : pollingState.intervalMs > 0;
    if (pollingState.intervalMs === 0) pollingState.autoRefresh = false;
    syncStatus.pollingIntervalMs = pollingState.intervalMs;
  }

  function configurePolling(intervalMs, autoRefresh, shouldRender) {
    var normalized = normalizePollingInterval(intervalMs);
    if (normalized === null) return false;
    pollingState.intervalMs = normalized;
    pollingState.autoRefresh = normalized > 0 && autoRefresh !== false;
    syncStatus.pollingIntervalMs = normalized;
    savePollingPreferences();
    if (pollingState.autoRefresh && ui.panelToken) startPolling();
    else stopPolling();
    if (shouldRender !== false) render();
    return true;
  }

  function setPollingInterval(intervalMs) {
    var normalized = normalizePollingInterval(intervalMs);
    if (normalized === null) return false;
    return configurePolling(normalized, normalized > 0, true);
  }

  function setAutoRefresh(enabled) {
    enabled = enabled === true || String(enabled) === "true" || String(enabled) === "1";
    var intervalMs = pollingState.intervalMs;
    if (enabled && intervalMs === 0) intervalMs = 60000;
    return configurePolling(intervalMs, enabled, true);
  }

  function setPanelToken(token) {
    ui.panelToken = normalizeToken(token);
    if (ui.panelToken) {
      setLocalToken(ui.panelToken);
      startPolling();
    } else {
      removeLocalToken();
      stopPolling();
    }
    render();
    return true;
  }

  function startPolling() {
    if (!ui.panelToken || !pollingState.autoRefresh || pollingState.intervalMs <= 0 || typeof root.setInterval !== "function") return false;
    if (pollingState.intervalId !== null && pollingState.activeIntervalMs === pollingState.intervalMs) return true;
    if (pollingState.intervalId !== null) stopPolling();
    syncStatus.pollingIntervalMs = pollingState.intervalMs;
    pollingState.intervalId = root.setInterval(function() {
      if (pollingState.isPaused || !ui.panelToken) return;
      var doc = root.document;
      if (doc && doc.visibilityState === "hidden") return;
      pollingState.lastRunAt = new Date().toISOString();
      load();
    }, pollingState.intervalMs);
    pollingState.activeIntervalMs = pollingState.intervalMs;
    return true;
  }

  function stopPolling() {
    if (pollingState.intervalId !== null && typeof root.clearInterval === "function") {
      root.clearInterval(pollingState.intervalId);
    }
    pollingState.intervalId = null;
    pollingState.activeIntervalMs = null;
    pollingState.lastRunAt = null;
    return true;
  }

  function getPollingState() {
    return {
      intervalId: pollingState.intervalId,
      intervalMs: pollingState.intervalMs,
      activeIntervalMs: pollingState.activeIntervalMs,
      autoRefresh: pollingState.autoRefresh,
      isPaused: pollingState.isPaused,
      lastRunAt: pollingState.lastRunAt
    };
  }

  function formatTs(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString("tr-TR");
  }

  function firstStatusNumber(source, keys) {
    source = source || {};
    for (var i = 0; i < keys.length; i++) {
      var raw = source[keys[i]];
      var value = raw === null || raw === undefined || raw === "" ? null : safeNumber(raw);
      if (value !== null) return value;
    }
    return null;
  }

  function renderSystemProgress(opts) {
    opts = opts || {};
    var pct = opts.value === null || opts.value === undefined || opts.value === "" ? null : safeNumber(opts.value);
    var known = pct !== null;
    pct = known ? Math.max(0, Math.min(100, pct)) : 0;
    var tone = ["accent", "ok", "warn", "drop", "info", "muted"].indexOf(opts.tone) !== -1 ? opts.tone : "accent";
    var label = safeText(opts.label || "İlerleme", 60);
    var valueLabel = known ? Math.round(pct) + "%" : "Bilinmiyor";
    var visualPct = known ? pct : 34;
    var aria = known
      ? ' role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '" aria-valuetext="' + escapeHtml(valueLabel) + '"'
      : ' role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuetext="Bilgi yok"';
    return '<div class="system-progress system-progress--' + tone + (known ? "" : " system-progress--unknown") + '">' +
           '<div class="system-progress__head"><span class="system-progress__label">' + escapeHtml(label) +
           '</span><strong class="system-progress__value">' + escapeHtml(valueLabel) + "</strong></div>" +
           '<div class="system-progress__track"' + aria + '><span class="system-progress__fill" style="width:' + visualPct.toFixed(2) + '%"></span></div>' +
           (opts.detail ? '<div class="system-progress__detail">' + escapeHtml(safeText(opts.detail, 140)) + "</div>" : "") +
           "</div>";
  }

  function tokenLifetimeInfo(status) {
    status = status || {};
    var expiresAt = status.tokenExpiresAt || status.tokenExpiry || status.tokenExpires;
    var expiresMs = expiresAt ? new Date(expiresAt).getTime() : NaN;
    if (!isFinite(expiresMs)) {
      return {
        value: null,
        tone: "muted",
        detail: ui.panelToken ? "GitHub token süresi panel tarafından okunamıyor." : "Token ayarlanmadı."
      };
    }
    var issuedAt = status.tokenIssuedAt || status.tokenCreatedAt;
    var issuedMs = issuedAt ? new Date(issuedAt).getTime() : NaN;
    var now = Date.now();
    var pct = isFinite(issuedMs) && expiresMs > issuedMs
      ? ((expiresMs - now) / (expiresMs - issuedMs)) * 100
      : expiresMs > now ? 100 : 0;
    var daysLeft = Math.ceil((expiresMs - now) / 86400000);
    return {
      value: pct,
      tone: daysLeft <= 7 ? "warn" : "ok",
      detail: daysLeft > 0 ? daysLeft + " gün kaldı · Son: " + formatTs(new Date(expiresMs).toISOString()) : "Token süresi dolmuş görünüyor."
    };
  }

  function renderSystemLiveMetric(label, value, tone) {
    return '<div class="system-live-metric system-live-metric--' + (tone || "info") + '">' +
           '<span class="system-live-metric__label">' + escapeHtml(label) + "</span>" +
           '<strong class="system-live-metric__value">' + escapeHtml(String(value)) + "</strong></div>";
  }

  function renderSyncHealthMetric(label, value, meta, tone, icon) {
    return '<div class="sync-health-metric sync-health-metric--' + escapeHtml(tone || "info") + '">' +
           '<div class="sync-health-metric__head"><span class="sync-health-metric__icon">' + renderIcon(icon || "dot", 18) +
           '</span><span class="sync-health-metric__label">' + escapeHtml(label) + "</span></div>" +
           '<strong class="sync-health-metric__value">' + escapeHtml(String(value)) + "</strong>" +
           '<span class="sync-health-metric__meta">' + escapeHtml(String(meta || "—")) + "</span></div>";
  }

  function renderSyncRequestHistory() {
    var series = requestHistory24h();
    var count = requestCount24h();
    var valid = series.filter(function(value) { return value !== null; });
    var average = valid.length ? Math.round(valid.reduce(function(sum, value) { return sum + value; }, 0) / valid.length) : null;
    return AeCard({ variant: "glass", className: "sync-request-history", children:
      '<div class="sync-health-card__head"><div><div class="ae-label">İstek geçmişi</div><h3 class="sync-health-card__title">Son 24 saat</h3></div>' +
      '<span class="sync-health-card__badge">SVG</span></div>' +
      '<div class="sync-request-history__chart">' + AeSparkline(series, "info", 56, "İstek gecikmesi son 24 saat") + "</div>" +
      '<div class="sync-request-history__meta"><span>' + count + " istek</span><span>Ortalama: " + (average === null ? "—" : average + " ms") + "</span></div>"
    });
  }

  function syncErrorHistoryForRender(status) {
    status = status || {};
    var history = Array.isArray(status.errorHistory) ? status.errorHistory.slice() : [];
    if (!history.length && status.lastErrorCode) {
      history.push({ at: status.lastErrorAt, code: safeText(status.lastErrorCode, 60), status: null });
    }
    history.sort(function(a, b) { return String(b.at || "").localeCompare(String(a.at || "")); });
    return history.slice(0, 10);
  }

  function renderSyncErrorHistory(status) {
    var history = syncErrorHistoryForRender(status);
    var content = history.length
      ? '<div class="sync-error-history__list" role="list" aria-label="Son 10 senkron hatası">' + history.map(function(item) {
          var code = safeText(item.code || "request_failed", 60);
          var http = safeNumber(item.status);
          return '<div class="sync-error-history__row" role="listitem"><span class="sync-error-history__dot" aria-hidden="true"></span>' +
                 '<span class="sync-error-history__time">' + escapeHtml(formatTs(item.at)) + "</span>" +
                 '<strong class="sync-error-history__code">' + escapeHtml(code) + "</strong>" +
                 (http === null ? "" : '<span class="sync-error-history__status">HTTP ' + http + "</span>") +
                 "</div>";
        }).join("") + "</div>"
      : '<div class="sync-error-history__empty" role="status">Henüz senkron hatası yok.</div>';
    return AeCard({ variant: "glass", className: "sync-error-history", children:
      '<div class="sync-health-card__head"><div><div class="ae-label">Tanı</div><h3 class="sync-health-card__title">Hata geçmişi</h3></div><span class="sync-health-card__badge">SON 10</span></div>' + content
    });
  }

  function renderSyncApiHealth(status, apiRemaining, apiTotal, apiPct, apiReset, tokenInfo) {
    var remainingLabel = apiRemaining === null ? "Bilinmiyor" : apiRemaining + (apiTotal === null ? "" : " / " + apiTotal);
    var resetLabel = apiReset ? formatTs(apiReset) : "Bilinmiyor";
    var tokenLabel = ui.panelToken ? "Token ayarlı" : "Token yok";
    return AeCard({ variant: "glass", className: "sync-api-health", children:
      '<div class="sync-health-card__head"><div><div class="ae-label">GitHub bağlantısı</div><h3 class="sync-health-card__title">API durumu</h3></div>' +
      AeStatusBadge({ status: ui.panelToken ? (status.status || "idle") : "idle", label: tokenLabel }) + "</div>" +
      '<div class="sync-api-health__rows"><div class="sync-api-health__row"><span>Kalan limit</span><strong>' + escapeHtml(remainingLabel) +
      '</strong></div><div class="sync-api-health__row"><span>Sıfırlanma</span><strong>' + escapeHtml(resetLabel) +
      '</strong></div><div class="sync-api-health__row"><span>Token durumu</span><strong>' + escapeHtml(tokenInfo.detail) + "</strong></div></div>" +
      renderSystemProgress({ label: "API limiti", value: apiPct, tone: apiPct !== null && apiPct >= 25 ? "ok" : "warn", detail: apiRemaining === null ? "Rate-limit başlığı bekleniyor." : remainingLabel + " istek kaldı" })
    });
  }

  function renderStatusDetail() {
    var s = syncStatus || {};
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    var apiRemaining = firstStatusNumber(s, ["apiRateLimitRemaining", "apiLimitRemaining", "rateLimitRemaining", "limitRemaining"]);
    var apiTotal = firstStatusNumber(s, ["apiLimitTotal", "rateLimitLimit", "limitTotal"]);
    var apiPct = apiRemaining !== null && apiTotal > 0 ? (apiRemaining / apiTotal) * 100 : null;
    var freshness = dataFreshnessLabel(s.lastSyncedAt);
    var freshnessMinutes = dataAgeMinutes(s.lastSyncedAt);
    var pollingActive = pollingState.intervalId !== null && !!ui.panelToken;
    var pollingLabel = pollingActive ? Math.round((s.pollingIntervalMs || 60000) / 1000) + " sn aktif" : "Kapalı";
    var apiDetail = apiRemaining !== null
      ? apiRemaining + (apiTotal !== null ? " / " + apiTotal + " istek" : " istek kaldı")
      : "GitHub yanıtından limit bilgisi bekleniyor.";
    if (s.apiRateLimitReset || s.apiLimitResetAt) apiDetail += " · Sıfırlanma: " + formatTs(s.apiRateLimitReset || s.apiLimitResetAt);
    var tokenInfo = tokenLifetimeInfo(s);
    var health = syncHealthInfo(s);
    var latencyLabel = (s.p50LatencyMs !== null && s.p50LatencyMs !== undefined ? s.p50LatencyMs : "—") + " / " +
      (s.p95LatencyMs !== null && s.p95LatencyMs !== undefined ? s.p95LatencyMs : "—") + " ms";
    var healthMetrics = '<div class="sync-health-metrics ae-stagger" aria-label="Senkron sağlık metrikleri">' +
      renderSyncHealthMetric("Durum", health.label, health.meta, health.tone, health.tone === "drop" ? "crisis" : "check") +
      renderSyncHealthMetric("Gecikme", latencyLabel, "p50 / p95", "info", "clock") +
      renderSyncHealthMetric("Hata oranı", syncErrorRateLabel(s), (s.errorCount || 0) + " / " + (s.totalFetchCount || 0) + " istek", syncErrorRatePercent(s) === null || syncErrorRatePercent(s) === 0 ? "ok" : syncErrorRatePercent(s) >= 10 ? "drop" : "warn", "crisis") +
      renderSyncHealthMetric("Veri tazeliği", freshnessMinutes === null ? "—" : freshnessMinutes + " dk", freshness, freshnessMinutes === null ? "muted" : freshnessMinutes <= 5 ? "ok" : freshnessMinutes <= 60 ? "warn" : "drop", "refresh") +
      "</div>";
    var rows = [
      { label: "Durum", value: s.status || "idle" },
      { label: "Son senkron", value: s.lastSyncedAt ? formatTs(s.lastSyncedAt) : "—" },
      { label: "Veri tazeliği", value: freshness },
      { label: "Son başarılı", value: s.lastSuccessAt ? formatTs(s.lastSuccessAt) : "—" },
      { label: "Gün sayısı", value: dayCount },
      { label: "Revision", value: s.snapshotRevision || "—" },
      { label: "ETag", value: s.etag || "—" },
      { label: "p50 gecikme", value: s.p50LatencyMs !== null && s.p50LatencyMs !== undefined ? s.p50LatencyMs + " ms" : "—" },
      { label: "p95 gecikme", value: s.p95LatencyMs !== null && s.p95LatencyMs !== undefined ? s.p95LatencyMs + " ms" : "—" },
      { label: "Son istek", value: s.lastFetchDurationMs !== null && s.lastFetchDurationMs !== undefined ? s.lastFetchDurationMs + " ms" : "—" },
      { label: "Toplam istek", value: s.totalFetchCount !== undefined ? s.totalFetchCount : "—" },
      { label: "Hata sayısı", value: s.errorCount !== undefined ? s.errorCount : "—" },
      { label: "Ardışık hata", value: s.consecutiveErrors !== undefined ? s.consecutiveErrors : "—" },
      { label: "Polling", value: pollingLabel },
      { label: "304 sayısı", value: s.notModifiedCount !== undefined ? s.notModifiedCount : "—" }
    ];
    var body = rows.map(function(r) {
      return '<div class="status-row"><span class="status-row__label">' + escapeHtml(r.label) +
             '</span><span class="status-row__value">' + escapeHtml(String(r.value)) + "</span></div>";
    }).join("");
    var liveMetrics = '<div class="system-live-metrics ae-stagger" aria-label="Canlı sistem metrikleri">' +
      renderSystemLiveMetric("Durum", s.status || "idle", s.status === "error" ? "drop" : "ok") +
      renderSystemLiveMetric("p50 gecikme", s.p50LatencyMs !== null && s.p50LatencyMs !== undefined ? s.p50LatencyMs + " ms" : "—", "info") +
      renderSystemLiveMetric("p95 gecikme", s.p95LatencyMs !== null && s.p95LatencyMs !== undefined ? s.p95LatencyMs + " ms" : "—", "info") +
      renderSystemLiveMetric("Tazelik", freshness, freshness === "Henüz senkron yok" ? "muted" : "ok") +
      renderSystemLiveMetric("Polling", pollingLabel, pollingActive ? "ok" : "muted") +
      renderSystemLiveMetric("İstek / hata", (s.totalFetchCount || 0) + " / " + (s.errorCount || 0), s.errorCount ? "warn" : "accent") +
      renderSystemLiveMetric("304 yanıt", s.notModifiedCount !== undefined ? s.notModifiedCount : "—", "accent") +
      "</div>";
    var progress = '<div class="system-progress-list" aria-label="Sistem kaynak ilerlemeleri">' +
      renderSystemProgress({ label: "API limit kalan", value: apiPct, tone: apiPct !== null && apiPct >= 25 ? "ok" : "warn", detail: apiDetail }) +
      renderSystemProgress({ label: "Token ömrü", value: tokenInfo.value, tone: tokenInfo.tone, detail: tokenInfo.detail }) +
      "</div>";
    var errorBox = s.lastErrorCode
      ? AeCard({ variant: "glass", className: "status-error", children:
        '<div class="status-error__title">Son hata</div>' +
        '<div class="status-error__code">' + escapeHtml(String(s.lastErrorCode)) + "</div>" +
        '<div class="status-error__hint">Tekrar denemek için Yenile düğmesine bas.</div>'
      })
      : "";
    return '<div class="status-detail ae-slide-up ae-stagger">' +
           healthMetrics +
           renderSyncRequestHistory() +
           '<div class="sync-health-secondary">' + renderSyncApiHealth(s, apiRemaining, apiTotal, apiPct, s.apiRateLimitReset || s.apiLimitResetAt, tokenInfo) + renderSyncErrorHistory(s) + "</div>" +
           AeCard({ variant: "glass", className: "status-card", children:
             '<div class="system-card__head"><div><div class="ae-label">Canlı sistem durumu</div><h2 class="system-card__title">Senkronizasyon ve kaynaklar</h2></div>' +
             AeStatusBadge({ status: s.status || "idle" }) + "</div>" + liveMetrics + progress +
             '<div class="status-rows">' + body + "</div>" }) +
           renderAppSessionInfo() +
           errorBox +
           "</div>";
  }

  function eventOptionMarkup(options, selected, allLabel) {
    var html = '<option value="all"' + (selected === "all" ? " selected" : "") + '>' + escapeHtml(allLabel || "Tümü") + "</option>";
    (Array.isArray(options) ? options : []).forEach(function(item) {
      html += '<option value="' + escapeHtml(item.value) + '"' + (selected === item.value ? " selected" : "") + '>' + escapeHtml(item.label) + "</option>";
    });
    return html;
  }

  function eventPageButton(labelHtml, page, disabled, ariaLabel) {
    var attrs = ' tabindex="0" aria-label="' + escapeHtml(ariaLabel || labelHtml) + '"';
    if (disabled) attrs += ' disabled aria-disabled="true"';
    else attrs += ' onclick="' + escapeHtml("AeonV2.setEventPage(" + page + ")") + '"';
    return '<button type="button" class="ae-btn ae-btn--text event-log-page-btn"' + attrs + '>' + labelHtml + "</button>";
  }

  function renderEventFilters(total, filtered) {
    var hasFilters = ui.eventSection !== "all" || ui.eventOperation !== "all" || ui.eventFrom || ui.eventTo;
    return '<div class="event-log-controls" aria-label="Olay günlüğü filtreleri">' +
           '<div class="event-log-controls__head"><div><div class="ae-label">Filtreler</div><div class="event-log-controls__summary">' +
           total + " toplam · " + filtered + " gösteriliyor</div></div>" +
           (hasFilters ? AeButton({ labelHtml: renderIcon("close", 14) + " Filtreleri temizle", variant: "text", className: "event-log-clear", onclick: "AeonV2.clearEventFilters()", ariaLabel: "Olay filtrelerini temizle" }) : "") +
           "</div>" +
           '<div class="event-log-filter-grid">' +
           '<label class="event-log-filter"><span>Bölüm</span><select class="event-filter-section" aria-label="Olay bölümü" onchange="AeonV2.setEventFilter(\'section\', this.value)">' +
           eventOptionMarkup(EVENT_SECTION_OPTIONS, ui.eventSection, "Tüm bölümler") + "</select></label>" +
           '<label class="event-log-filter"><span>İşlem</span><select class="event-filter-operation" aria-label="Olay işlemi" onchange="AeonV2.setEventFilter(\'operation\', this.value)">' +
           eventOptionMarkup(EVENT_OPERATION_OPTIONS, ui.eventOperation, "Tüm işlemler") + "</select></label>" +
           '<label class="event-log-filter"><span>Başlangıç</span><input class="event-filter-from" type="date" aria-label="Olay başlangıç tarihi" value="' + escapeHtml(ui.eventFrom) + '" onchange="AeonV2.setEventFilter(\'from\', this.value)" /></label>' +
           '<label class="event-log-filter"><span>Bitiş</span><input class="event-filter-to" type="date" aria-label="Olay bitiş tarihi" value="' + escapeHtml(ui.eventTo) + '" onchange="AeonV2.setEventFilter(\'to\', this.value)" /></label>' +
           "</div></div>";
  }

  function renderEventDetail(event) {
    if (!event) {
      return '<div class="event-detail-drawer event-detail-drawer--empty" role="complementary" aria-label="Olay detay drawerı">' +
             AeEmpty({ icon: "note", title: "Bir olay seç", message: "Detaylarını görmek için listedeki bir olaya dokun." }) +
             "</div>";
    }
    var detailRows = [
      { label: "Olay ID", value: event.eventId },
      { label: "Korelasyon", value: event.correlationId },
      { label: "Sıra", value: event.sequence },
      { label: "Bölüm", value: eventSectionLabel(event.section) + " › " + event.path },
      { label: "İşlem", value: eventOperationLabel(event.operation) },
      { label: "Zaman", value: eventDateTimeLabel(event.occurredAt) },
      { label: "Revizyon", value: eventRevisionLabel(event.snapshotRevision) },
      { label: "Kaynak", value: (event.source || "app") + " · " + (event.sourceDeviceId || "—") },
      { label: "Gizlilik", value: event.privacyClass || "summary" }
    ];
    var rows = detailRows.map(function(row) {
      return '<div class="event-detail-row"><span class="event-detail-row__label">' + escapeHtml(row.label) +
             '</span><span class="event-detail-row__value">' + escapeHtml(String(row.value)) + "</span></div>";
    }).join("");
    return '<aside class="event-detail-drawer ae-card ae-card--glass" role="dialog" aria-modal="true" aria-labelledby="ae-event-detail-title" tabindex="-1" data-focus-trap="true" aria-label="Seçili olay detayı" data-event-id="' + escapeHtml(event.eventId) + '">' +
           '<div class="event-detail-drawer__head"><div><div class="ae-label">Seçili olay</div><h3 id="ae-event-detail-title" class="event-detail-drawer__title">' +
           escapeHtml(eventSummaryLabel(event)) + '</h3></div>' +
           AeButton({ labelHtml: renderIcon("close", 16) + " Kapat", variant: "text", className: "event-detail-drawer__close", onclick: "AeonV2.selectEvent('')", ariaLabel: "Olay detayını kapat" }) +
           "</div>" +
           '<div class="event-detail-drawer__meta"><span class="event-log-operation">' + escapeHtml(eventOperationLabel(event.operation)) + "</span> · " + escapeHtml(eventSectionLabel(event.section)) + "</div>" +
           '<div class="event-detail-drawer__summary">' + escapeHtml(event.summary || "Güvenli kayıt özeti") + "</div>" +
           '<div class="event-detail-rows">' + rows + "</div></aside>";
  }

  function eventSummaryLabel(event) {
    var summary = safeText(event && event.summary, 96);
    return summary || "Güvenli olay kaydı";
  }

  function renderEventRow(event) {
    var selected = ui.selectedEventId === event.eventId;
    var onclick = "AeonV2.selectEvent('" + eventJsArg(event.eventId) + "')";
    return '<button type="button" tabindex="0" class="event-log-row' + (selected ? " is-selected" : "") + '" data-event-id="' + escapeHtml(event.eventId) +
           '" aria-pressed="' + (selected ? "true" : "false") + '" aria-label="' + escapeHtml(eventSummaryLabel(event)) + '" onclick="' + escapeHtml(onclick) + '">' +
           '<span class="event-log-row__time">' + escapeHtml(eventTimeLabel(event.occurredAt)) + "</span>" +
           '<span class="event-log-row__icon">' + renderIcon(eventIcon(event.section), 18) + "</span>" +
           '<span class="event-log-row__body"><span class="event-log-row__head"><strong>' + escapeHtml(eventSectionLabel(event.section)) +
           '</strong><span class="event-log-operation">' + escapeHtml(eventOperationLabel(event.operation)) + "</span></span>" +
           '<span class="event-log-row__summary">' + escapeHtml(eventSummaryLabel(event)) + "</span></span>" +
           '<span class="event-log-row__revision">' + escapeHtml(eventRevisionLabel(event.snapshotRevision)) + "</span></button>";
  }

  function renderEventLog() {
    var parsed = parsePanelEvents();
    var allEvents = parsed.events || [];
    var filtered = filteredPanelEvents(parsed);
    var limit = [20, 50, 100].indexOf(ui.eventLimit) !== -1 ? ui.eventLimit : 20;
    var pageCount = Math.max(1, Math.ceil(filtered.length / limit));
    var page = Math.min(Math.max(1, ui.eventPage || 1), pageCount);
    ui.eventPage = page;
    var start = (page - 1) * limit;
    var pageEvents = filtered.slice(start, start + limit);
    var selected = allEvents.filter(function(event) { return event.eventId === ui.selectedEventId; })[0] || null;
    var list = pageEvents.length
      ? '<div class="event-log-list" role="list" aria-label="Olay kayıtları">' + pageEvents.map(renderEventRow).join("") + "</div>"
      : AeEmpty({ icon: "note", title: allEvents.length ? "Filtre sonucu yok" : "Henüz olay yok", message: allEvents.length ? "Seçtiğin filtrelere uyan güvenli olay bulunamadı." : "Manifest event log alanı henüz bir kayıt taşımıyor." });
    var pagination = '<div class="event-log-pagination" aria-label="Olay sayfalama">' +
      eventPageButton(renderIcon("arrowLeft", 16) + " Önceki", page - 1, page <= 1, "Önceki olay sayfası") +
      '<span class="event-log-pagination__info">Sayfa ' + page + " / " + pageCount + "</span>" +
      eventPageButton("Sonraki " + renderIcon("arrowRight", 16), page + 1, page >= pageCount, "Sonraki olay sayfası") +
      '<div class="event-log-limit" aria-label="Sayfa boyutu">' + [20, 50, 100].map(function(value) {
        return AeButton({ label: String(value), variant: "pill", className: "event-log-limit__button" + (limit === value ? " is-active" : ""), onclick: "AeonV2.setEventLimit(" + value + ")", ariaLabel: value + " olay göster" });
      }).join("") + "</div></div>";
    var sourceLabel = parsed.ok ? "PanelCoverageV1 normalize/parse" : "Event adapter bekleniyor";
    return '<div class="event-log-detail ae-slide-up ae-stagger">' +
           AeCard({ variant: "glass", className: "event-log-card", children:
             '<div class="system-card__head"><div><div class="ae-label">Gözlemlenebilir değişiklikler</div><h2 class="system-card__title event-log-title">Olay Günlüğü</h2><div class="event-log-source">' + escapeHtml(sourceLabel) + "</div></div>" +
             AeStatusBadge({ status: parsed.ok ? (allEvents.length ? "accepted" : "idle") : "error", label: parsed.ok ? "Güvenli" : "Bekliyor" }) +
             "</div>" + renderEventFilters(allEvents.length, filtered.length) + list + pagination
           }) + renderEventDetail(selected) +
           "</div>";
  }

  function auditChronologicalEvents(events) {
    return (Array.isArray(events) ? events : []).slice().sort(function(a, b) {
      return String(a && a.occurredAt || "").localeCompare(String(b && b.occurredAt || "")) ||
             Number(a && a.sequence || 0) - Number(b && b.sequence || 0) ||
             String(a && a.eventId || "").localeCompare(String(b && b.eventId || ""));
    });
  }

  function auditIssueText(issue) {
    issue = issue || {};
    var device = safeText(issue.device || "cihaz", 96) || "cihaz";
    var sequence = safeNumber(issue.sequence);
    if (issue.kind === "out_of_order") {
      return "Sıra dışı · " + device + " · seq " + (sequence === null ? "—" : sequence) + " (önceki " + (safeNumber(issue.previous) === null ? "—" : issue.previous) + ")";
    }
    if (issue.kind === "sequence_gap") {
      var from = safeNumber(issue.from), to = safeNumber(issue.to);
      var missing = from !== null && to !== null ? Math.max(0, to - from - 1) : 0;
      return "Eksik · " + device + " · seq " + (from === null ? "—" : from) + " → " + (to === null ? "—" : to) + " (" + missing + " olay)";
    }
    if (issue.kind === "duplicate_sequence") {
      return "Çift kayıt · " + device + " · seq " + (sequence === null ? "—" : sequence);
    }
    return "Bilinmeyen sıra sinyali · " + device;
  }

  function auditSequenceReport() {
    var parsed = parsePanelEvents();
    var events = auditChronologicalEvents(parsed && parsed.events);
    var adapter = eventAdapter();
    var audit = { ok: true, issueCount: 0, issues: [], deviceCount: 0 };
    var adapterReady = !!(adapter && typeof adapter.eventSequenceAudit === "function");
    if (adapterReady) {
      try {
        audit = adapter.eventSequenceAudit(events) || audit;
      } catch (e) {
        adapterReady = false;
      }
    }
    var issues = Array.isArray(audit.issues) ? audit.issues.slice(0, 100) : [];
    var counts = { outOfOrder: 0, missing: 0, duplicate: 0 };
    issues.forEach(function(issue) {
      if (!issue) return;
      if (issue.kind === "out_of_order") counts.outOfOrder += 1;
      else if (issue.kind === "duplicate_sequence") counts.duplicate += 1;
      else if (issue.kind === "sequence_gap") {
        var from = safeNumber(issue.from), to = safeNumber(issue.to);
        counts.missing += from !== null && to !== null ? Math.max(0, to - from - 1) : 0;
      }
    });

    var revisions = {};
    function addRevision(value, event, current) {
      var revision = auditRevisionValue(value);
      if (!revision) return;
      var row = revisions[revision];
      if (!row) {
        row = revisions[revision] = { revision: revision, eventCount: 0, lastAt: null, device: "", section: "", current: false };
      }
      row.current = row.current || current === true;
      if (current === true && !row.lastAt) row.lastAt = syncStatus.lastSyncedAt || null;
      if (event) {
        row.eventCount += 1;
        if (!row.lastAt || String(event.occurredAt || "") > String(row.lastAt)) {
          row.lastAt = event.occurredAt || null;
          row.device = safeText(event.sourceDeviceId || "", 96);
          row.section = safeText(event.section || "", 40);
        }
      }
    }
    events.forEach(function(event) { addRevision(event && event.snapshotRevision, event, false); });
    addRevision(syncStatus.snapshotRevision, null, true);
    var revisionRows = Object.keys(revisions).map(function(key) { return revisions[key]; });
    revisionRows.sort(function(a, b) {
      return (b.current ? 1 : 0) - (a.current ? 1 : 0) ||
             String(b.lastAt || "").localeCompare(String(a.lastAt || "")) ||
             String(b.revision).localeCompare(String(a.revision));
    });

    var status = !adapterReady || (parsed && parsed.code) ? "missing" : !events.length ? "missing" : audit.issueCount ? "warning" : "ok";
    return {
      status: status,
      source: adapterReady ? "PanelCoverageV1 eventSequenceAudit" : "Event sequence adapter bekleniyor",
      parsed: parsed,
      events: events,
      audit: audit,
      issues: issues,
      issueTexts: issues.map(auditIssueText),
      counts: counts,
      revisions: revisionRows.slice(0, 20),
      totalRevisionCount: revisionRows.length
    };
  }

  function renderAuditSequenceReport(report) {
    report = report || auditSequenceReport();
    var statusLabel = report.status === "ok" ? "Temiz" : report.status === "warning" ? "Uyarı" : "Bekliyor";
    var statusCode = report.status === "ok" ? "accepted" : report.status === "warning" ? "conflict" : "idle";
    var counts = report.counts || { outOfOrder: 0, missing: 0, duplicate: 0 };
    var metrics = [
      { label: "Sıra dışı olay", value: counts.outOfOrder, tone: counts.outOfOrder ? "warn" : "ok", icon: "arrowRight" },
      { label: "Eksik olay", value: counts.missing, tone: counts.missing ? "warn" : "ok", icon: "dot" },
      { label: "Çift kayıt", value: counts.duplicate, tone: counts.duplicate ? "drop" : "ok", icon: "copy" }
    ].map(function(metric) {
      return '<div class="audit-sequence-metric audit-sequence-metric--' + metric.tone + '">' +
             '<span class="audit-sequence-metric__icon">' + renderIcon(metric.icon, 16) + '</span>' +
             '<span class="audit-sequence-metric__label">' + escapeHtml(metric.label) + '</span>' +
             '<strong class="audit-sequence-metric__value">' + escapeHtml(String(metric.value)) + '</strong></div>';
    }).join("");
    var issueList = report.issues.length
      ? '<ol class="audit-sequence-issues" aria-label="Sıra denetimi sorunları">' + report.issueTexts.slice(0, 20).map(function(text, index) {
          return '<li class="audit-sequence-issue"><span class="audit-sequence-issue__index">' + (index + 1) + '</span><span>' + escapeHtml(text) + '</span></li>';
        }).join("") + '</ol>' + (report.issues.length > 20 ? '<div class="audit-sequence-more">+' + (report.issues.length - 20) + ' sorun daha</div>' : "")
      : '<div class="audit-sequence-empty" role="status">Sıra dışı, eksik veya çift sequence bulunmadı.</div>';
    return AeCard({ variant: "glass", className: "audit-sequence-card", children:
      '<div class="system-card__head"><div><div class="ae-label">Event zinciri · ' + escapeHtml(report.source) + '</div><h2 class="system-card__title">Sıra Denetimi</h2><div class="audit-sequence-summary">' +
      (report.events.length ? report.events.length + ' olay · ' + (report.audit.deviceCount || 0) + ' cihaz' : 'Henüz normalize edilmiş olay yok') +
      '</div></div>' + AeStatusBadge({ status: statusCode, label: statusLabel }) + '</div>' +
      '<div class="audit-sequence-metrics" aria-label="Sıra denetimi metrikleri">' + metrics + '</div>' +
      '<div class="audit-sequence-report"><div class="ae-label">Detaylı rapor</div>' + issueList + '</div>'
    });
  }

  function renderAuditRevisions(report) {
    report = report || auditSequenceReport();
    var rows = Array.isArray(report.revisions) ? report.revisions : [];
    var content = rows.length
      ? '<ol class="audit-revision-list" aria-label="Son 20 snapshot revizyonu">' + rows.map(function(row) {
          return '<li class="audit-revision-row' + (row.current ? ' is-current' : '') + '">' +
                 '<div class="audit-revision-row__head"><strong>' + escapeHtml(eventRevisionLabel(row.revision)) + '</strong>' +
                 (row.current ? '<span class="audit-revision-row__current">Güncel</span>' : '') +
                 '<time datetime="' + escapeHtml(row.lastAt || "") + '">' + escapeHtml(formatTs(row.lastAt)) + '</time></div>' +
                 '<div class="audit-revision-row__meta"><span>' + (row.eventCount ? row.eventCount + ' olay' : 'Receipt revision') + '</span>' +
                 (row.device ? '<span>' + escapeHtml(row.device) + '</span>' : '') +
                 (row.section ? '<span>' + escapeHtml(eventSectionLabel(row.section)) + '</span>' : '') + '</div></li>';
        }).join("") + '</ol>' + (report.totalRevisionCount > 20 ? '<div class="audit-revision-more">+' + (report.totalRevisionCount - 20) + ' eski revizyon</div>' : '')
      : '<div class="audit-revision-empty" role="status">Snapshot revision bekleniyor.</div>';
    return AeCard({ variant: "glass", className: "audit-revision-card", children:
      '<div class="system-card__head"><div><div class="ae-label">Snapshot geçmişi</div><h2 class="system-card__title">Revizyon Geçmişi</h2></div><span class="audit-card__badge">SON 20</span></div>' + content
    });
  }

  function renderAuditDetail() {
    var proj = projectData(appData);
    var sequenceReport = auditSequenceReport();
    var coverage = proj && proj.coverage ? proj.coverage : {};
    var redacted = Array.isArray(coverage.redacted) ? coverage.redacted.length : 0;
    var summary = Array.isArray(coverage.summary) ? coverage.summary.length : 0;
    var full = Array.isArray(coverage.full) ? coverage.full.length : 0;
    var events = [
      { icon: coverage.error ? "crisis" : "check", label: "Coverage durumu", value: coverage.error ? "Hata" : "Hazır", meta: "Manifest kapsamı ve redaksiyon sözleşmesi" },
      { icon: "shield", label: "Redacted alan", value: redacted, meta: "Ham hassas alanlar observer görünümünden çıkarıldı" },
      { icon: "note", label: "Summary alan", value: summary, meta: "Özetlenmiş alanlar güvenli projeksiyona açık" },
      { icon: "archive", label: "Full alan", value: full, meta: "Tam görünürlükteki izinli alanlar" },
      { icon: "arrowRight", label: "Provenance", value: "observer-snapshot", meta: "Veri kaynağı ve redaksiyon izi" },
      { icon: "refresh", label: "Polling", value: pollingState.intervalId !== null ? Math.round((syncStatus.pollingIntervalMs || 60000) / 1000) + " sn aktif" : "Kapalı", meta: syncStatus.lastSyncedAt ? "Son kontrol: " + dataFreshnessLabel(syncStatus.lastSyncedAt) : "Henüz canlı kontrol yapılmadı" },
      { icon: "messages", label: "Son log", value: Array.isArray(coverage.unmappedPaths) && coverage.unmappedPaths.length ? coverage.unmappedPaths.slice(0, 3).join(", ") : "—", meta: "Kapsam dışı yol denetimi" }
    ];
    var timeline = '<ol class="audit-timeline" aria-label="Audit zaman çizelgesi">' + events.map(function(event) {
      return '<li class="audit-timeline__item"><span class="audit-timeline__marker" aria-hidden="true">' + renderIcon(event.icon, 16) + "</span>" +
             '<div class="audit-timeline__body"><div class="audit-timeline__head"><strong>' + escapeHtml(event.label) +
             '</strong><span class="audit-timeline__value">' + escapeHtml(String(event.value)) + "</span></div>" +
             '<div class="audit-timeline__meta">' + escapeHtml(event.meta) + "</div></div></li>";
    }).join("") + "</ol>";
    return '<div class="audit-detail ae-slide-up ae-stagger">' +
           AeCard({ variant: "glass", className: "audit-card", children: '<div class="system-card__head"><div><div class="ae-label">Güvenlik ve veri akışı</div><h2 class="system-card__title">Coverage zaman çizelgesi</h2></div><span class="audit-card__badge">LIVE</span></div>' + timeline }) +
           renderAuditSequenceReport(sequenceReport) + renderAuditRevisions(sequenceReport) +
           '<div class="audit-hint">Yalnızca izin verilen alanlar observer\'a yansıtılır. Detaylar panelCoverageManifest.js\'te tanımlı.</div>' +
           "</div>";
  }

  function notificationProjectionAdapter() {
    var adapter = root.PanelCoverageV1 || root.SeymaPanelCoverage;
    return adapter && typeof adapter.notificationEventProjection === "function" ? adapter : null;
  }

  function notificationProjection(raw, kind) {
    var adapter = notificationProjectionAdapter();
    if (!adapter) return null;
    try {
      return adapter.notificationEventProjection(raw, kind || "notification", {
        acceptedAt: syncStatus.lastSyncedAt,
        snapshotRevision: syncStatus.snapshotRevision
      });
    } catch (e) {
      return null;
    }
  }

  function notificationTimeLabel(ts) {
    if (!ts) return "Bekliyor";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function notificationDurationLabel(start, end) {
    var startMs = start ? new Date(start).getTime() : NaN;
    var endMs = end ? new Date(end).getTime() : NaN;
    if (!isFinite(startMs) || !isFinite(endMs) || endMs < startMs) return "—";
    var seconds = Math.max(0, Math.round((endMs - startMs) / 1000));
    var days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    var parts = [];
    if (days) parts.push(days + "g");
    if (hours) parts.push(hours + "sa");
    if (minutes || hours || days) parts.push(minutes + "dk");
    if (seconds || !parts.length) parts.push(seconds + "sn");
    return parts.join(" ");
  }

  function notificationStatusLabel(projection) {
    projection = projection || {};
    if (projection.errorCode) return "Hata";
    if (projection.readAt) return "Okundu";
    if (projection.deliveredAt) return "İletildi";
    if (projection.sentAt) return "Gönderildi";
    if (projection.createdAt) return "Oluşturuldu";
    return "Bekliyor";
  }

  function notificationStatusTone(projection) {
    projection = projection || {};
    if (projection.errorCode) return "drop";
    if (projection.readAt) return "ok";
    if (projection.deliveredAt || projection.sentAt) return "info";
    return "muted";
  }

  function buildNotificationMessages() {
    var rootData = isObject(appData) ? appData : {};
    var notifications = Array.isArray(rootData.notifications) ? rootData.notifications : [];
    var qa = rootData.aeon && Array.isArray(rootData.aeon.qa) ? rootData.aeon.qa : [];
    var messages = [];

    notifications.forEach(function(n, index) {
      if (!isObject(n)) return;
      var projection = notificationProjection(n, "notification");
      if (!projection) return;
      var id = safeText(projection.id || n.id || "notification-" + index, 120) || "notification-" + index;
      messages.push({
        id: id,
        direction: "in",
        from: safeText(n.from || "Observer", 80) || "Observer",
        kind: safeText(n.kind || "notification", 48) || "notification",
        text: safeText(n.text || n.body || "", 1200),
        title: safeText(n.title || "", 120),
        ts: projection.createdAt || projection.inboxAt || "",
        projection: projection
      });
    });

    qa.forEach(function(q, index) {
      if (!isObject(q)) return;
      if (q.question) {
        var questionProjection = notificationProjection({
          id: q.id || "aeon-question-" + index,
          ts: q.ts || q.askedAt,
          sentAt: q.sentAt || q.submittedAt,
          inboxAt: q.inboxAt || q.queuedAt,
          deliveredAt: q.deliveredAt || q.receivedAt,
          readAt: q.questionReadAt,
          repliedAt: q.answeredAt
        }, "aeon_question");
        if (questionProjection) messages.push({
          id: safeText(questionProjection.id || "aeon-question-" + index, 120) || "aeon-question-" + index,
          direction: "out",
          from: "Sen",
          kind: "aeon_ask",
          text: safeText(q.question, 1200),
          title: safeText(q.title || "", 120),
          ts: questionProjection.createdAt || "",
          projection: questionProjection
        });
      }
      if (q.answer) {
        var answerProjection = notificationProjection({
          id: q.answerMsgId || q.id || "aeon-answer-" + index,
          ts: q.answeredAt || q.answerReceivedAt || q.ts,
          sentAt: q.answerSentAt || q.answerSubmittedAt,
          inboxAt: q.answerInboxAt,
          receivedAt: q.answerReceivedAt,
          deliveredAt: q.answerDeliveredAt,
          readAt: q.answerReadAt,
          synced: q.answerSynced,
          errorCode: q.answerErrorCode
        }, "aeon_answer");
        if (answerProjection) messages.push({
          id: safeText(answerProjection.id || "aeon-answer-" + index, 120) || "aeon-answer-" + index,
          direction: "in",
          from: "Observer",
          kind: "aeon_answer",
          text: safeText(q.answer, 1200),
          title: safeText(q.answerTitle || "", 120),
          ts: answerProjection.createdAt || "",
          projection: answerProjection
        });
      }
    });
    messages.sort(function(a, b) { return String(b.ts || "").localeCompare(String(a.ts || "")); });
    return messages;
  }

  function notificationStageSpecs(message) {
    var projection = message && message.projection ? message.projection : {};
    return [
      { key: "createdAt", label: "Oluşturuldu", icon: "note", at: projection.createdAt },
      { key: "sentAt", label: "Gönderildi", icon: "arrowRight", at: projection.sentAt },
      { key: "deliveredAt", label: "Cihaza ulaştı", icon: "phone", at: projection.deliveredAt },
      { key: "readAt", label: message && message.kind === "aeon_answer" ? "Görüldü" : "Okundu", icon: "check", at: projection.readAt },
      { key: "repliedAt", label: "Yanıtlandı", icon: "messages", at: projection.repliedAt }
    ];
  }

  function renderNotificationTimeline(message) {
    if (!message || !message.projection) {
      return AeEmpty({ icon: "messages", title: "Zaman çizelgesi bekleniyor", message: "Güvenli notification projection henüz hazır değil." });
    }
    var specs = notificationStageSpecs(message);
    var currentIndex = -1;
    specs.some(function(stage, index) {
      if (!stage.at) { currentIndex = index; return true; }
      return false;
    });
    var completed = specs.filter(function(stage) { return !!stage.at; });
    var lastAt = completed.length ? completed[completed.length - 1].at : null;
    var rows = specs.map(function(stage, index) {
      var state = stage.at ? "complete" : (index === currentIndex ? "current" : "pending");
      var time = stage.at ? notificationTimeLabel(stage.at) : "Bekliyor";
      return '<li class="notification-timeline__item notification-timeline__item--' + state + '">' +
             '<span class="notification-timeline__dot" aria-hidden="true"></span>' +
             '<div class="notification-timeline__body"><div class="notification-timeline__head"><strong>' + escapeHtml(stage.label) +
             '</strong><span class="notification-timeline__time">' + escapeHtml(time) + '</span></div>' +
             '<div class="notification-timeline__meta">' + (stage.at ? escapeHtml(message.projection.provenance || "metadata") : "Henüz gerçekleşmedi") + '</div></div></li>';
    }).join("");
    return '<ol class="notification-timeline" aria-label="Bildirim yaşam döngüsü">' + rows + '</ol>' +
           '<div class="notification-timeline__total"><span>Toplam süre</span><strong>' + escapeHtml(notificationDurationLabel(message.projection.createdAt, lastAt)) + '</strong></div>';
  }

  function selectNotification(id) {
    var messages = buildNotificationMessages();
    if (messages.some(function(message) { return message.id === String(id || ""); })) {
      ui.selectedNotificationId = String(id);
      announce("Bildirim detayı seçildi.");
      render();
    }
  }

  function setMessageDraft(value) {
    ui.messageDraft = safeText(String(value || ""), OBSERVER_MESSAGE_MAX * 12);
  }

  function base64EncodeUtf8(value) {
    var input = unescape(encodeURIComponent(String(value || "")));
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    for (var i = 0; i < input.length; i += 3) {
      var a = input.charCodeAt(i), b = i + 1 < input.length ? input.charCodeAt(i + 1) : NaN, c = i + 2 < input.length ? input.charCodeAt(i + 2) : NaN;
      output += alphabet.charAt(a >> 2);
      output += alphabet.charAt(((a & 3) << 4) | (isNaN(b) ? 0 : b >> 4));
      output += isNaN(b) ? "=" : alphabet.charAt(((b & 15) << 2) | (isNaN(c) ? 0 : c >> 6));
      output += isNaN(c) ? "=" : alphabet.charAt(c & 63);
    }
    return output;
  }

  function base64DecodeUtf8(value) {
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var input = String(value || "").replace(/\s/g, "");
    var binary = "";
    for (var i = 0; i < input.length; i += 4) {
      var a = alphabet.indexOf(input.charAt(i)), b = alphabet.indexOf(input.charAt(i + 1)), c = alphabet.indexOf(input.charAt(i + 2)), d = alphabet.indexOf(input.charAt(i + 3));
      if (a < 0 || b < 0) continue;
      binary += String.fromCharCode((a << 2) | (b >> 4));
      if (c >= 0) binary += String.fromCharCode(((b & 15) << 4) | (c >> 2));
      if (d >= 0) binary += String.fromCharCode(((c & 3) << 6) | d);
    }
    try { return decodeURIComponent(escape(binary)); } catch (e) { return binary; }
  }

  function observerInboxApi() {
    var p = String(REPO || "").split("/");
    return "https://api.github.com/repos/" + encodeURIComponent(p[0]) + "/" + encodeURIComponent(p[1]) + "/contents/" + OBSERVER_INBOX_PATH;
  }

  function observerInboxHeaders() {
    return { "Authorization": "Bearer " + ui.panelToken, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  }

  function observerWriteBlockedByOrigin() {
    var location = root.location;
    if (!location) return false;
    var host = String(location.hostname || "").toLowerCase();
    var protocol = String(location.protocol || "").toLowerCase();
    var localOrigin = protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "::1" || /\.local$/.test(host);
    if (!localOrigin) return false;
    var forced = String(location.search || "").indexOf("forceSync=1") !== -1;
    try { forced = forced || root.localStorage.getItem("seyma-sync-force") === "1"; } catch (e) {}
    return !forced;
  }

  function loadObserverInbox() {
    return root.fetch(observerInboxApi() + "?ref=" + encodeURIComponent(BRANCH) + "&t=" + Date.now(), { headers: observerInboxHeaders(), cache: "no-store" }).then(function(response) {
      if (response.status === 404) return { messages: [], receipts: {}, sha: null };
      if (!response.ok) {
        var missingError = new Error("inbox " + response.status);
        missingError.status = response.status;
        throw missingError;
      }
      return response.json().then(function(githubFile) {
        var parsed = {};
        try { parsed = JSON.parse(base64DecodeUtf8(githubFile && githubFile.content)); } catch (e) { parsed = {}; }
        return { messages: Array.isArray(parsed.messages) ? parsed.messages : [], receipts: isObject(parsed.receipts) ? parsed.receipts : {}, sha: githubFile && githubFile.sha ? githubFile.sha : null };
      });
    });
  }

  function putObserverInbox(messages, sha, receipts) {
    var payload = { messages: Array.isArray(messages) ? messages : [] };
    if (isObject(receipts) && Object.keys(receipts).length) payload.receipts = receipts;
    var body = { message: "observer: mesaj guncelle", content: base64EncodeUtf8(JSON.stringify(payload, null, 2)), branch: BRANCH };
    if (sha) body.sha = sha;
    var headers = observerInboxHeaders();
    headers["Content-Type"] = "application/json";
    return root.fetch(observerInboxApi(), { method: "PUT", headers: headers, body: JSON.stringify(body) }).then(function(response) {
      if (response.ok) return response;
      var error = new Error("inbox " + response.status);
      error.status = response.status;
      throw error;
    });
  }

  function appendObserverMessage(entry, attempt) {
    attempt = attempt || 0;
    return loadObserverInbox().then(function(current) {
      var messages = current.messages.slice();
      if (!messages.some(function(message) { return message && message.id === entry.id; })) messages.push(entry);
      if (messages.length > OBSERVER_MESSAGE_MAX) messages = messages.slice(-OBSERVER_MESSAGE_MAX);
      return putObserverInbox(messages, current.sha, current.receipts);
    }).catch(function(error) {
      if ((error && (error.status === 409 || error.status === 422)) && attempt < 2) return appendObserverMessage(entry, attempt + 1);
      throw error;
    });
  }

  function sendMessage() {
    if (ui.messageSending) return Promise.resolve(false);
    var text = String(ui.messageDraft || "").trim();
    if (!text) {
      showToast("Önce bir mesaj yaz.", "info");
      return Promise.resolve(false);
    }
    if (!ui.panelToken) {
      showToast("Mesaj göndermek için panel tokenı gerekli.", "error");
      return Promise.resolve(false);
    }
    if (observerWriteBlockedByOrigin()) {
      showToast("Yerel ortamda mesaj yazımı kapalı; canlı Pages panelini kullan.", "error");
      return Promise.resolve(false);
    }
    var now = new Date().toISOString();
    var entry = { id: "m_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7), text: safeText(text, OBSERVER_MESSAGE_MAX * 6), ts: now, createdAt: now, sentAt: now, from: "Observer", kind: "observer_message" };
    ui.messageSending = true;
    render();
    return Promise.resolve().then(function() { return appendObserverMessage(entry); }).then(function() {
      ui.messageDraft = "";
      ui.messageSending = false;
      showToast("Mesaj observer-inbox kuyruğuna alındı.", "success");
      render();
      return true;
    }).catch(function(error) {
      ui.messageSending = false;
      showToast("Mesaj gönderilemedi: " + safeText(error && error.message || "bağlantı hatası", 120), "error");
      render();
      return false;
    });
  }

  function renderMessages() {
    var messages = buildNotificationMessages();
    var selected = messages.filter(function(message) { return message.id === ui.selectedNotificationId; })[0] || messages[0] || null;
    if (selected && ui.selectedNotificationId !== selected.id) ui.selectedNotificationId = selected.id;
    var unreadCount = messages.filter(function(message) { return message.direction === "in" && !message.projection.readAt; }).length;
    var summary = '<div class="message-summary"><span class="ae-chip">' + messages.length + " mesaj</span>" +
                  (unreadCount ? '<span class="message-summary__unread">' + unreadCount + " okunmamış</span>" : '<span class="message-summary__quiet">Tüm mesajlar okundu</span>') +
                  '<span class="message-summary__projection">PanelCoverageV1 projection</span></div>';
    var list = messages.length
      ? '<div class="message-list" role="list" aria-label="Bildirimler">' + messages.map(function(message) {
          var status = notificationStatusLabel(message.projection);
          var tone = notificationStatusTone(message.projection);
          var selectedClass = selected && selected.id === message.id ? " is-selected" : "";
          var unreadClass = message.direction === "in" && !message.projection.readAt ? " message-bubble--unread" : "";
          return '<button type="button" tabindex="0" class="message-bubble message-bubble--' + message.direction + unreadClass + selectedClass + ' notification-message-row" role="listitem" data-notification-id="' + escapeHtml(message.id) + '" aria-pressed="' + (selected && selected.id === message.id ? "true" : "false") + '" aria-label="' + escapeHtml(safeText(message.title || message.text || "Bildirim", 120)) + '" onclick="AeonV2.selectNotification(\'' + escapeHtml(inlineArg(message.id)) + '\')">' +
                 '<div class="message-bubble__meta"><span>' + escapeHtml(message.from) + " · " + escapeHtml(notificationTimeLabel(message.ts)) + " · " + escapeHtml(message.kind || "mesaj") + '</span><span class="notification-message-row__status notification-message-row__status--' + tone + '">' + escapeHtml(status) + "</span></div>" +
                 (message.title ? '<div class="message-bubble__title">' + escapeHtml(message.title) + "</div>" : "") +
                 '<div class="message-bubble__text">' + nl2br(escapeHtml(message.text || "(Metin yok)")) + "</div>" +
                 "</button>";
        }).join("") + "</div>"
      : AeEmpty({ icon: "messages", title: "Henüz mesaj yok", message: "Gelen ve giden mesajlar burada listelenecek." });

    var tokenValue = (ui.panelToken || "").replace(/./g, "•");
    var saveBtn = ui.panelToken
      ? AeButton({ labelHtml: renderIcon("refresh", 16) + " Şimdi senkronize et", variant: "primary", onclick: "AeonV2.refresh()", ariaLabel: "Şimdi senkronize et" })
      : "";
    var draft = safeText(ui.messageDraft || "", OBSERVER_MESSAGE_MAX * 12);
    var composerDisabled = !ui.panelToken || ui.messageSending;
    var composer = AeCard({ variant: "glass", className: "message-composer", children:
      '<div class="message-composer__head"><div><div class="ae-label">Observer → Şeyma</div><h3 class="message-composer__title">Yeni mesaj</h3></div>' +
      '<span class="message-composer__privacy">Ayrı inbox kanalı</span></div>' +
      '<textarea id="ae-message-draft" class="message-composer__input" maxlength="1200" rows="3" placeholder="Mesajını yaz…" aria-label="Yeni mesaj" oninput="AeonV2.setMessageDraft(this.value)" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();AeonV2.sendMessage();}">' + escapeHtml(draft) + '</textarea>' +
      '<div class="message-composer__foot"><span class="message-composer__hint">' + (ui.panelToken ? "Enter gönderir · Shift+Enter yeni satır" : "Önce GitHub tokenı ayarla") + '</span>' +
      '<button type="button" tabindex="0" class="ae-btn ae-btn--primary ae-btn--glow" onclick="AeonV2.sendMessage()"' + (composerDisabled ? " disabled" : "") + ' aria-label="Mesaj gönder">' + (ui.messageSending ? "Gönderiliyor…" : "Gönder") + "</button></div>"
    });
    return '<div class="messages-detail ae-slide-up ae-stagger">' +
           AeCard({ variant: "glass", className: "messages-card", children: summary + list }) +
           (selected ? AeCard({ variant: "glass", className: "notification-detail-card", children:
             '<div class="system-card__head"><div><div class="ae-label">Seçili mesaj detayı</div><h2 class="system-card__title">Bildirim yaşam döngüsü</h2><div class="notification-detail-card__sender">' + escapeHtml(selected.from) + " → " + escapeHtml(selected.direction === "in" ? "Sen" : "Observer") + "</div></div>" +
             '<span class="notification-detail-card__status notification-detail-card__status--' + notificationStatusTone(selected.projection) + '">' + escapeHtml(notificationStatusLabel(selected.projection)) + "</span></div>" +
             (selected.title ? '<div class="notification-detail-card__title">' + escapeHtml(selected.title) + "</div>" : "") +
             '<div class="notification-detail-card__text">' + nl2br(escapeHtml(selected.text || "(Metin yok)")) + "</div>" +
             renderNotificationTimeline(selected)
           }) : "") +
           composer +
           AeCard({ variant: "glass", className: "token-card", children:
             '<div class="ae-label">GitHub token</div>' +
             '<input type="password" class="token-input" id="ae-token-input" aria-label="GitHub panel tokenı" autocomplete="off" value="' + escapeHtml(tokenValue) + '" placeholder="github_pat_..." onchange="AeonV2.savePanelToken(this.value)" />' +
             '<div class="token-hint">Token yalnızca bu tarayıcıda kalır; DOM\'da veya test çıktısında asla açık görünmez. Değiştirip dışarıya tıkladığında kaydedilir.</div>' +
             saveBtn
           }) +
           "</div>";
  }

  function renderPollingSettings() {
    var activeInterval = pollingState.intervalMs;
    var intervalButtons = POLLING_OPTIONS.map(function(option) {
      var active = activeInterval === option.value;
      return '<button type="button" tabindex="0" class="settings-choice' + (active ? ' is-active' : '') + '" aria-label="Polling aralığı: ' + escapeHtml(option.label) + '" aria-pressed="' + (active ? 'true' : 'false') + '" onclick="AeonV2.setPollingInterval(' + option.value + ')">' +
             '<span>' + escapeHtml(option.label) + '</span>' + (active ? '<span class="settings-choice__check" aria-hidden="true">' + renderIcon("check", 14) + '</span>' : '') + '</button>';
    }).join("");
    var autoRefresh = pollingState.autoRefresh && pollingState.intervalMs > 0;
    var toggleLabel = autoRefresh ? "Açık" : "Kapalı";
    var syncButton = AeButton({
      labelHtml: renderIcon("refresh", 16) + " Şimdi senkronize et",
      variant: "secondary",
      className: "settings-sync-button",
      onclick: "AeonV2.refresh()",
      ariaLabel: "Şimdi senkronize et",
      disabled: diagnosticState.running
    });
    return AeCard({ variant: "glass", className: "settings-card settings-card--polling", children:
      '<div class="settings-group"><div class="ae-label">Senkronizasyon</div><h2 class="settings-card__title">Polling yapılandırması</h2>' +
      '<div class="settings-field"><div class="settings-field__head"><span>Polling aralığı</span><span class="settings-field__meta">' + escapeHtml(pollingOptionLabel(activeInterval)) + '</span></div>' +
      '<div class="settings-polling-options" role="group" aria-label="Polling aralığı seçimi">' + intervalButtons + '</div></div>' +
      '<div class="settings-toggle-row"><div><strong>Otomatik yenileme</strong><span>Token varken snapshotı periyodik kontrol eder.</span></div>' +
      '<button type="button" tabindex="0" class="settings-toggle" role="switch" aria-checked="' + (autoRefresh ? 'true' : 'false') + '" aria-label="Otomatik yenilemeyi ' + (autoRefresh ? 'kapat' : 'aç') + '" onclick="AeonV2.setAutoRefresh(' + (!autoRefresh) + ')">' +
      '<span class="settings-toggle__track" aria-hidden="true"><span class="settings-toggle__thumb"></span></span><span class="settings-toggle__label">' + toggleLabel + '</span></button></div>' +
      '<div class="settings-sync-actions">' + syncButton + '</div>' +
      '<div class="settings-card__hint">Polling yalnızca panel tokenı varken çalışır; kapalı seçeneği timerı tamamen durdurur.</div></div>'
    });
  }

  function renderDiagnosticButton(action, label, icon) {
    return AeButton({
      labelHtml: renderIcon(icon, 16) + " " + escapeHtml(label),
      variant: "secondary",
      className: "settings-diagnostic-button settings-diagnostic-button--" + action,
      onclick: "AeonV2." + (action === "connection" ? "testConnection" : action === "validation" ? "runDataValidation" : action === "cache" ? "clearPanelCache" : "forceSync") + "()",
      ariaLabel: label,
      disabled: diagnosticState.running
    });
  }

  function renderDiagnosticSummary() {
    if (!diagnosticState.action) {
      return '<div class="settings-diagnostic-result settings-diagnostic-result--idle" role="status">Henüz tanı aracı çalıştırılmadı.</div>';
    }
    var tone = diagnosticState.status === "ok" ? "ok" : diagnosticState.status === "error" ? "drop" : diagnosticState.status === "warn" ? "warn" : "info";
    var statusLabel = diagnosticState.status === "ok" ? "Başarılı" : diagnosticState.status === "error" ? "Hata" : diagnosticState.status === "warn" ? "Beklemede" : diagnosticState.status === "running" ? "Çalışıyor" : "Bilgi";
    return '<div class="settings-diagnostic-result settings-diagnostic-result--' + tone + '" role="status" aria-live="polite">' +
           '<span class="settings-diagnostic-result__dot" aria-hidden="true"></span><div><strong>' + escapeHtml(diagnosticActionLabel(diagnosticState.action)) + ' · ' + statusLabel + '</strong>' +
           '<span>' + escapeHtml(diagnosticState.detail || "—") + '</span>' + (diagnosticState.at ? '<time datetime="' + escapeHtml(diagnosticState.at) + '">' + escapeHtml(formatTs(diagnosticState.at)) + '</time>' : '') + '</div></div>';
  }

  function renderSettings() {
    var densities = [
      { id: "compact", label: "Sıkı" },
      { id: "comfortable", label: "Rahat" },
      { id: "spacious", label: "Geniş" }
    ];
    var densityButtons = densities.map(function(d) {
      var active = ui.density === d.id ? " is-active" : "";
      return '<button type="button" tabindex="0" class="density-btn' + active + '" aria-label="Görünüm yoğunluğu: ' + escapeHtml(d.label) + '" aria-pressed="' + (ui.density === d.id ? "true" : "false") + '" onclick="AeonV2.setDensity(\'' + d.id + '\')">' + escapeHtml(d.label) + "</button>";
    }).join("");

    var themeBtn = ui.theme === "dark"
      ? AeButton({ labelHtml: renderIcon("sun", 16) + " Aydınlık temaya geç", variant: "secondary", onclick: "AeonV2.setTheme(\'light\')", ariaLabel: "Aydınlık temaya geç" })
      : AeButton({ label: "Koyu temaya geç", variant: "secondary", onclick: "AeonV2.setTheme(\'dark\')", ariaLabel: "Koyu temaya geç" });

    var aboutRows = [
      { label: "Sürüm", value: "ÆON Observer v" + PANEL_VERSION },
      { label: "Panel-v2 tarihi", value: PANEL_BUILD_DATE },
      { label: "Commit hash", value: PANEL_SOURCE_COMMIT }
    ].map(function(row) {
      return '<div class="settings-about-row"><span>' + escapeHtml(row.label) + '</span><strong>' + escapeHtml(row.value) + '</strong></div>';
    }).join("");

    return '<div class="settings-detail ae-slide-up ae-stagger">' +
           AeCard({ variant: "glass", className: "settings-card settings-card--density", children: '<div class="settings-group"><div class="ae-label">Görünüm · Yoğunluk</div><h2 class="settings-card__title">Görünüm yoğunluğu</h2><div class="density-select" role="group" aria-label="Görünüm yoğunluğu">' + densityButtons + '</div><div class="settings-card__subsection"><span class="ae-label">Tema</span>' + themeBtn + '</div></div>' }) +
           renderPollingSettings() +
           AeCard({ variant: "glass", className: "settings-card settings-card--diagnostics", children: '<div class="settings-group"><div class="ae-label">Tanı</div><h2 class="settings-card__title">Tanı Araçları</h2><div class="settings-diagnostic-grid" role="group" aria-label="Tanı araçları">' +
             renderDiagnosticButton("connection", "Test Bağlantısı", "arrowRight") + renderDiagnosticButton("validation", "Veri Doğrulama", "check") + renderDiagnosticButton("cache", "Önbellek Temizle", "close") + renderDiagnosticButton("forceSync", "Zorla Senkron", "refresh") +
             '</div>' + renderDiagnosticSummary() + '<div class="settings-card__hint">Tanı araçları yalnızca panelin okuma durumunu ve yerel snapshot önbelleğini kontrol eder.</div></div>' }) +
           AeCard({ variant: "glass", className: "settings-card settings-card--about", children: '<div class="settings-group"><div class="ae-label">Hakkında</div><h2 class="settings-card__title">ÆON Observer</h2><div class="settings-about-list">' + aboutRows + '</div></div>' }) +
           AeCard({ variant: "glass", className: "settings-card settings-card--session", children: '<div class="settings-group"><div class="ae-label">Oturum</div><h2 class="settings-card__title">Güvenli çıkış</h2>' + AeButton({ label: "Oturumu sonlandır", variant: "drop", onclick: "AeonV2.logout()" }) + "</div>" }) +
           "</div>";
  }

  function renderSystem() {
    var subTab = ui.systemSubTab || "status";
    var transitionClass = ui.systemSubTabTransition ? " system-panel--subtab-enter" : "";
    ui.systemSubTabTransition = false;
    var contentBySubTab = {
      status: renderStatusDetail,
      events: renderEventLog,
      audit: renderAuditDetail,
      messages: renderMessages,
      settings: renderSettings
    };
    var renderFn = contentBySubTab[subTab] || renderStatusDetail;
    return '<div class="system-view ae-slide-up ae-stagger">' +
           SubTabs({ tabs: SYSTEM_SUB_TABS, active: subTab, ariaLabel: "Sistem alt sekmeleri", idPrefix: "ae-system-subtab", panelPrefix: "ae-system-panel", onChange: "AeonV2.setSystemSubTab(\'{id}\')" }) +
           '<div id="ae-system-panel-' + escapeHtml(subTab) + '" class="system-panel' + transitionClass + '" role="tabpanel" aria-labelledby="ae-system-subtab-' + escapeHtml(subTab) + '" tabindex="0">' + renderFn() + "</div></div>";
  }

  function getArchiveLibrary() {
    var root = isObject(appData) ? appData : {};
    var library = isObject(root.library) ? root.library : {};
    var books = Array.isArray(library.books) ? library.books : [];
    var byId = {};
    books.forEach(function(b) { if (b && b.id) byId[b.id] = Object.assign({}, b); });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var reading = (days[date].reading || {}).entries;
      if (!Array.isArray(reading)) return;
      reading.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.bookId && byId[e.bookId]) {
          var b = byId[e.bookId];
          if (!b._lastRead || date > b._lastRead) b._lastRead = date;
          b._dailyPages = (b._dailyPages || 0) + (safeNumber(e.pages) || 0);
        } else {
          var key = "daily:" + (e.id || e.title);
          if (!byId[key]) {
            byId[key] = {
              id: key, title: e.title, author: e.author || "",
              status: "reading", source: "daily", _lastRead: date,
              _dailyPages: safeNumber(e.pages) || 0
            };
          } else {
            if (!byId[key]._lastRead || date > byId[key]._lastRead) byId[key]._lastRead = date;
            byId[key]._dailyPages += safeNumber(e.pages) || 0;
          }
        }
      });
    });

    return Object.keys(byId).map(function(k) { return byId[k]; });
  }

  function getArchiveWatch() {
    var root = isObject(appData) ? appData : {};
    var watchlist = isObject(root.watchlist) ? root.watchlist : {};
    var items = Array.isArray(watchlist.items) ? watchlist.items : [];
    var byId = {};
    items.forEach(function(i) { if (i && i.id) byId[i.id] = Object.assign({}, i); });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var watching = (days[date].watching || {}).entries;
      if (!Array.isArray(watching)) return;
      watching.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.itemId && byId[e.itemId]) {
          var it = byId[e.itemId];
          if (!it._lastWatch || date > it._lastWatch) it._lastWatch = date;
          it._dailyMinutes = (it._dailyMinutes || 0) + (safeNumber(e.minutes) || 0);
          it._dailyEps = (it._dailyEps || 0) + (safeNumber(e.episodes) || 0);
        } else {
          var key = "daily:" + (e.id || e.title);
          if (!byId[key]) {
            byId[key] = {
              id: key, title: e.title, kind: e.kind || "film", source: "daily",
              _lastWatch: date, _dailyMinutes: safeNumber(e.minutes) || 0,
              _dailyEps: safeNumber(e.episodes) || 0
            };
          } else {
            if (!byId[key]._lastWatch || date > byId[key]._lastWatch) byId[key]._lastWatch = date;
            byId[key]._dailyMinutes += safeNumber(e.minutes) || 0;
            byId[key]._dailyEps += safeNumber(e.episodes) || 0;
          }
        }
      });
    });

    return Object.keys(byId).map(function(k) { return byId[k]; });
  }

  function getArchiveListen() {
    var root = isObject(appData) ? appData : {};
    var music = isObject(root.music) ? root.music : {};
    var items = Array.isArray(music.items) ? music.items : [];
    var byId = {};
    items.forEach(function(i) { if (i && i.id) byId[i.id] = Object.assign({}, i); });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var listening = (days[date].listening || {}).entries;
      if (!Array.isArray(listening)) return;
      listening.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.itemId && byId[e.itemId]) {
          var it = byId[e.itemId];
          if (!it._lastListen || date > it._lastListen) it._lastListen = date;
          it._dailyMinutes = (it._dailyMinutes || 0) + (safeNumber(e.minutes) || 0);
        } else {
          var key = "daily:" + (e.id || e.title);
          if (!byId[key]) {
            byId[key] = {
              id: key, title: e.title, artist: e.artist || "", kind: e.kind || "sarki",
              source: "daily", _lastListen: date, _dailyMinutes: safeNumber(e.minutes) || 0
            };
          } else {
            if (!byId[key]._lastListen || date > byId[key]._lastListen) byId[key]._lastListen = date;
            byId[key]._dailyMinutes += safeNumber(e.minutes) || 0;
          }
        }
      });
    });

    return Object.keys(byId).map(function(k) { return byId[k]; });
  }

  function getArchiveQuotes() {
    var root = isObject(appData) ? appData : {};
    var out = [];

    function pushFrom(items, source, titleField) {
      if (!Array.isArray(items)) return;
      items.forEach(function(it) {
        if (!it) return;
        var qs = Array.isArray(it.quotes) ? it.quotes : [];
        qs.forEach(function(q) {
          if (!q || !q.text) return;
          out.push({
            id: q.id || (source + "-" + Math.random().toString(36).slice(2)),
            text: q.text,
            source: source,
            title: it[titleField] || "",
            ts: q.ts || it.createdAt || ""
          });
        });
      });
    }

    var library = isObject(root.library) ? root.library : {};
    pushFrom(library.books, "kitap", "title");

    var watchlist = isObject(root.watchlist) ? root.watchlist : {};
    pushFrom(watchlist.items, "izleme", "title");

    var music = isObject(root.music) ? root.music : {};
    pushFrom(music.items, "müzik", "title");

    return out.sort(function(a, b) { return String(b.ts).localeCompare(String(a.ts)); });
  }

  function paginate(items, page, pageSize) {
    page = Math.max(1, safeNumber(page) || 1);
    pageSize = Math.max(1, safeNumber(pageSize) || 20);
    var total = items.length;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(page, totalPages);
    var start = (page - 1) * pageSize;
    var pageItems = items.slice(start, start + pageSize);
    return { items: pageItems, page: page, totalPages: totalPages, total: total, hasPrev: page > 1, hasNext: page < totalPages };
  }

  var ARCHIVE_PAGE_SIZE = 20;

  function getArchiveItems(subTab) {
    var getters = {
      library: getArchiveLibrary,
      watch: getArchiveWatch,
      listen: getArchiveListen,
      quotes: getArchiveQuotes
    };
    return typeof getters[subTab] === "function" ? getters[subTab]() : [];
  }

  function archiveItemDate(item, subTab) {
    item = item || {};
    var candidates = subTab === "library"
      ? [item._lastRead, item.finishedAt, item.startedAt, item.createdAt]
      : subTab === "watch"
        ? [item._lastWatch, item.finishedAt, item.startedAt, item.createdAt]
        : subTab === "listen"
          ? [item._lastListen, item.createdAt]
          : [item.ts, item.createdAt];
    for (var i = 0; i < candidates.length; i++) {
      var value = String(candidates[i] || "");
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    }
    return "";
  }

  function archiveItemKind(item, subTab) {
    item = item || {};
    if (subTab === "library") return "kitap";
    if (subTab === "watch") return item.kind || "film";
    if (subTab === "listen") return item.kind || "sarki";
    return item.source || "alıntı";
  }

  function archiveKindLabel(kind, subTab) {
    var labels = {
      kitap: "Kitap",
      dizi: "Dizi",
      film: "Film",
      sarki: "Şarkı",
      album: "Albüm",
      podcast: "Podcast",
      kitap_alinti: "Kitap",
      izleme: "İzleme",
      müzik: "Müzik",
      alıntı: "Alıntı"
    };
    return labels[kind] || (subTab === "quotes" ? "Alıntı" : safeText(kind, 24) || "Kayıt");
  }

  function archiveStatusLabel(status, subTab) {
    var labels = {
      reading: "Okunuyor",
      watching: "İzleniyor",
      finished: "Bitti",
      dropped: "Bırakıldı"
    };
    return labels[status] || (subTab === "quotes" ? "Alıntı" : "Kayıtlı");
  }

  function getArchiveStatusOptions(subTab) {
    var options = [{ value: "all", label: "Tüm durumlar" }];
    if (subTab === "library") options.push({ value: "reading", label: "Okunuyor" }, { value: "finished", label: "Bitti" }, { value: "dropped", label: "Bırakıldı" });
    if (subTab === "watch") options.push({ value: "watching", label: "İzleniyor" }, { value: "finished", label: "Bitti" }, { value: "dropped", label: "Bırakıldı" });
    return options;
  }

  function getArchiveKindOptions(subTab) {
    var options = [{ value: "all", label: "Tüm türler" }];
    if (subTab === "library") options.push({ value: "kitap", label: "Kitap" });
    if (subTab === "watch") options.push({ value: "dizi", label: "Dizi" }, { value: "film", label: "Film" });
    if (subTab === "listen") options.push({ value: "sarki", label: "Şarkı" }, { value: "album", label: "Albüm" }, { value: "podcast", label: "Podcast" });
    if (subTab === "quotes") options.push({ value: "kitap", label: "Kitap" }, { value: "izleme", label: "İzleme" }, { value: "müzik", label: "Müzik" });
    return options;
  }

  function archiveFiltersActive() {
    return !!(String(ui.archiveSearch || "").trim() ||
      ui.archiveStatus !== "all" || ui.archiveKind !== "all" ||
      ui.archiveFrom || ui.archiveTo);
  }

  function filterArchiveItems(items, subTab) {
    var query = String(ui.archiveSearch || "").trim().toLocaleLowerCase("tr-TR");
    var status = ui.archiveStatus || "all";
    var kind = ui.archiveKind || "all";
    var from = /^\d{4}-\d{2}-\d{2}$/.test(ui.archiveFrom || "") ? ui.archiveFrom : "";
    var to = /^\d{4}-\d{2}-\d{2}$/.test(ui.archiveTo || "") ? ui.archiveTo : "";
    return (Array.isArray(items) ? items : []).filter(function(item) {
      item = item || {};
      var itemKind = archiveItemKind(item, subTab);
      var itemDate = archiveItemDate(item, subTab);
      if (status !== "all" && item.status !== status) return false;
      if (kind !== "all" && itemKind !== kind) return false;
      if (from && (!itemDate || itemDate < from)) return false;
      if (to && (!itemDate || itemDate > to)) return false;
      if (!query) return true;
      var haystack = [
        item.title, item.author, item.artist, itemKind,
        archiveKindLabel(itemKind, subTab), item.status,
        archiveStatusLabel(item.status, subTab), item.source,
        item.text, itemDate
      ].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
      return haystack.indexOf(query) !== -1;
    });
  }

  function getFilteredArchiveItems(subTab) {
    return filterArchiveItems(getArchiveItems(subTab), subTab);
  }

  function resetArchivePageCache() {
    archivePageCache.key = "";
    archivePageCache.dataRef = null;
    archivePageCache.subTab = "";
    archivePageCache.page = 1;
    archivePageCache.items = [];
    archivePageCache.total = 0;
    archivePageCache.sourceTotal = 0;
    archivePageCache.totalPages = 1;
    archivePageCache.hasPrev = false;
    archivePageCache.hasNext = false;
  }

  function archiveCacheKey(subTab) {
    return [
      subTab,
      ui.archiveSearch || "",
      ui.archiveStatus || "all",
      ui.archiveKind || "all",
      ui.archiveFrom || "",
      ui.archiveTo || ""
    ].join("\u001f");
  }

  // Arşiv verisi snapshot içinde yerel olsa da DOM'a yalnızca aktif sayfanın
  // satırlarını materyalize eder. Filtre/snapshot değişince anahtar kırılır;
  // sayfa değişiminde yalnızca yeni dilim yeniden üretilir.
  function getArchivePageState(subTab, page) {
    var key = archiveCacheKey(subTab);
    var requestedPage = Math.max(1, safeNumber(page) || 1);
    if (archivePageCache.key === key && archivePageCache.dataRef === appData && archivePageCache.page === requestedPage) {
      return archivePageCache;
    }
    var sourceItems = getArchiveItems(subTab);
    var filteredItems = filterArchiveItems(sourceItems, subTab);
    var state = paginate(filteredItems, requestedPage, ARCHIVE_PAGE_SIZE);
    archivePageCache = {
      key: key,
      dataRef: appData,
      subTab: subTab,
      page: state.page,
      items: state.items,
      total: state.total,
      sourceTotal: sourceItems.length,
      totalPages: state.totalPages,
      hasPrev: state.hasPrev,
      hasNext: state.hasNext
    };
    return archivePageCache;
  }

  function archiveListAttrs(state) {
    return ' data-archive-page="' + state.page + '" data-archive-total="' + state.total + '" data-archive-page-size="' + ARCHIVE_PAGE_SIZE + '"';
  }

  function renderArchiveEmpty(icon, defaultTitle, defaultMessage) {
    return AeEmpty({
      icon: icon,
      title: archiveFiltersActive() ? "Sonuç bulunamadı" : defaultTitle,
      message: archiveFiltersActive() ? "Seçili filtrelerle eşleşen arşiv kaydı yok." : defaultMessage
    });
  }

  function archiveListClass() {
    return ui.archiveView === "grid" ? " archive-list--grid" : "";
  }

  function renderArchiveSelect(id, label, value, options, disabled) {
    var optionMarkup = options.map(function(option) {
      return '<option value="' + escapeHtml(option.value) + '"' +
             (option.value === value ? " selected" : "") + ">" +
             escapeHtml(option.label) + "</option>";
    }).join("");
    return '<label class="archive-filter">' +
           '<span class="ae-label">' + escapeHtml(label) + "</span>" +
           '<select id="' + escapeHtml(id) + '" aria-label="' + escapeHtml(label) + '"' +
           (disabled ? " disabled" : "") +
           ' onchange="AeonV2.setArchiveFilter(\'' + escapeHtml(id.replace("ae-archive-filter-", "")) + '\',this.value)">' +
           optionMarkup + "</select></label>";
  }

  function renderArchiveControls(subTab, total, filtered) {
    var statusOptions = getArchiveStatusOptions(subTab);
    var kindOptions = getArchiveKindOptions(subTab);
    var statusValue = statusOptions.some(function(option) { return option.value === ui.archiveStatus; }) ? ui.archiveStatus : "all";
    var kindValue = kindOptions.some(function(option) { return option.value === ui.archiveKind; }) ? ui.archiveKind : "all";
    var active = archiveFiltersActive();
    var viewList = AeButton({ labelHtml: renderIcon("list", 16) + " Liste", variant: "pill", className: ui.archiveView === "list" ? "is-active" : "", onclick: "AeonV2.setArchiveView('list')", ariaLabel: "Liste görünümü" });
    var viewGrid = AeButton({ labelHtml: renderIcon("grid", 16) + " Izgara", variant: "pill", className: ui.archiveView === "grid" ? "is-active" : "", onclick: "AeonV2.setArchiveView('grid')", ariaLabel: "Izgara görünümü" });
    return '<section class="archive-controls" role="search" aria-label="Arşivlerde ara ve filtrele">' +
           '<label class="archive-search"><span class="ae-label">Arşivlerde ara</span>' +
           '<input type="search" value="' + escapeHtml(ui.archiveSearch || "") + '" placeholder="Kitap, film, müzik veya alıntı ara" aria-label="Arşivlerde ara" onchange="AeonV2.setArchiveSearch(this.value)" /></label>' +
           '<div class="archive-filter-grid">' +
           renderArchiveSelect("ae-archive-filter-status", "Durum", statusValue, statusOptions, statusOptions.length === 1) +
           renderArchiveSelect("ae-archive-filter-kind", "Tür", kindValue, kindOptions, kindOptions.length === 1) +
           '<label class="archive-filter"><span class="ae-label">Başlangıç</span><input type="date" value="' + escapeHtml(ui.archiveFrom || "") + '" aria-label="Başlangıç tarihi" onchange="AeonV2.setArchiveFilter(\'from\',this.value)" /></label>' +
           '<label class="archive-filter"><span class="ae-label">Bitiş</span><input type="date" value="' + escapeHtml(ui.archiveTo || "") + '" aria-label="Bitiş tarihi" onchange="AeonV2.setArchiveFilter(\'to\',this.value)" /></label>' +
           '</div>' +
           '<div class="archive-controls__footer">' +
           '<div class="archive-controls__summary"><span class="ae-chip">' + filtered + " / " + total + " kayıt</span>" +
           (active ? '<span class="archive-controls__active">Filtreler aktif</span>' : "") + "</div>" +
           '<div class="archive-controls__actions">' +
           '<div class="archive-view-toggle" role="group" aria-label="Arşiv görünümü">' + viewList + viewGrid + "</div>" +
           (active ? AeButton({ label: "Filtreleri temizle", variant: "text", onclick: "AeonV2.resetArchiveFilters()" }) : "") +
           "</div></div></section>";
  }

  function renderPagination(state, onClickPrefix) {
    if (state.totalPages <= 1) return "";
    var buttons = "";
    if (state.hasPrev) {
      buttons += AeButton({
        labelHtml: renderIcon("arrowLeft", 16),
        variant: "mini",
        onclick: onClickPrefix + "(" + (state.page - 1) + ")",
        ariaLabel: "Önceki sayfa"
      });
    }
    buttons += '<span class="pagination__info">' + state.page + " / " + state.totalPages + "</span>";
    if (state.hasNext) {
      buttons += AeButton({
        labelHtml: renderIcon("arrowRight", 16),
        variant: "mini",
        onclick: onClickPrefix + "(" + (state.page + 1) + ")",
        ariaLabel: "Sonraki sayfa"
      });
    }
    return '<div class="pagination">' + buttons + "</div>";
  }

  function setArchivePage(page) {
    ui.archivePage = Math.max(1, safeNumber(page) || 1);
    render();
  }

  function setArchiveSearch(value) {
    ui.archiveSearch = safeText(value || "", 120);
    ui.archivePage = 1;
    render();
  }

  function setArchiveFilter(key, value) {
    var allowed = ["status", "kind", "from", "to"];
    if (allowed.indexOf(key) === -1) return;
    var next = safeText(value || "", 32);
    var field = "archive" + key.charAt(0).toUpperCase() + key.slice(1);
    if (key === "from" || key === "to") {
      ui[field] = /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : "";
    } else {
      ui[field] = next || "all";
    }
    ui.archivePage = 1;
    render();
  }

  function setArchiveView(view) {
    if (["list", "grid"].indexOf(view) === -1) return;
    ui.archiveView = view;
    render();
  }

  function resetArchiveFilters() {
    ui.archiveSearch = "";
    ui.archiveStatus = "all";
    ui.archiveKind = "all";
    ui.archiveFrom = "";
    ui.archiveTo = "";
    ui.archivePage = 1;
    render();
  }

  function ArchiveRow(opts) {
    opts = opts || {};
    return '<div class="archive-row">' +
           '<div class="archive-row__main">' +
           (opts.icon ? '<span class="archive-row__icon">' + renderIcon(opts.icon, 18) + "</span>" : "") +
           '<div class="archive-row__body">' +
           '<div class="archive-row__title">' + escapeHtml(safeText(opts.title, 80)) + "</div>" +
           (opts.meta ? '<div class="archive-row__meta">' + escapeHtml(safeText(opts.meta, 120)) + "</div>" : "") +
           "</div></div>" +
           (opts.badge ? '<span class="ae-chip">' + escapeHtml(opts.badge) + "</span>" : "") +
           "</div>";
  }

  function renderArchiveLibrary(page) {
    var state = getArchivePageState("library", page || ui.archivePage || 1);
    if (!state.items.length) {
      return renderArchiveEmpty("book", "Kütüphane boş", "Henüz kitap veya okuma kaydı yok.");
    }
    var rows = state.items.map(function(b) {
      var progress = "";
      if (safeNumber(b.totalPages) > 0 && safeNumber(b.currentPage) >= 0) {
        progress = b.currentPage + "/" + b.totalPages + " sayfa";
      } else if (b._dailyPages) {
        progress = b._dailyPages + " sayfa günlük";
      }
      var archiveDate = archiveItemDate(b, "library");
      var meta = [b.author, archiveDate ? "Son: " + formatDateLabel(archiveDate) : "", progress].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: "book",
        title: b.title,
        meta: meta,
        badge: { reading: "Okunuyor", finished: "Bitti", dropped: "Bırakıldı" }[b.status] || "Kayıtlı"
      });
    }).join("");
    return '<div class="archive-list ae-slide-up' + archiveListClass() + '"' + archiveListAttrs(state) + '>' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveWatch(page) {
    var state = getArchivePageState("watch", page || ui.archivePage || 1);
    if (!state.items.length) {
      return renderArchiveEmpty("watch", "İzleme listesi boş", "Henüz film/dizi veya izleme kaydı yok.");
    }
    var rows = state.items.map(function(it) {
      var progress = "";
      if (safeNumber(it.totalEp) > 0) {
        progress = (it.watchedEp || 0) + "/" + it.totalEp + " bölüm";
      } else if (it._dailyEps) {
        progress = it._dailyEps + " bölüm günlük";
      }
      if (it._dailyMinutes) progress += (progress ? " · " : "") + it._dailyMinutes + " dk";
      var archiveDate = archiveItemDate(it, "watch");
      var meta = [it.kind === "dizi" ? "Dizi" : "Film", archiveDate ? "Son: " + formatDateLabel(archiveDate) : "", progress].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: it.kind === "dizi" ? "watch" : "book",
        title: it.title,
        meta: meta,
        badge: { watching: "İzleniyor", finished: "Bitti", dropped: "Bırakıldı" }[it.status] || "Kayıtlı"
      });
    }).join("");
    return '<div class="archive-list ae-slide-up' + archiveListClass() + '"' + archiveListAttrs(state) + '>' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveListen(page) {
    var state = getArchivePageState("listen", page || ui.archivePage || 1);
    if (!state.items.length) {
      return renderArchiveEmpty("listen", "Dinleme listesi boş", "Henüz müzik/podcast veya dinleme kaydı yok.");
    }
    var rows = state.items.map(function(it) {
      var kindLabel = { sarki: "Şarkı", album: "Albüm", podcast: "Podcast" }[it.kind] || it.kind || "Müzik";
      var archiveDate = archiveItemDate(it, "listen");
      var meta = [it.artist, archiveDate ? "Son: " + formatDateLabel(archiveDate) : "", it._dailyMinutes ? it._dailyMinutes + " dk" : ""].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: "listen",
        title: it.title,
        meta: meta,
        badge: kindLabel
      });
    }).join("");
    return '<div class="archive-list ae-slide-up' + archiveListClass() + '"' + archiveListAttrs(state) + '>' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveQuotes(page) {
    var state = getArchivePageState("quotes", page || ui.archivePage || 1);
    if (!state.items.length) {
      return renderArchiveEmpty("note", "Alıntı yok", "Henüz kitap, film/dizi veya müzik alıntısı yok.");
    }
    var rows = state.items.map(function(q) {
      return '<div class="archive-row archive-row--quote">' +
             '<div class="archive-row__body">' +
             '<div class="archive-row__title">“' + escapeHtml(safeText(q.text, 160)) + '”</div>' +
             '<div class="archive-row__meta">' + escapeHtml(safeText(q.source + (q.title ? " · " + q.title : "") + (q.ts ? " · " + formatDateLabel(String(q.ts).slice(0, 10)) : ""), 100)) + "</div>" +
             "</div></div>";
    }).join("");
    return '<div class="archive-list ae-slide-up' + archiveListClass() + '"' + archiveListAttrs(state) + '>' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchives() {
    var subTab = ui.subTab || "library";
    var tabs = [
      { id: "library", label: "Kütüphane" },
      { id: "watch", label: "İzleme" },
      { id: "listen", label: "Dinleme" },
      { id: "quotes", label: "Alıntılar" }
    ];
    var contentBySubTab = {
      library: renderArchiveLibrary,
      watch: renderArchiveWatch,
      listen: renderArchiveListen,
      quotes: renderArchiveQuotes
    };
    var renderFn = contentBySubTab[subTab] || renderArchiveLibrary;
    var pageState = getArchivePageState(subTab, ui.archivePage);
    var total = pageState.sourceTotal;
    var filtered = pageState.total;
    return '<div class="archives-view ae-slide-up ae-stagger">' +
           SubTabs({ tabs: tabs, active: subTab, ariaLabel: "Arşiv alt sekmeleri", idPrefix: "ae-archive-subtab", panelPrefix: "ae-archive-panel", onChange: "AeonV2.setArchiveSubTab(\'{id}\')" }) +
           renderArchiveControls(subTab, total, filtered) +
           '<div id="ae-archive-panel-' + escapeHtml(subTab) + '" class="archive-panel" role="tabpanel" aria-labelledby="ae-archive-subtab-' + escapeHtml(subTab) + '" tabindex="0">' + renderFn() + "</div>" +
           "</div>";
  }

  function renderActiveTab(withTransition) {
    var panels = {
      today: renderToday,
      trends: renderTrends,
      day: renderDay,
      archives: renderArchives,
      system: renderSystem
    };
    var fn = panels[ui.tab] || renderToday;
    var transitionClass = withTransition ? " ae-page-transition" : "";
    return '<div class="ae-panel ae-slide-up' + transitionClass + '" id="ae-panel-' + ui.tab + '" role="tabpanel" aria-labelledby="ae-tab-' + ui.tab + '" tabindex="0">' +
           fn() +
           "</div>";
  }

  // ── Main render ────────────────────────────────────────────────────────
  function render(options) {
    var app = root.document && root.document.getElementById("app");
    if (!app) return;
    options = options || {};
    rememberFocus();
    var projection = projectData(null);
    // İlk snapshot hiç yoksa skeleton göster; arka plan polling'i mevcut
    // içeriği kaldırmamalı. Ağ gecikmesi kullanıcıyı boş/skeleton ekranda
    // bırakmadan status + aria-busy üzerinden görünür kalır.
    var activeContent = isFetching && !isObject(appData)
      ? renderLoadingState()
      : renderActiveTab(Boolean(options.transition));
    app.innerHTML =
      renderPullRefreshIndicator() +
      renderTopbar() +
      renderTabs() +
      '<main id="ae-main-content" class="ae-app__body" tabindex="-1">' + activeContent + "</main>" +
      renderToastHost() +
      '<div class="ae-projection-meta" id="ae-projection-meta" data-day-count="' + projection.dayCount + '"></div>';

    if (typeof app.setAttribute === "function") app.setAttribute("aria-busy", isFetching ? "true" : "false");
    restoreFocusAfterRender();

    initSwipeGestures(app);
    bindPerformanceScrollTarget(app);
    runCountUps();
    scheduleMapInitialization();
  }

  function getMapContainers() {
    var doc = root.document;
    if (!doc || typeof doc.querySelectorAll !== "function") return [];
    return Array.prototype.slice.call(doc.querySelectorAll(".loc-map"));
  }

  function ensureLeafletAssets() {
    if (typeof root.L !== "undefined") return Promise.resolve(root.L);
    if (mapState.leafletPromise) return mapState.leafletPromise;
    var doc = root.document;
    if (!doc || typeof doc.createElement !== "function") return Promise.resolve(null);
    var parent = doc.head || doc.documentElement;
    if (!parent || typeof parent.appendChild !== "function") return Promise.resolve(null);

    mapState.leafletStatus = "loading";
    performanceState.mapAssetLoadCount++;
    var css = doc.querySelector && doc.querySelector("link[data-ae-leaflet-css]");
    if (!css) {
      css = doc.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.setAttribute("data-ae-leaflet-css", "true");
      css.setAttribute("crossorigin", "");
      parent.appendChild(css);
    }

    mapState.leafletPromise = new Promise(function(resolve, reject) {
      var script = doc.createElement("script");
      script.async = true;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.setAttribute("data-ae-leaflet-script", "true");
      script.setAttribute("crossorigin", "");
      script.onload = function() {
        mapState.leafletStatus = typeof root.L === "undefined" ? "error" : "ready";
        if (typeof root.L === "undefined") reject(new Error("Leaflet yüklenemedi."));
        else resolve(root.L);
      };
      script.onerror = function() {
        mapState.leafletStatus = "error";
        reject(new Error("Leaflet ağına erişilemedi."));
      };
      parent.appendChild(script);
    });
    return mapState.leafletPromise;
  }

  function initMaps(containers) {
    if (typeof root.L === "undefined") return;
    containers = containers || getMapContainers();
    containers.forEach(initMapContainer);
  }

  function initMapContainer(el) {
    if (typeof root.L === "undefined" || !el || el._leaflet_map) return;
    var raw = el.getAttribute("data-points");
    if (!raw) return;
    var points;
    try { points = JSON.parse(raw); } catch(e) { return; }
    if (!Array.isArray(points) || !points.length) return;

      // Ortalama koordinat
      var latSum = 0, lngSum = 0, count = 0;
      points.forEach(function(p) {
        if (typeof p.lat === "number" && typeof p.lng === "number") {
          latSum += p.lat; lngSum += p.lng; count++;
        }
      });
      if (!count) return;
      var centerLat = latSum / count, centerLng = lngSum / count;

      var map = root.L.map(el, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
      });
      root.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(map);

      // Marker'lar
      points.forEach(function(p, i) {
        if (typeof p.lat !== "number" || typeof p.lng !== "number") return;
        var color = i === points.length - 1 ? "#C9A86C" : "#6E6862";
        var ts = p.ts ? new Date(p.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
        var acc = p.acc ? " ±" + p.acc + "m" : "";
        var mapsUrl = locationMapsUrl(p);
        var mapsPopup = mapsUrl ? '<br><a class="loc-popup-map-link" href="' + escapeHtml(mapsUrl) + '" target="_blank" rel="noopener noreferrer">' + renderIcon("arrowRight", 13) + ' Google Maps’te aç</a>' : "";
        root.L.circleMarker([p.lat, p.lng], {
          radius: i === points.length - 1 ? 8 : 5,
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2
        }).addTo(map).bindPopup("<strong>" + escapeHtml(ts) + "</strong><br>" +
          p.lat.toFixed(4) + ", " + p.lng.toFixed(4) + acc + mapsPopup);
      });

      // Fit bounds
      if (points.length > 1) {
        var bounds = [];
        points.forEach(function(p) {
          if (typeof p.lat === "number" && typeof p.lng === "number")
            bounds.push([p.lat, p.lng]);
        });
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
      }

      el._leaflet_map = map;
      // Tıklayınca zoom aç
      el.addEventListener("click", function() {
        map.scrollWheelZoom.enable();
        setTimeout(function() { map.scrollWheelZoom.disable(); }, 5000);
      });
      performanceState.mapInitCount++;
  }

  function initializeMapWhenReady(el) {
    return ensureLeafletAssets().then(function() {
      initMapContainer(el);
    }).catch(function() {
      return false;
    });
  }

  function scheduleMapInitialization() {
    var containers = getMapContainers();
    if (!containers.length) {
      if (mapState.observer && typeof mapState.observer.disconnect === "function") mapState.observer.disconnect();
      mapState.observer = null;
      return false;
    }
    performanceState.mapScheduleCount++;
    if (mapState.observer && typeof mapState.observer.disconnect === "function") mapState.observer.disconnect();
    mapState.observer = null;

    if (typeof root.IntersectionObserver === "function") {
      var observer = new root.IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry || (!entry.isIntersecting && !(entry.intersectionRatio > 0))) return;
          if (typeof observer.unobserve === "function") observer.unobserve(entry.target);
          initializeMapWhenReady(entry.target);
        });
      }, { rootMargin: "160px 0px" });
      mapState.observer = observer;
      containers.forEach(function(el) { observer.observe(el); });
      return true;
    }

    var loadVisibleMaps = function() {
      ensureLeafletAssets().then(function() { initMaps(containers); }).catch(function() {});
    };
    if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(loadVisibleMaps);
    else if (typeof root.setTimeout === "function") root.setTimeout(loadVisibleMaps, 0);
    else loadVisibleMaps();
    return true;
  }

  function setTab(id) {
    if (!id || !TABS.some(function(t) { return t.id === id; })) return;
    if (ui.tab === id) return;
    ui.tab = id;
    requestFocus("ae-tab-" + id);
    var tab = TABS.filter(function(item) { return item.id === id; })[0];
    announce("Sekme açıldı: " + (tab ? tab.label : id));
    var doc = root.document;
    if (doc && typeof doc.startViewTransition === "function") {
      try {
        doc.startViewTransition(function() { render({ transition: true }); });
        return;
      } catch (e) {}
    }
    render({ transition: true });
  }

  function responseHeader(r, name) {
    try {
      if (r && typeof r.headers === "object") {
        var h = r.headers.get ? r.headers.get(name) : r.headers[name];
        return h || "";
      }
    } catch (e) {}
    return "";
  }

  function fetchLatest(repo, branch) {
    var p = String(repo || REPO).split("/");
    if (p.length !== 2 || !p[0] || !p[1]) throw new Error("Repo bicimi gecersiz.");
    var api = "https://api.github.com/repos/" + encodeURIComponent(p[0]) + "/" + encodeURIComponent(p[1]) + "/contents/data/latest.json?ref=" + encodeURIComponent(branch || BRANCH);
    var H = {
      "Accept": "application/vnd.github.raw",
      "Authorization": "Bearer " + ui.panelToken,
      "X-GitHub-Api-Version": "2022-11-28"
    };
    if (syncStatus.etag) H["If-None-Match"] = syncStatus.etag;
    var requestStartedAt = Date.now();
    var telemetryRecorded = false;
    function finishFetch(success, meta) {
      if (telemetryRecorded) return;
      telemetryRecorded = true;
      recordFetchTelemetry(Date.now() - requestStartedAt, success, meta);
    }
    var requestController = null;
    try {
      if (typeof root.AbortController === "function") requestController = new root.AbortController();
    } catch (e) {
      requestController = null;
    }
    var requestOptions = { headers: H, cache: "no-store" };
    if (requestController) requestOptions.signal = requestController.signal;
    var request;
    try {
      request = root.fetch(api, requestOptions);
    } catch (e) {
      finishFetch(false, { code: "network" });
      return Promise.reject(e);
    }
    var timedOut = false;
    var requestSettled = false;
    var timeoutError = null;
    var timeoutId = null;
    function clearRequestTimeout() {
      if (timeoutId !== null && typeof root.clearTimeout === "function") root.clearTimeout(timeoutId);
      timeoutId = null;
    }
    var timeoutPromise = null;
    if (typeof root.setTimeout === "function") {
      timeoutPromise = new Promise(function(_resolve, reject) {
        timeoutId = root.setTimeout(function() {
          if (timedOut || requestSettled) return;
          timedOut = true;
          if (requestController && typeof requestController.abort === "function") {
            try { requestController.abort(); } catch (e) {}
          }
          timeoutError = new Error("GitHub isteği zaman aşımına uğradı.");
          timeoutError.code = "timeout";
          finishFetch(false, { code: "timeout" });
          reject(timeoutError);
        }, FETCH_TIMEOUT_MS);
      });
    }
    var requestFlow = Promise.resolve(request).then(function(r) {
      if (timedOut) throw timeoutError;
      var etag = responseHeader(r, "ETag");
      var rateRemainingHeader = responseHeader(r, "X-RateLimit-Remaining");
      var rateLimitHeader = responseHeader(r, "X-RateLimit-Limit");
      var rateResetHeader = responseHeader(r, "X-RateLimit-Reset");
      var rateRemaining = rateRemainingHeader === "" ? null : safeNumber(rateRemainingHeader);
      var rateLimit = rateLimitHeader === "" ? null : safeNumber(rateLimitHeader);
      var rateReset = rateResetHeader === "" ? null : safeNumber(rateResetHeader);
      if (rateRemaining !== null) {
        syncStatus.apiLimitRemaining = rateRemaining;
        syncStatus.apiRateLimitRemaining = rateRemaining;
      }
      if (rateLimit !== null) syncStatus.apiLimitTotal = rateLimit;
      if (rateReset !== null) {
        syncStatus.apiLimitResetAt = new Date(rateReset * 1000).toISOString();
        syncStatus.apiRateLimitReset = syncStatus.apiLimitResetAt;
      }
      if (r.status === 401 || r.status === 403) {
        finishFetch(false, { code: r.status === 403 && rateRemaining === 0 ? "rate_limited" : "unauthorized", status: r.status });
        throw new Error("Token gecersiz veya yetkisiz.");
      }
      if (r.status === 404) {
        finishFetch(false, { code: "not_found", status: r.status });
        var e = new Error("data/latest.json bulunamadi.");
        e.notFound = true;
        throw e;
      }
      if (r.status === 304) {
        finishFetch(true, { status: r.status });
        syncStatus.status = "accepted";
        syncStatus.lastSyncedAt = new Date().toISOString();
        syncStatus.notModifiedCount = (syncStatus.notModifiedCount || 0) + 1;
        return { notModified: true, meta: { etag: etag, completedAt: syncStatus.lastSyncedAt } };
      }
      if (!r.ok) {
        finishFetch(false, { code: r.status === 429 ? "rate_limited" : "http_" + r.status, status: r.status });
        throw new Error("Sunucu hatasi: " + r.status);
      }
      return r.json().then(function(data) {
        if (timedOut) throw timeoutError;
        finishFetch(true, { status: r.status });
        syncStatus.etag = etag;
        syncStatus.snapshotRevision = (data && data.syncReceipt && data.syncReceipt.snapshotRevision) || null;
        syncStatus.sourceUpdatedAt = (data && data.syncReceipt && data.syncReceipt.sourceUpdatedAt) || null;
        syncStatus.status = "accepted";
        syncStatus.lastErrorCode = null;
        syncStatus.lastSyncedAt = new Date().toISOString();
        appData = unwrapPanelData(data);
        resetArchivePageCache();
        render();
        return { notModified: false, data: data, meta: { etag: etag, completedAt: syncStatus.lastSyncedAt } };
      }, function(error) {
        if (timedOut) throw timeoutError;
        finishFetch(false, { code: "parse_error" });
        throw error;
      });
    }, function(error) {
      if (timedOut) throw timeoutError;
      finishFetch(false, { code: "network" });
      throw error;
    });
    if (!timeoutPromise) return requestFlow;
    return Promise.race([requestFlow, timeoutPromise]).then(function(value) {
      requestSettled = true;
      clearRequestTimeout();
      return value;
    }, function(error) {
      requestSettled = true;
      clearRequestTimeout();
      throw error;
    });
  }

  function load() {
    if (isFetching) return Promise.resolve(null);
    ui.panelToken = normalizeToken(ui.panelToken || getLocalToken());
    if (!ui.panelToken) {
      stopPolling();
      syncStatus.status = "idle";
      syncStatus.lastErrorCode = "no_token";
      render();
      return Promise.resolve(null);
    }
    startPolling();
    isFetching = true;
    syncStatus.status = "loading";
    syncStatus.lastErrorCode = null;
    render();
    return fetchLatest(REPO, BRANCH)
      .catch(function(e) {
        if (e && e.notFound && BRANCH !== "main") {
          BRANCH = "main";
          return fetchLatest(REPO, BRANCH);
        }
        throw e;
      })
      .then(function() {
        isFetching = false;
        // 304 yanıtında fetchLatest bilinçli olarak render yapmaz; final render
        // skeleton'ı kapatıp kabul edilmiş snapshotı ve aria-busy durumunu
        // görünür DOM'a geri taşır.
        render();
        return appData;
      })
      .catch(function(e) {
        isFetching = false;
        var m = String(e && e.message || e);
        syncStatus.status = "error";
        if (/gecersiz|yetkisiz|unauthorized|forbidden/i.test(m)) syncStatus.status = "unauthorized";
        else if (/bulunamadi|not_found|404/i.test(m)) syncStatus.status = "not_found";
        else if (/limit|rate/i.test(m)) syncStatus.status = "rate_limited";
        syncStatus.lastErrorCode = m;
        render();
        return null;
      });
  }

  function refresh() {
    if (pullRefresh.refreshing) return Promise.resolve(null);
    pullRefresh.refreshing = true;
    updatePullRefreshIndicator("refreshing", PULL_REFRESH_THRESHOLD);
    var result;
    try {
      result = load();
    } catch (e) {
      pullRefresh.refreshing = false;
      updatePullRefreshIndicator("idle", 0);
      throw e;
    }
    return Promise.resolve(result).then(function(value) {
      pullRefresh.refreshing = false;
      updatePullRefreshIndicator("idle", 0);
      return value;
    }, function(error) {
      pullRefresh.refreshing = false;
      updatePullRefreshIndicator("idle", 0);
      throw error;
    });
  }

  function logout() {
    stopPolling();
    removeLocalToken();
    ui.panelToken = "";
    syncStatus.status = "idle";
    syncStatus.lastErrorCode = null;
    syncStatus.etag = null;
    syncStatus.snapshotRevision = null;
    syncStatus.sourceUpdatedAt = null;
    syncStatus.lastSyncedAt = null;
    syncStatus.apiLimitRemaining = null;
    syncStatus.apiLimitTotal = null;
    syncStatus.apiLimitResetAt = null;
    syncStatus.apiRateLimitRemaining = null;
    syncStatus.apiRateLimitReset = null;
    syncStatus.p50LatencyMs = null;
    syncStatus.p95LatencyMs = null;
    syncStatus.lastFetchDurationMs = null;
    syncStatus.totalFetchCount = 0;
    syncStatus.errorCount = 0;
    syncStatus.consecutiveErrors = 0;
    syncStatus.lastSuccessAt = null;
    syncStatus.lastErrorAt = null;
    syncStatus.requestHistory = [];
    syncStatus.errorHistory = [];
    syncStatus.dataAgeMinutes = null;
    syncStatus._latencyWindow = [];
    appData = null;
    resetArchivePageCache();
    ui.tab = "today";
    ui.subTab = null;
    render();
  }

  function diagnosticActionLabel(action) {
    var labels = {
      connection: "Test Bağlantısı",
      validation: "Veri Doğrulama",
      cache: "Önbellek Temizle",
      forceSync: "Zorla Senkron"
    };
    return labels[action] || "Tanı aracı";
  }

  function recordDiagnostic(action, status, detail) {
    diagnosticState.running = false;
    diagnosticState.action = action || "";
    diagnosticState.status = ["idle", "running", "ok", "error", "warn"].indexOf(status) !== -1 ? status : "idle";
    diagnosticState.detail = safeText(detail || "", 240);
    diagnosticState.at = new Date().toISOString();
  }

  function validatePanelData() {
    var issues = [];
    var dayCount = 0;
    if (!isObject(appData)) {
      issues.push("Henüz snapshot yüklenmedi.");
    } else {
      if (!isObject(appData.days)) issues.push("days alanı eksik veya geçersiz.");
      else dayCount = Object.keys(appData.days).length;
      if (appData.eventLog !== undefined && !isObject(appData.eventLog)) issues.push("eventLog alanı geçersiz.");
      var projection = projectData(appData);
      if (projection.coverage && projection.coverage.error) issues.push("Coverage projeksiyonu oluşturulamadı.");
      if (appData.eventLog && eventAdapter()) {
        var parsed = parsePanelEvents();
        if (!parsed.ok && parsed.code !== "empty") issues.push("Event günlüğü doğrulanamadı.");
      }
    }
    return {
      ok: issues.length === 0,
      issues: issues,
      dayCount: dayCount,
      snapshotRevision: auditRevisionValue(syncStatus.snapshotRevision) || null
    };
  }

  function runDataValidation() {
    var report = validatePanelData();
    var detail = report.ok
      ? "Veri doğrulaması başarılı · " + report.dayCount + " gün"
      : "Veri doğrulaması: " + report.issues.join(" ");
    recordDiagnostic("validation", report.ok ? "ok" : "error", detail);
    showToast(detail, report.ok ? "success" : "error");
    return report;
  }

  function testConnection() {
    if (!ui.panelToken) {
      recordDiagnostic("connection", "error", "Panel tokenı olmadan bağlantı test edilemez.");
      showToast(diagnosticState.detail, "error");
      return Promise.resolve(false);
    }
    if (isFetching) {
      recordDiagnostic("connection", "warn", "Devam eden bir bağlantı isteği var.");
      showToast(diagnosticState.detail, "info");
      return Promise.resolve(false);
    }
    diagnosticState.running = true;
    diagnosticState.action = "connection";
    diagnosticState.status = "running";
    diagnosticState.detail = "GitHub bağlantısı sınanıyor…";
    render();
    return load().then(function() {
      var ok = syncStatus.status === "accepted" && !syncStatus.lastErrorCode;
      var detail = ok ? "Bağlantı başarılı · snapshot erişilebilir." : "Bağlantı başarısız · " + safeText(syncStatus.lastErrorCode || "yanıt alınamadı", 120);
      recordDiagnostic("connection", ok ? "ok" : "error", detail);
      showToast(detail, ok ? "success" : "error");
      return ok;
    });
  }

  function clearPanelCache() {
    appData = null;
    resetArchivePageCache();
    syncStatus.etag = null;
    syncStatus.snapshotRevision = null;
    syncStatus.sourceUpdatedAt = null;
    syncStatus.lastSyncedAt = null;
    syncStatus.dataAgeMinutes = null;
    recordDiagnostic("cache", "ok", "Panel snapshot ve ETag önbelleği temizlendi.");
    showToast(diagnosticState.detail, "success");
    return true;
  }

  function forceSync() {
    if (!ui.panelToken) {
      recordDiagnostic("forceSync", "error", "Zorla senkron için panel tokenı gerekli.");
      showToast(diagnosticState.detail, "error");
      return Promise.resolve(false);
    }
    if (isFetching) {
      recordDiagnostic("forceSync", "warn", "Devam eden bir senkron isteği var.");
      showToast(diagnosticState.detail, "info");
      return Promise.resolve(false);
    }
    syncStatus.etag = null;
    diagnosticState.running = true;
    diagnosticState.action = "forceSync";
    diagnosticState.status = "running";
    diagnosticState.detail = "ETag atlanarak snapshot yenileniyor…";
    render();
    return refresh().then(function() {
      var ok = syncStatus.status === "accepted" && !syncStatus.lastErrorCode;
      var detail = ok ? "Zorla senkron tamamlandı." : "Zorla senkron başarısız · " + safeText(syncStatus.lastErrorCode || "yanıt alınamadı", 120);
      recordDiagnostic("forceSync", ok ? "ok" : "error", detail);
      showToast(detail, ok ? "success" : "error");
      return ok;
    });
  }

  function getDiagnosticState() {
    return Object.assign({}, diagnosticState);
  }

  function getAccessibilityState() {
    return {
      keyboardBound: accessibilityState.keyboardBound,
      liveMessage: accessibilityState.liveMessage,
      lastFocusKey: accessibilityState.lastFocusKey,
      focusTrapActive: !!accessibilityState.trapElement
    };
  }

  function getPerformanceState() {
    return {
      resizeHandled: performanceState.resizeHandled,
      scrollHandled: performanceState.scrollHandled,
      lastScrollTop: performanceState.lastScrollTop,
      lastResizeAt: performanceState.lastResizeAt,
      mapScheduleCount: performanceState.mapScheduleCount,
      mapInitCount: performanceState.mapInitCount,
      mapAssetLoadCount: performanceState.mapAssetLoadCount,
      scrollTargetBound: performanceState.scrollTargetBound,
      rootListenersBound: performanceState.rootListenersBound,
      leafletStatus: mapState.leafletStatus,
      archivePage: archivePageCache.page,
      archivePageSize: ARCHIVE_PAGE_SIZE,
      archiveTotal: archivePageCache.total
    };
  }

  function updateStatus(s) {
    if (s && typeof s === "object") {
      Object.keys(s).forEach(function(key) { syncStatus[key] = s[key]; });
    }
    render();
  }

  function init() {
    var rootEl = root.document && root.document.getElementById("root");
    if (rootEl && ui.theme) rootEl.setAttribute("data-theme", ui.theme);
    bindKeyboardNavigation();
    bindPerformanceListeners();
    restorePollingPreferences();
    ui.panelToken = normalizeToken(ui.panelToken || getLocalToken());
    render();
    if (ui.panelToken) {
      startPolling();
      load();
    } else {
      stopPolling();
    }
  }

  root.AeonV2 = {
    ui: ui,
    TABS: TABS,
    SYSTEM_SUB_TABS: SYSTEM_SUB_TABS,
    syncStatus: syncStatus,
    projectData: projectData,
    render: render,
    setTab: setTab,
    setDate: setDate,
    setData: setData,
    shiftDate: shiftDate,
    goToDayDetail: goToDayDetail,
    setTrendWindow: setTrendWindow,
    setHistoryWindow: setHistoryWindow,
    setHistoryFilter: setHistoryFilter,
    setArchiveSubTab: setArchiveSubTab,
    setSystemSubTab: setSystemSubTab,
    setEventFilter: setEventFilter,
    setEventLimit: setEventLimit,
    setEventPage: setEventPage,
    selectEvent: selectEvent,
    clearEventFilters: clearEventFilters,
    parsePanelEvents: parsePanelEvents,
    renderEventLog: renderEventLog,
    auditSequenceReport: auditSequenceReport,
    renderAuditDetail: renderAuditDetail,
    selectNotification: selectNotification,
    setMessageDraft: setMessageDraft,
    sendMessage: sendMessage,
    buildNotificationMessages: buildNotificationMessages,
    renderNotificationTimeline: renderNotificationTimeline,
    notificationDurationLabel: notificationDurationLabel,
    setArchivePage: setArchivePage,
    setArchiveSearch: setArchiveSearch,
    setArchiveFilter: setArchiveFilter,
    setArchiveView: setArchiveView,
    resetArchiveFilters: resetArchiveFilters,
    setDensity: setDensity,
    setTheme: setTheme,
    setPanelToken: setPanelToken,
    savePanelToken: setPanelToken,
    setPollingInterval: setPollingInterval,
    setAutoRefresh: setAutoRefresh,
    load: load,
    fetchLatest: fetchLatest,
    refresh: refresh,
    startPolling: startPolling,
    stopPolling: stopPolling,
    getPollingState: getPollingState,
    updateLatencyTelemetry: updateLatencyTelemetry,
    dataAgeMinutes: dataAgeMinutes,
    dataFreshnessLabel: dataFreshnessLabel,
    validatePanelData: validatePanelData,
    runDataValidation: runDataValidation,
    testConnection: testConnection,
    clearPanelCache: clearPanelCache,
    forceSync: forceSync,
    getDiagnosticState: getDiagnosticState,
    getAccessibilityState: getAccessibilityState,
    getPerformanceState: getPerformanceState,
    handleKeyboardNavigation: handleKeyboardNavigation,
    logout: logout,
    updateStatus: updateStatus,
    showToast: showToast,
    dismissToast: dismissToast,
    init: init,
    // Helper exports for testing
    AeEmpty: AeEmpty,
    AeCard: AeCard,
    AeButton: AeButton,
    AeStatusBadge: AeStatusBadge,
    AeMetric: AeMetric,
    AeProgressRing: AeProgressRing,
    AeDivider: AeDivider,
    AeToast: AeToast,
    AeSkeleton: AeSkeleton,
    AeTooltip: AeTooltip,
    animateCountUp: animateCountUp,
    renderLoadingState: renderLoadingState,
    getPullRefreshState: getPullRefreshState,
    getEnergy: getEnergy,
    getStress: getStress,
    getHabitSummary: getHabitSummary,
    getCravingDetails: getCravingDetails,
    getMagnesium: getMagnesium,
    getWindDown: getWindDown,
    getSleepMed: getSleepMed,
    getCycleInfo: getCycleInfo,
    getDiscomfortDetail: getDiscomfortDetail,
    getNutri: getNutri,
    HABIT_LABELS: HABIT_LABELS,
    HABIT_ICONS: HABIT_ICONS,
    getLocationInfo: getLocationInfo,
    compressLocationHistory: compressLocationHistory,
    locationMapsUrl: locationMapsUrl,
    getSteps: getSteps,
    collectHistoryRecords: collectHistoryRecords,
    getAppSessionInfo: getAppSessionInfo,
    getDaySavedAt: getDaySavedAt,
    SummaryCard: SummaryCard,
    AnomalyCard: AnomalyCard,
    DetailSection: DetailSection,
    DetailBlock: DetailBlock,
    AeSparkline: AeSparkline,
    renderMoodTrendChart: renderMoodTrendChart,
    renderMetricChart: renderMetricChart,
    renderMetricCharts: renderMetricCharts
  };
})(typeof window !== "undefined" ? window : this);
