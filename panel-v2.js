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

  var PTKEY = "seyma-panel-token";
  var APPKEY = "seyma-reset-v1";
  var REPO = "mustafaras/seyma-data";
  var BRANCH = "main";

  var ui = {
    tab: "today",
    subTab: null,
    date: isoDate(new Date()),
    trendWindow: 7,
    density: "comfortable",
    theme: "dark",
    panelToken: ""
  };

  var syncStatus = {
    status: "idle",
    lastErrorCode: null,
    snapshotRevision: null,
    sourceUpdatedAt: null,
    etag: null,
    lastSyncedAt: null,
    notModifiedCount: 0
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
    var icon = opts.icon || "◌";
    var title = safeText(opts.title || "Henüz veri yok", 80);
    var message = safeText(opts.message || "Bu bölümde görüntülenecek veri şu an yok.", 240);
    var variant = safeText(opts.variant || "", 20).replace(/[^A-Za-z0-9_-]/g, "");
    var cls = classNames(["ae-empty", "ae-scale-in", variant ? "ae-empty--" + variant : "", opts.className]);
    return '<div class="' + escapeHtml(cls) + '" role="' + escapeHtml(opts.role || "status") + '" aria-live="polite">' +
           '<div class="ae-empty__icon">' + escapeHtml(icon) + "</div>" +
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
    var label = safeText(opts.label || "ⓘ", 24);
    var triggerClass = classNames(["ae-tooltip-trigger", opts.triggerClass]);
    var ariaLabel = safeText(opts.ariaLabel || text, 120);
    return '<span class="ae-tooltip-wrap" data-tooltip-position="' + position + '">' +
           '<button type="button" class="' + escapeHtml(triggerClass) + '" aria-label="' + escapeHtml(ariaLabel) + '" aria-describedby="' + escapeHtml(id) + '">' +
           escapeHtml(label) +
           "</button>" +
           '<span class="ae-tooltip" id="' + escapeHtml(id) + '" role="tooltip">' + escapeHtml(text) + "</span>" +
           "</span>";
  }

  function AeDivider(opts) {
    opts = opts || {};
    var label = safeText(opts.label || "", 80);
    var classes = classNames(["ae-divider", label ? "ae-divider--label" : "", opts.className]);
    var aria = label ? ' aria-label="' + escapeHtml(label) + '"' : "";
    return '<div class="' + escapeHtml(classes) + '" role="separator"' + aria + '>' +
           (label ? '<span class="ae-divider__label">' + escapeHtml(label) + "</span>" : "") +
           "</div>";
  }

  function AeToast(opts) {
    opts = opts || {};
    var allowedTypes = ["success", "error", "info"];
    var type = allowedTypes.indexOf(opts.type) !== -1 ? opts.type : "info";
    var message = safeText(opts.message || opts.text || "Bildirim", 240);
    var id = String(opts.id || "toast").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 48) || "toast";
    var icons = { success: "✓", error: "!", info: "i" };
    var role = type === "error" ? "alert" : "status";
    var close = opts.dismissible === false ? "" :
      '<button type="button" class="ae-toast__close" onclick="AeonV2.dismissToast(\'' + escapeHtml(id) + '\')" aria-label="Bildirimi kapat">×</button>';
    return '<div class="ae-toast ae-toast--' + type + '" id="ae-toast-' + escapeHtml(id) +
           '" role="' + role + '" aria-live="polite" aria-atomic="true">' +
           '<span class="ae-toast__icon" aria-hidden="true">' + icons[type] + "</span>" +
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
               '<span class="ae-metric__icon" aria-hidden="true">' + escapeHtml(opts.icon || "◌") + "</span>" +
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
    if (opts.ariaLabel) attrs += ' aria-label="' + escapeHtml(opts.ariaLabel) + '"';
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
  var MOOD_ICONS = { 1: "⛈", 2: "☁️", 3: "🌫", 4: "🌤", 5: "☀️", 6: "🌈", 7: "✨" };
  var MOOD_ID_LABELS = {
    "cok-iyi": "Çok iyi", "iyi": "İyi", "normal": "Normal",
    "zorlandim": "Zorlandım", "cok-zorlandim": "Çok zorlandım"
  };
  var MOOD_ID_ICONS = {
    "cok-iyi": "☀️", "iyi": "🌸", "normal": "🍃",
    "zorlandim": "🌧", "cok-zorlandim": "🌊"
  };
  var MOOD_ORDER = ["cok-zorlandim", "zorlandim", "normal", "iyi", "cok-iyi"];

  function moodIdToNumber(id) {
    var map = { "cok-zorlandim": 1, "zorlandim": 2, "normal": 3, "iyi": 4, "cok-iyi": 5 };
    return map[id] || null;
  }

  function getMood(day) {
    if (!isObject(day)) return { value: null, label: null, icon: "◌", note: "" };
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
    var icon = (val ? (MOOD_ICONS[val] || "◌") : (MOOD_ID_ICONS[String(raw || "")] || "◌"));
    return { value: val, raw: raw, label: label, icon: icon, note: note };
  }

  function getSteps(day) {
    if (!isObject(day)) return null;
    var h = day.health || {}, w = day.walk || {}, m = day.movement || {};
    var v = safeNumber(h.steps);
    if (v === null) v = safeNumber(w.steps);
    if (v === null) v = safeNumber(m.walkM) !== null ? 0 : null; // movement exists but no step estimate
    return v;
  }

  function getWater(day) {
    return isObject(day) ? safeNumber(day.water) : null;
  }

  function getSleepHours(day) {
    return isObject(day) && isObject(day.sleep) ? safeNumber(day.sleep.hours) : null;
  }

  function getSleepQuality(day) {
    return isObject(day) && isObject(day.sleep) ? safeNumber(day.sleep.quality) : null;
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
    if (!isObject(appData) || !isObject(appData.zikr) || !isObject(appData.zikr.sessions)) return null;
    var s = appData.zikr.sessions[date];
    if (!isObject(s)) return null;
    return safeNumber(s.totalCount);
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
    return isObject(day) ? safeNumber(day.energy) : null;
  }

  function getStress(day) {
    return isObject(day) ? safeNumber(day.stress) : null;
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
    sweetManaged: "🍬", foodManaged: "🍽", coffeeManaged: "☕",
    eveningControl: "🌙", walked20: "👟", protein: "🥩",
    water: "💧", vitaminD: "💊", sleepReg: "😴", journaled: "📝",
    mediaFed: "📚", freshAir: "🌿", selfKind: "💖",
    caffeineOk: "✅", magnesium: "🧪"
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
    var v = safeNumber(appData.settings.targets[key]);
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
    var moodText = mood.label ? (mood.icon + " " + mood.label) : (mood.raw ? ("ID: " + mood.raw) : "—");
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
             icon: "🌤", title: "Mod", value: moodText, countValue: mood.value, countFormat: "mood", countBadge: true, color: "mood", sub: moodSub,
             sparkline: moodSeries, delta: metricDelta(moodSeries),
             ring: { value: mood.value === null ? 0 : (mood.value / 7) * 100, color: "accent", label: "Mod ilerlemesi" }
           }) +
           AeMetric({
             icon: "🌙", title: "Uyku", value: sleepText, countValue: sleepH, countFormat: "hours", color: "sleep", sub: sleepSub,
             sparkline: sleepSeries, delta: metricDelta(sleepSeries),
             ring: { value: sleepH === null ? 0 : (sleepH / 8) * 100, color: "info", label: "Uyku hedefi" }
           }) +
           AeMetric({
             icon: "🆘", title: "SOS", value: sosText, countValue: sosCount > 0 ? sosCount : null, countFormat: "integer", color: sosCount > 0 ? "drop" : "ok", sub: sosSub,
             sparkline: sosSeries, delta: metricDelta(sosSeries, true),
             ring: { value: Math.min(100, sosCount * 20), color: sosCount > 0 ? "drop" : "ok", label: "SOS yoğunluğu" }
           }) +
           AeMetric({
             icon: "👟", title: "Adım", value: stepsText, countValue: steps, countFormat: "integer", color: "info", unit: steps !== null ? "adım" : null,
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
    var values = Array.isArray(data) ? data.slice(0, 30).map(safeNumber) : [];
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
    if (day.journal && day.journal.text) items.push({ kind: "Günlük", icon: "📝", detail: String(day.journal.text || "") });
    if (day.note) items.push({ kind: "Not", icon: "📌", detail: String(day.note || "") });
    if (day.intention) items.push({ kind: "Niyet", icon: "🕯", detail: String(day.intention || "") });
    if (day.gratitude) {
      if (Array.isArray(day.gratitude)) {
        items.push({ kind: "Şükür", icon: "🙏", detail: day.gratitude.map(function(x){ return "• " + String(x || ""); }).join("\n") });
      } else {
        items.push({ kind: "Şükür", icon: "🙏", detail: String(day.gratitude || "") });
      }
    }
    var therapy = getTherapy(day);
    var share = therapy.share || {};
    if (share.text || share.note || share.summary) {
      items.push({ kind: "Terapi paylaşımı", icon: "🛡", redacted: true, detail: "Ham terapi notu gizli; özet güvenli gösterilebilir." });
    }

    if (!items.length) return "";

    var chips = items.map(function(it) {
      return '<span class="ae-chip ' + (it.redacted ? "ae-chip--redacted" : "") + '">' +
             escapeHtml(it.icon + " " + it.kind) +
             (it.redacted ? ' <span class="ae-chip__hint">redacted</span>' : "") +
             "</span>";
    }).join("");

    var list = items.map(function(it) {
      var body = it.detail ? '<div class="quick-notes__detail">' + nl2br(escapeHtml(it.detail)) + "</div>" : "";
      return '<div class="quick-notes__item ' + (it.redacted ? "quick-notes__item--redacted" : "") + '">' +
             '<div class="quick-notes__kind">' + escapeHtml(it.icon + " " + it.kind) + (it.redacted ? ' <span class="ae-chip__hint">gizli</span>' : "") + "</div>" +
             body +
             "</div>";
    }).join("");

    return AeCard({
      variant: "summary",
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
           AeButton({ label: "◀", variant: "mini", className: "date-picker__nav", onclick: "AeonV2.shiftDate(-1)", ariaLabel: "Önceki gün" }) +
           '<div class="date-picker__display">' +
           '<div class="date-picker__label">' + escapeHtml(dateText) + "</div>" +
           '<div class="date-picker__iso">' + escapeHtml(ui.date) + "</div>" +
           "</div>" +
           AeButton({ label: "▶", variant: "mini", className: "date-picker__nav", onclick: "AeonV2.shiftDate(1)", ariaLabel: "Sonraki gün" }) +
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
               '<div class="anomaly-card__icon" aria-hidden="true">' + escapeHtml({ sleep: "🌙", sos: "🆘", missing: "🕳", moh: "🌫", steps: "👟", water: "💧" }[a.kind] || "◌") + "</div>" +
               '<div class="anomaly-card__body">' +
               '<div class="anomaly-card__message">' + escapeHtml(a.message || "Dikkat gerektiren durum") + "</div>" +
               '<div class="anomaly-card__meta">' + escapeHtml(dateLabel) +
               '<span class="anomaly-card__severity anomaly-card__severity--' + escapeHtml(severity) + '">' + escapeHtml(severity) + "</span></div>" +
               "</div>" +
               AeButton({ label: "Detay gör", variant: "text", onclick: "AeonV2.goToDayDetail('" + escapeHtml(a.linkDate || "") + "')" }) +
               "</div>";
    return AeCard({
      variant: "solid",
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
      var active = ui.trendWindow === d ? "is-active" : "";
      return AeButton({
        label: d + " gün",
        variant: "pill",
        className: active,
        onclick: "AeonV2.setTrendWindow(" + d + ")",
        ariaLabel: d + " günlük pencere"
      });
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
           AeTooltip({ id: "aeon-brand-tooltip", label: "Æ", triggerClass: "ae-topbar__logo", ariaLabel: "ÆON Observer Dashboard", text: "ÆON gözlem paneli" }) +
           '<span class="ae-topbar__title">ÆON</span>' +
           "</div>" +
           '<div class="ae-topbar__tools">' +
           '<button type="button" class="ae-status-btn" onclick="AeonV2.setTab(\'system\');AeonV2.setSystemSubTab(\'status\')" aria-label="Senkron durumu">' +
           AeStatusBadge({ status: syncStatus.status }) +
           "</button>" +
           AeButton({ label: "↻", variant: "mini", className: "ae-btn--icon", onclick: "AeonV2.refresh()", ariaLabel: "Yenile" }) +
           AeButton({ label: "✕", variant: "mini", className: "ae-btn--icon", onclick: "AeonV2.logout()", ariaLabel: "Oturumu sonlandır" }) +
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
    return '<div class="today-view ae-slide-up">' +
           renderDatePicker() +
           renderHeroGrid(date) +
           renderTrendStrip(date) +
           renderQuickNotes(date) +
           renderLocationTimeline(null) +
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
    return '<div class="trends-view ae-slide-up">' +
           renderWindowSelector() +
           renderSummaryGrid(date, windowDays) +
           renderMoodTrendChart(date) +
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
      visualVariant: opts.visualVariant || "glass",
      className: "detail-section",
      children: '<div class="detail-section__head">' +
                '<span class="detail-section__icon" aria-hidden="true">' + escapeHtml(icon) + "</span>" +
                '<span class="detail-section__title">' + escapeHtml(title) + "</span>" +
                "</div>" + bodyHtml
    });
  }

  function DetailBlock(opts) {
    opts = opts || {};
    var icon = safeText(opts.icon || "◌", 4);
    var title = safeText(opts.title || "", 80);
    var body = opts.body || "";
    var meta = opts.meta ? '<div class="detail-block__meta">' + escapeHtml(opts.meta) + "</div>" : "";
    var classes = classNames(["detail-block", "ae-scale-in", opts.redacted ? "detail-block--redacted" : "", opts.className]);
    return '<div class="' + escapeHtml(classes) + '">' +
           '<div class="detail-block__head">' +
           '<span class="detail-block__icon" aria-hidden="true">' + escapeHtml(icon) + "</span>" +
           '<span class="detail-block__title">' + escapeHtml(title) + "</span>" +
           "</div>" +
           meta +
           '<div class="detail-block__body">' + body + "</div>" +
           "</div>";
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
    return '<div class="ae-card ae-card--outline ae-card--summary day-date-picker">' +
           AeButton({ label: "◀", variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(-1)", ariaLabel: "Önceki gün" }) +
           '<div class="day-date-picker__display">' +
           '<div class="day-date-picker__label">' + escapeHtml(label) + "</div>" +
           '<div class="day-date-picker__iso">' + escapeHtml(date) + "</div>" +
           "</div>" +
           AeButton({ label: "▶", variant: "mini", className: "day-date-picker__nav", onclick: "AeonV2.shiftDate(1)", ariaLabel: "Sonraki gün" }) +
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
    var cells = dates.map(function(d) {
      var toneClass = '', label = '';
      if (d) {
        var day = getDay(d) || {};
        var mood = getMood(day).value;
        toneClass = mood ? ' day-heatmap__cell--mood-' + mood : '';
        label = '<span class="day-heatmap__day">' + escapeHtml(Number(d.split("-")[2]).toString()) + "</span>";
      } else {
        toneClass = ' day-heatmap__cell--empty';
      }
      var title = d ? formatDateLabel(d) : 'Gelecek gün';
      return '<div class="day-heatmap__cell' + toneClass + '" title="' + escapeHtml(title) + '">' + label + "</div>";
    }).join("");
    return '<div class="ae-card ae-card--solid ae-card--summary day-heatmap">' +
           '<div class="ae-label">Son 30 gün</div>' +
           '<div class="day-heatmap__grid">' + cells + "</div>" +
           "</div>";
  }

  function renderMoodTherapy(date) {
    var day = getDay(date) || {};
    var mood = getMood(day);
    var html = "";

    var chips = [];
    if (mood.label) chips.push(renderChip(mood.icon + " " + mood.label + (mood.note ? " · " + mood.note : ""), false));
    if (day.journal && day.journal.text) chips.push(renderChip("📝 Günlük", false));
    if (day.note) chips.push(renderChip("📌 Not", false));
    if (day.intention) chips.push(renderChip("🕯 Niyet", false));
    if (day.gratitude) chips.push(renderChip("🙏 Şükür", false));

    var t = getTherapy(day);
    var thoughts = Array.isArray(t.thoughts) ? t.thoughts : [];
    if (thoughts.length) chips.push(renderChip("💭 Düşünce (" + thoughts.length + ")", false));
    if (isObject(t.decision) && (t.decision.choice || t.decision.optionA || t.decision.optionB)) chips.push(renderChip("✓ Karar: " + safeText(t.decision.choice || "", 40), false));
    if (isObject(t.share) && (t.share.note || t.share.sentAt)) chips.push(renderChip("🛡 Terapi paylaşımı", true));
    if (isObject(t.breath) && (t.breath.pattern || t.breath.seconds)) chips.push(renderChip("🌬 Nefes " + (t.breath.pattern || ""), false));
    if (isObject(t.dailyWin) && t.dailyWin.text) chips.push(renderChip("🏆 Günlük kazanım", false));
    if (isObject(t.selfCompassion) && (t.selfCompassion.prompt || t.selfCompassion.note)) chips.push(renderChip("💖 Kendi şefkati", false));
    if (isObject(t.firstStep) && (t.firstStep.text || t.firstStep.completedAt)) chips.push(renderChip("👣 İlk adım", false));
    if (chips.length) html += '<div class="detail-section__chips">' + chips.join("") + "</div>";

    if (day.journal && day.journal.text) {
      html += DetailBlock({ icon: "📝", title: "Günlük", body: nl2br(escapeHtml(String(day.journal.text || ""))), meta: "Mod: " + (day.journal.mode || "free") + (day.journal.promptUsed ? " · " + day.journal.promptUsed : "") });
    }
    if (day.note) html += DetailBlock({ icon: "📌", title: "Not", body: nl2br(escapeHtml(String(day.note || ""))) });
    if (day.intention) html += DetailBlock({ icon: "🕯", title: "Niyet", body: nl2br(escapeHtml(String(day.intention || ""))) });
    if (day.gratitude) {
      var gList = Array.isArray(day.gratitude) ? day.gratitude : [day.gratitude];
      var gBody = gList.map(function(x){ return "• " + escapeHtml(String(x || "")); }).join("<br>");
      html += DetailBlock({ icon: "🙏", title: "Şükür", body: gBody });
    }
    if (thoughts.length) {
      var thoughtsBody = thoughts.map(function(x, i) {
        var title = x.situation || x.thought || "Düşünce " + (i + 1);
        return "<div class='detail-block__sub'><strong>" + escapeHtml(safeText(title, 120)) + "</strong>" +
               (x.altThought ? "<br>Alternatif: " + escapeHtml(x.altThought) : "") + "</div>";
      }).join("");
      html += DetailBlock({ icon: "💭", title: "Bilişsel düşünce kayıtları (" + thoughts.length + ")", body: thoughtsBody });
    }
    if (isObject(t.dailyWin) && t.dailyWin.text) html += DetailBlock({ icon: "🏆", title: "Günlük kazanım", body: nl2br(escapeHtml(t.dailyWin.text)) });
    if (isObject(t.decision) && (t.decision.choice || t.decision.note)) {
      var dBody = "";
      if (t.decision.optionA) dBody += "A: " + escapeHtml(t.decision.optionA) + "<br>";
      if (t.decision.optionB) dBody += "B: " + escapeHtml(t.decision.optionB) + "<br>";
      if (t.decision.choice) dBody += "Seçim: <strong>" + escapeHtml(t.decision.choice) + "</strong><br>";
      if (t.decision.note) dBody += "Not: " + escapeHtml(t.decision.note);
      html += DetailBlock({ icon: "✓", title: "Karar", body: dBody });
    }
    if (isObject(t.selfCompassion) && (t.selfCompassion.prompt || t.selfCompassion.note)) {
      html += DetailBlock({ icon: "💖", title: "Kendi şefkati", body: (t.selfCompassion.prompt ? "Prompt: " + escapeHtml(t.selfCompassion.prompt) + "<br>" : "") + nl2br(escapeHtml(t.selfCompassion.note || "")) });
    }
    if (isObject(t.breath) && t.breath.seconds) {
      html += DetailBlock({ icon: "🌬", title: "Nefes", body: "Pattern: " + escapeHtml(t.breath.pattern || "4-7-8") + " · " + fmtDuration(t.breath.seconds) });
    }
    if (isObject(t.firstStep) && t.firstStep.text) {
      html += DetailBlock({ icon: "👣", title: "İlk adım", body: nl2br(escapeHtml(t.firstStep.text)) });
    }
    if (isObject(t.share) && (t.share.note || t.share.sentAt)) {
      html += DetailBlock({ icon: "🛡", title: "Terapi paylaşımı", body: "Kullanıcı tarafından paylaşıldı · ham metin gizli", redacted: true });
    }

    return DetailSection({
      id: "mood-therapy",
      title: "Ruh hali & Terapi",
      icon: "🌤",
      emptyText: "Bu gün için ruh hali veya terapi özeti kaydı yok.",
      children: html
    });
  }

  function renderNutrition(date) {
    var day = getDay(date) || {};
    var chips = [];
    var water = getWater(day);
    if (water !== null && water > 0) chips.push(renderChip("💧 Su: " + water + " bardak", false));

    var mealKeys = ["breakfast", "lunch", "dinner", "snack"];
    var mealLabels = { breakfast: "Kahvaltı", lunch: "Öğle", dinner: "Akşam", snack: "Ara" };
    var mealCount = 0;
    var meals = getMeals(day);
    mealKeys.forEach(function(k){ if (meals[k]) mealCount++; });
    if (mealCount) chips.push(renderChip("🍽 Öğün: " + mealCount + "/4", false));

    var caf = getCaffeine(day);
    if (caf.drinks && caf.drinks.length) chips.push(renderChip("☕ Kafein: " + caf.drinks.length + " içecek", false));

    var med = isObject(day.sleep) && isObject(day.sleep.med) ? day.sleep.med : null;
    if (med && (med.type || med.note)) chips.push(renderChip("💊 Uyku ilacı", false));

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
      html += DetailBlock({ icon: "🍽", title: label, body: body });
    });

    var hasCaffeine = caf && ((caf.drinks && caf.drinks.length) || caf.last || caf.cups);
    if (water !== null || hasCaffeine) {
      var fluidBody = water !== null ? "💧 Su: " + water + " bardak" : "";
      if (caf.drinks && caf.drinks.length) {
        fluidBody += (fluidBody ? "<br>" : "") + caf.drinks.map(function(d){ return "☕ " + escapeHtml(String(d.type || "")) + (d.qty ? " ×" + d.qty : "") + (d.time ? " @" + escapeHtml(d.time) : ""); }).join("<br>");
      } else if (caf.cups) {
        fluidBody += (fluidBody ? "<br>" : "") + "Kafein: " + caf.cups + " fincan" + (caf.last ? " (son @" + escapeHtml(caf.last) + ")" : "");
      }
      html += DetailBlock({ icon: "🥤", title: "Sıvı & Kafein", body: fluidBody });
    }

    if (med && (med.type || med.note)) {
      html += DetailBlock({ icon: "💊", title: "Uyku ilacı", body: (med.type ? escapeHtml(med.type) + "<br>" : "") + nl2br(escapeHtml(med.note || "")) });
    }

    return DetailSection({
      id: "nutrition",
      title: "Beslenme & Öğün",
      icon: "🍽",
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
      chips.push(renderChip("🕌 Namaz: " + done + "/5", false));
    }
    var zCount = getZikrCount(date);
    if (zCount !== null && zCount > 0) chips.push(renderChip("📿 Zikir: " + zCount.toLocaleString("tr-TR"), false));
    var s = getSaygiInfo(day);
    if (s && s.name) {
      chips.push(renderChip("🌟 Öncü: " + safeText(s.name, 40), false));
      if (s.read) chips.push(renderChip("✓ Okundu", false));
    }
    var q = day.quranRequests || (day.quranJourney && day.quranJourney.requests) || [];
    if (Array.isArray(q) && q.length) chips.push(renderChip("📖 Kur'an yolculuğu", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    vakitNames.forEach(function(k) {
      var e = p[k];
      if (!e || (!e.time && e.performed === false && !e.nafile && !e.note)) return;
      var label = PRAYER_LABELS[k] || k;
      var status = [];
      if (e.performed) status.push("✓ Kılındı");
      if (e.inCongregation) status.push("Cemaat");
      if (e.late) status.push("Gecikti");
      if (e.madeUp) status.push("Telafi");
      if (e.nafile) status.push("Nafile " + e.nafile);
      var meta = (e.time ? "Vakit: " + e.time : "Vakit yok") + (status.length ? " · " + status.join(", ") : "");
      html += DetailBlock({ icon: "🕌", title: label, body: meta + (e.note ? "<br>Not: " + escapeHtml(e.note) : "") });
    });

    if (zCount !== null && zCount > 0) {
      var zs = (isObject(appData) && isObject(appData.zikr) && isObject(appData.zikr.sessions) && isObject(appData.zikr.sessions[date])) ? appData.zikr.sessions[date] : {};
      var per = isObject(zs.perPreset) ? zs.perPreset : {};
      var perBody = Object.keys(per).length ? Object.keys(per).map(function(pid){ return "• " + escapeHtml(pid) + ": " + Number(per[pid] || 0).toLocaleString("tr-TR"); }).join("<br>") : "Toplam " + zCount.toLocaleString("tr-TR") + " vird";
      html += DetailBlock({ icon: "📿", title: "Zikir", body: perBody });
    }

    if (s && s.name) {
      html += DetailBlock({ icon: "🌟", title: "Saygı", body: escapeHtml(s.name) + (s.read ? "<br>✓ Okundu" : "") });
    }

    if (Array.isArray(q) && q.length) {
      var qBody = q.map(function(r){ return "• " + escapeHtml(String(r.surah || r.verseRef || r.type || JSON.stringify(r).slice(0, 80))); }).join("<br>");
      html += DetailBlock({ icon: "📖", title: "Kur'an yolculuğu", body: qBody });
    }

    return DetailSection({
      id: "prayer",
      title: "İbadet & Saygı",
      icon: "🕌",
      emptyText: "Bugün için ibadet, zikir veya Saygı kaydı yok.",
      children: html
    });
  }

  function renderHabits(date) {
    var day = getDay(date) || {};
    var hs = getHabitSummary(day);
    var hasHabitData = Object.keys(getHabits(day)).length > 0;
    var chips = [];
    if (hasHabitData) chips.push(renderChip("✅ " + hs.doneCount + "/" + hs.total + " alışkanlık", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (hasHabitData && hs.done.length) {
      var doneBody = hs.done.map(function(k) {
        return '<div class="habit-row habit-row--done"><span class="habit-row__icon">' + (HABIT_ICONS[k] || "✅") + '</span><span class="habit-row__label">' + escapeHtml(HABIT_LABELS[k] || k) + "</span></div>";
      }).join("");
      html += DetailBlock({ icon: "✅", title: "Yapılan alışkanlıklar (" + hs.doneCount + ")", body: doneBody });
    }
    if (hasHabitData && hs.undone.length) {
      var undoneBody = hs.undone.map(function(k) {
        return '<div class="habit-row habit-row--undone"><span class="habit-row__icon">' + (HABIT_ICONS[k] || "◻") + '</span><span class="habit-row__label">' + escapeHtml(HABIT_LABELS[k] || k) + "</span></div>";
      }).join("");
      html += DetailBlock({ icon: "◻", title: "Yapılmayan alışkanlıklar (" + hs.undone.length + ")", body: undoneBody });
    }

    return DetailSection({
      id: "habits",
      title: "Alışkanlıklar",
      icon: "✅",
      emptyText: "Bugün için alışkanlık kaydı yok.",
      children: html
    });
  }

  function renderEnergyStress(date) {
    var day = getDay(date) || {};
    var energy = getEnergy(day);
    var stress = getStress(day);

    var chips = [];
    if (energy !== null) chips.push(renderChip("⚡ Enerji: " + energy + "/5", false));
    if (stress !== null) chips.push(renderChip("😰 Stres: " + stress + "/5", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (energy !== null) {
      var eBar = '<div class="scale-bar"><div class="scale-bar__fill scale-bar__fill--energy" style="width:' + (energy / 5 * 100) + '%"></div></div>';
      html += DetailBlock({ icon: "⚡", title: "Enerji seviyesi", body: energy + "/5" + eBar });
    }
    if (stress !== null) {
      var sBar = '<div class="scale-bar"><div class="scale-bar__fill scale-bar__fill--stress" style="width:' + (stress / 5 * 100) + '%"></div></div>';
      html += DetailBlock({ icon: "😰", title: "Stres seviyesi", body: stress + "/5" + sBar });
    }

    return DetailSection({
      id: "energy-stress",
      title: "Enerji & Stres",
      icon: "⚡",
      emptyText: "Bugün için enerji veya stres ölçümü yok.",
      children: html
    });
  }

  function renderCraving(date) {
    var day = getDay(date) || {};
    var c = getCravingDetails(day);
    var chips = [];
    if (c.sosCount > 0) chips.push(renderChip("🆘 SOS: " + c.sosCount, false));
    if (c.tenMinDone) chips.push(renderChip("🍬 10 dk gecikme", false));
    if (c.foodDone) chips.push(renderChip("🍽 Yemek krizi yönetildi", false));
    if (c.coffeeDone) chips.push(renderChip("☕ Kahve krizi yönetildi", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (c.sosCount > 0) {
      html += DetailBlock({ icon: "🆘", title: "SOS aktivasyonları", body: c.sosCount + " kez SOS butonuna basıldı" });
    }
    if (c.optionsUsed.length) {
      html += DetailBlock({ icon: "🔧", title: "Kullanılan SOS seçenekleri", body: c.optionsUsed.map(function(o) { return "• " + escapeHtml(String(o)); }).join("<br>") });
    }
    if (c.triggers.length) {
      html += DetailBlock({ icon: "⚠️", title: "Tetikleyiciler", body: c.triggers.map(function(t) { return "• " + escapeHtml(String(t)); }).join("<br>") });
    }
    if (c.triggerNote) {
      html += DetailBlock({ icon: "📝", title: "Tetikleyici notu", body: nl2br(escapeHtml(c.triggerNote)) });
    }
    if (c.tenMinDone || c.foodDone || c.coffeeDone) {
      var copingBody = [];
      if (c.tenMinDone) copingBody.push("✅ Tatlı krizi: 10 dakika gecikme yapıldı");
      if (c.foodDone) copingBody.push("✅ Yemek krizi yönetildi");
      if (c.coffeeDone) copingBody.push("✅ Kahve krizi yönetildi");
      html += DetailBlock({ icon: "💪", title: "Baş etme stratejileri", body: copingBody.join("<br>") });
    }

    return DetailSection({
      id: "craving",
      title: "Kriz & Baş etme",
      icon: "🆘",
      emptyText: "Bugün için istek veya SOS kaydı yok.",
      children: html
    });
  }

  function renderMagnesium(date) {
    var day = getDay(date) || {};
    var mg = getMagnesium(day) || {};

    var chips = [];
    if (mg.taken) chips.push(renderChip("🧪 Magnezyum alındı", false));
    else if (mg.skipped) chips.push(renderChip("🧪 Magnezyum atlandı", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (mg.taken) {
      var mgBody = "";
      if (mg.form) mgBody += "Form: " + escapeHtml(mg.form) + "<br>";
      if (mg.mg) mgBody += "Doz: " + mg.mg + " mg<br>";
      if (mg.time) mgBody += "Saat: " + escapeHtml(mg.time) + "<br>";
      if (Array.isArray(mg.reason) && mg.reason.length) mgBody += "Neden: " + mg.reason.map(function(r) { return escapeHtml(String(r)); }).join(", ") + "<br>";
      if (mg.effectNote) mgBody += "Etki: " + nl2br(escapeHtml(mg.effectNote));
      html += DetailBlock({ icon: "🧪", title: "Magnezyum takviyesi", body: mgBody || "Alındı" });
    } else if (mg.skipped) {
      html += DetailBlock({ icon: "🧪", title: "Magnezyum atlandı", body: mg.feedback ? "Geri bildirim: " + escapeHtml(String(mg.feedback)) : "Atlandı" });
    }

    return DetailSection({
      id: "magnesium",
      title: "Magnezyum",
      icon: "🧪",
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
    if (windDown && stepCount > 0) chips.push(renderChip("🌙 Wind-down: " + stepCount + "/4 adım", false));
    if (windDown && wd.lastMinutes) chips.push(renderChip("⏱ " + wd.lastMinutes + " dk", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (windDown) {
      var stepsBody = "";
      stepsBody += (wd.light ? "✅" : "◻") + " Işık azaltma<br>";
      stepsBody += (wd.breath ? "✅" : "◻") + " Nefes egzersizi<br>";
      stepsBody += (wd.dump ? "✅" : "◻") + " Zihin boşaltma<br>";
      stepsBody += (wd.cool ? "✅" : "◻") + " Serinleme<br>";
      if (wd.lastMinutes) stepsBody += "<br>Süre: " + wd.lastMinutes + " dk";
      html += DetailBlock({ icon: "🌙", title: "Wind-down adımları", body: stepsBody });
    }

    if (windDown && wd.offloadNote) {
      html += DetailBlock({ icon: "📤", title: "Zihin boşaltma notu", body: nl2br(escapeHtml(wd.offloadNote)) });
    }

    return DetailSection({
      id: "winddown",
      title: "Wind-down (Uyku hazırlık)",
      icon: "🌙",
      emptyText: "Bugün için uyku rutini kaydı yok.",
      children: html
    });
  }

  function renderCycle(date) {
    var day = getDay(date) || {};
    var cyc = getCycleInfo(day);
    var chips = [];
    if (cyc.flow) chips.push(renderChip("🩸 Akış: " + escapeHtml(cyc.flow), false));
    if (cyc.symptoms.length) chips.push(renderChip("🩺 Semptom: " + cyc.symptoms.length, false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (cyc.flow) {
      html += DetailBlock({ icon: "🩸", title: "Adet akışı", body: escapeHtml(cyc.flow) });
    }
    if (cyc.symptoms.length) {
      html += DetailBlock({ icon: "🩺", title: "Semptomlar", body: cyc.symptoms.map(function(s) { return "• " + escapeHtml(String(s)); }).join("<br>") });
    }

    return DetailSection({
      id: "cycle",
      title: "Döngü & Semptomlar",
      icon: "🩸",
      emptyText: "Bugün için döngü veya semptom kaydı yok.",
      children: html
    });
  }

  function renderNutri(date) {
    var day = getDay(date) || {};
    var nutriData = getNutri(day);
    var nutri = nutriData || {};

    var chips = [];
    if (nutriData && nutri.calories) chips.push(renderChip("🔥 " + nutri.calories + " kcal", false));
    if (nutriData && nutri.protein) chips.push(renderChip("🥩 Protein: " + nutri.protein + "g", false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (nutriData && Object.keys(nutriData).length) {
      var body = "";
      if (nutri.calories) body += "🔥 Kalori: " + nutri.calories + " kcal<br>";
      if (nutri.protein) body += "🥩 Protein: " + nutri.protein + "g<br>";
      if (nutri.carbs) body += "🍚 Karbonhidrat: " + nutri.carbs + "g<br>";
      if (nutri.fat) body += "🧈 Yağ: " + nutri.fat + "g<br>";
      if (nutri.items) body += "📦 Öğün sayısı: " + nutri.items;
      html += DetailBlock({ icon: "📊", title: "Makro besin özeti", body: body });
    }

    return DetailSection({
      id: "nutri",
      title: "Besin değerleri",
      icon: "📊",
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
    if (steps !== null && steps > 0) chips.push(renderChip("👟 Adım: " + steps.toLocaleString("tr-TR"), false));
    if (m.walkM > 0) chips.push(renderChip("🚶 Yürüyüş: " + m.walkM + " m", false));
    if (m.vehicleM > 0) chips.push(renderChip("🚗 Araç: " + m.vehicleM + " m", false));
    if (m.totalM > 0) chips.push(renderChip("📍 Toplam: " + m.totalM + " m", false));
    if (disDetail.totalRegions > 0) chips.push(renderChip("🩹 Rahatsızlık: " + disDetail.totalRegions + " bölge", false));
    var segs = Array.isArray(loc.segments) ? loc.segments : [];
    var cats = [];
    segs.forEach(function(seg) { if (seg && seg.category && cats.indexOf(seg.category) === -1) cats.push(seg.category); });
    if (cats.length) chips.push(renderChip("🗺 Konum kategorileri: " + cats.join(", "), false));

    var html = chips.length ? '<div class="detail-section__chips">' + chips.join("") + "</div>" : "";

    if (steps !== null && steps > 0) {
      html += DetailBlock({ icon: "👟", title: "Adım", body: steps.toLocaleString("tr-TR") + " adım" });
    }
    if (m.walkM > 0 || m.vehicleM > 0 || m.totalM > 0) {
      var movBody = "";
      if (m.walkM) movBody += "🚶 Yürüyüş: " + m.walkM + " m";
      if (m.vehicleM) movBody += (movBody ? "<br>" : "") + "🚗 Araç: " + m.vehicleM + " m";
      if (m.totalM) movBody += (movBody ? "<br>" : "") + "📍 Toplam: " + m.totalM + " m";
      if (m.maxSpeed) movBody += (movBody ? "<br>" : "") + "Max hız: " + m.maxSpeed + " m/sn";
      if (m.samples) movBody += (movBody ? "<br>" : "") + "Örnek: " + m.samples + " adet";
      if (m.walkSec) movBody += (movBody ? "<br>" : "") + "Yürüyüş süre: " + fmtDuration(m.walkSec / 60);
      if (m.vehicleSec) movBody += (movBody ? "<br>" : "") + "Araç süre: " + fmtDuration(m.vehicleSec / 60);
      html += DetailBlock({ icon: "🛣", title: "Hareket", body: movBody });
    }

    if (disDetail.totalRegions > 0 || dis.note || (dis.meds && dis.meds.length)) {
      var regBody = disDetail.regions.map(function(r) {
        var levelStr = ["○", "●", "●●", "●●●"][r.level] || "●";
        return "• " + escapeHtml(r.id) + " " + levelStr;
      }).join("<br>");
      if (dis.note) regBody += (regBody ? "<br>" : "") + "Not: " + escapeHtml(dis.note);
      if (dis.meds && dis.meds.length) regBody += (regBody ? "<br>" : "") + "İlaç: " + dis.meds.map(function(med){ return escapeHtml(String(med)); }).join(", ");
      html += DetailBlock({ icon: "🩹", title: "Rahatsızlık & İlaç (" + disDetail.totalRegions + " bölge)", body: regBody });
    }

    if (cats.length) {
      html += DetailBlock({ icon: "🗺", title: "Konum kategorileri", body: cats.map(function(c){ return "• " + escapeHtml(c); }).join("<br>"), redacted: false });
    }

    return DetailSection({
      id: "movement",
      title: "Hareket",
      icon: "👟",
      emptyText: "Bugün için hareket veya adım kaydı yok.",
      children: html
    });
  }

  function renderLocationTimeline(date) {
    var locInfo = getLocationInfo();
    if (!locInfo || !locInfo.historyCount) return "";

    var dayHistory = [];
    if (date) {
      var dateStart = date + "T00:00:00Z";
      var dateEnd = date + "T23:59:59Z";
      locInfo.history.forEach(function(h) {
        if (h && h.ts && h.ts >= dateStart && h.ts <= dateEnd) dayHistory.push(h);
      });
    }

    var mapId = "ae-map-" + (date || "all");
    var mapData = date && dayHistory.length ? dayHistory : locInfo.history.slice(-10);
    var mapDataJson = escapeHtml(JSON.stringify(mapData));

    // Kompakt üst bilgi
    var infoHtml = '<div class="loc-info">' +
      '<span class="loc-info__item">📍 ' + (locInfo.enabled ? "Açık" : "Kapalı") + '</span>' +
      '<span class="loc-info__item">📡 ' + locInfo.mode + '</span>' +
      '<span class="loc-info__item">🗺 ' + locInfo.historyCount + ' kayıt</span>' +
      (dayHistory.length ? '<span class="loc-info__item">⏱ ' + dayHistory.length + ' güncelleme</span>' : '') +
      '</div>';

    // Harita konteyneri
    var mapHtml = '<div class="loc-map-wrap">' +
      '<div id="' + mapId + '" class="loc-map" data-points=\'' + mapDataJson + '\'></div>' +
      '</div>';

    // Kompakt zaman çizelgesi (sadece saat farkı + koordinat)
    var timelineHtml = '';
    if (dayHistory.length) {
      var items = dayHistory.map(function(h, i) {
        var t = h.ts ? new Date(h.ts) : null;
        var timeStr = t ? t.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "—";
        var latStr = typeof h.lat === 'number' ? h.lat.toFixed(4) : "—";
        var lngStr = typeof h.lng === 'number' ? h.lng.toFixed(4) : "—";
        var accStr = h.acc ? h.acc + "m" : "";
        return '<div class="loc-dot-row">' +
          '<span class="loc-dot"></span>' +
          '<span class="loc-dot__time">' + escapeHtml(timeStr) + '</span>' +
          '<span class="loc-dot__coord">' + escapeHtml(latStr + ", " + lngStr) + '</span>' +
          (accStr ? '<span class="loc-dot__acc">' + escapeHtml(accStr) + '</span>' : '') +
          '</div>';
      }).join("");
      timelineHtml = '<div class="loc-timeline-compact">' + items + '</div>';
    }

    // Ayar değişiklikleri (kompakt)
    var eventsHtml = '';
    if (locInfo.enabledAt) {
      eventsHtml += '<div class="loc-event"><span class="loc-event__icon">🔛</span><span class="loc-event__text">' + escapeHtml(formatTs(locInfo.enabledAt)) + (locInfo.enabledReason ? ' · ' + escapeHtml(locInfo.enabledReason) : '') + '</span></div>';
    }
    if (locInfo.disabledAt) {
      eventsHtml += '<div class="loc-event"><span class="loc-event__icon">🔒</span><span class="loc-event__text">' + escapeHtml(formatTs(locInfo.disabledAt)) + (locInfo.disabledReason ? ' · ' + escapeHtml(locInfo.disabledReason) : '') + '</span></div>';
    }

    return AeCard({
      variant: "summary",
      children: '<div class="loc-section">' +
        '<div class="ae-label">📍 Konum & Zaman Çizelgesi</div>' +
        infoHtml +
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
      variant: "summary",
      children: '<div class="sess-section">' +
        '<div class="ae-label">📱 Uygulama Oturumu</div>' +
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
        icon: "⏱",
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
        '<div class="ae-label">⏱ Kayıt Zamanları</div>' +
        '<div class="sess-grid">' + items + '</div></div>'
    });
  }

  function renderDayLocation(date) {
    return renderLocationTimeline(date) || DetailSection({
      id: "day-location",
      title: "Konum",
      icon: "📍",
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
    if (reading.length) chips.push(renderChip("📖 Okuma: " + reading.length, false));
    if (watching.length) chips.push(renderChip("🎬 İzleme: " + watching.length, false));
    if (listening.length) chips.push(renderChip("🎧 Dinleme: " + listening.length, false));
    if (learning.length) chips.push(renderChip("🎓 Öğrenme: " + learning.length, false));
    if (soul.length) chips.push(renderChip("🧘 Ruh-beden: " + soul.length, false));
    if (quotes.length) chips.push(renderChip("✍️ Alıntı: " + quotes.length, false));

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

    html += renderEntryList(reading, "📖", "Okuma", function(e) {
      return { title: e.title || "Kitap", meta: (e.pages ? e.pages + " sayfa" : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.author ? " · " + e.author : ""), note: e.note || "" };
    });
    html += renderEntryList(watching, "🎬", "İzleme", function(e) {
      return { title: e.title || "İzleme", meta: (e.episodes ? e.episodes + " bölüm" : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.kind ? " · " + e.kind : ""), note: e.note || "" };
    });
    html += renderEntryList(listening, "🎧", "Dinleme", function(e) {
      return { title: e.title || "Parça", meta: (e.artist ? e.artist : "") + (e.minutes ? " · " + e.minutes + " dk" : "") + (e.kind ? " · " + e.kind : ""), note: e.note || "" };
    });
    html += renderEntryList(learning, "🎓", "Öğrenme", function(e) {
      return { title: e.title || "Konu", meta: (e.minutes ? e.minutes + " dk" : "") + (e.topic ? " · " + e.topic : ""), note: e.note || "" };
    });
    if (soul.length) {
      var soulBody = soul.map(function(a) {
        return '<div class="detail-block__sub"><strong>' + escapeHtml(a.label || a.type || "Aktivite") + "</strong>" +
               (a.duration ? '<div class="detail-block__meta">' + fmtDuration(a.duration) + "</div>" : "") +
               (a.note ? '<div class="detail-block__note">' + escapeHtml(a.note) + "</div>" : "") +
               "</div>";
      }).join("");
      html += DetailBlock({ icon: "🧘", title: "Ruh-beden aktiviteleri (" + soul.length + ")", body: soulBody });
    }
    if (quotes.length) {
      var quotesBody = quotes.map(function(q) {
        return '<div class="detail-block__sub">“' + escapeHtml(q.text || "") + "”" +
               (q.source ? '<div class="detail-block__meta">— ' + escapeHtml(q.source) + "</div>" : "") +
               "</div>";
      }).join("");
      html += DetailBlock({ icon: "✍️", title: "Alıntılar (" + quotes.length + ")", body: quotesBody });
    }

    return DetailSection({
      id: "content",
      title: "İçerik",
      icon: "📖",
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
    return content ? AeDivider({ label: label }) + content : "";
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
    return '<div class="day-view ae-slide-up">' +
           renderDayDatePicker(date) +
           renderDayHeatmap(date) +
           (day ? renderDayGroup("Zamanlar", [renderDayTimestamps(date)]) : "") +
           (day ? renderDayGroup("Ruh Hali", [renderMoodTherapy(date), renderEnergyStress(date)]) : "") +
           (day ? renderDayGroup("Alışkanlıklar", [renderHabits(date), renderCraving(date), renderWindDown(date), renderMagnesium(date)]) : "") +
           (day ? renderDayGroup("Beslenme", [renderNutrition(date), renderNutri(date)]) : "") +
           (day ? renderDayGroup("İbadet", [renderPrayer(date)]) : "") +
           (day ? renderDayGroup("Hareket", [renderMovement(date)]) : "") +
           (day ? renderDayGroup("Konum", [renderDayLocation(date)]) : "") +
           (day ? renderDayGroup("Döngü", [renderCycle(date)]) : "") +
           (day ? renderDayGroup("İçerik", [renderContent(date)]) : "") +
           emptyDay +
           "</div>";
  }

  function SubTabs(opts) {
    opts = opts || {};
    var tabs = Array.isArray(opts.tabs) ? opts.tabs : [];
    var active = opts.active || (tabs[0] && tabs[0].id);
    var html = '<div class="sub-tabs" role="tablist">';
    tabs.forEach(function(t) {
      var isActive = t.id === active;
      html += '<button type="button" class="sub-tab' + (isActive ? " is-active" : "") + '" ' +
              'role="tab" aria-selected="' + (isActive ? "true" : "false") + '" ' +
              'onclick="' + escapeHtml(String(opts.onChange || "").replace(/\{id\}/g, t.id)) + '">' +
              escapeHtml(safeText(t.label, 24)) + "</button>";
    });
    html += "</div>";
    return html;
  }

  function setArchiveSubTab(id) {
    var valid = ["library", "watch", "listen", "quotes"];
    if (valid.indexOf(id) === -1) return;
    ui.subTab = id;
    render();
  }

  function setSystemSubTab(id) {
    var valid = ["status", "audit", "messages", "settings"];
    if (valid.indexOf(id) === -1) return;
    ui.systemSubTab = id;
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

  function setPanelToken(token) {
    ui.panelToken = normalizeToken(token);
    if (ui.panelToken) setLocalToken(ui.panelToken);
    render();
    return true;
  }

  function formatTs(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toLocaleString("tr-TR");
  }

  function renderStatusDetail() {
    var s = syncStatus || {};
    var dayCount = isObject(appData) && isObject(appData.days) ? Object.keys(appData.days).length : 0;
    var rows = [
      { label: "Durum", value: s.status || "idle" },
      { label: "Son senkron", value: s.lastSyncedAt ? formatTs(s.lastSyncedAt) : "—" },
      { label: "Gün sayısı", value: dayCount },
      { label: "Revision", value: s.snapshotRevision || "—" },
      { label: "ETag", value: s.etag || "—" },
      { label: "p50 gecikme", value: s.p50LatencyMs ? s.p50LatencyMs + " ms" : "—" },
      { label: "p95 gecikme", value: s.p95LatencyMs ? s.p95LatencyMs + " ms" : "—" },
      { label: "304 sayısı", value: s.notModifiedCount !== undefined ? s.notModifiedCount : "—" }
    ];
    var body = rows.map(function(r) {
      return '<div class="status-row"><span class="status-row__label">' + escapeHtml(r.label) +
             '</span><span class="status-row__value">' + escapeHtml(String(r.value)) + "</span></div>";
    }).join("");
    var errorBox = s.lastErrorCode
      ? '<div class="ae-card ae-card--solid ae-card--warn status-error">' +
        '<div class="status-error__title">Son hata</div>' +
        '<div class="status-error__code">' + escapeHtml(String(s.lastErrorCode)) + "</div>" +
        '<div class="status-error__hint">Tekrar denemek için ↻ butonuna bas.</div>' +
        "</div>"
      : "";
    return '<div class="status-detail ae-slide-up">' +
           AeCard({ className: "status-card", children: body }) +
           renderAppSessionInfo() +
           errorBox +
           "</div>";
  }

  function renderAuditDetail() {
    var proj = projectData(appData);
    var coverage = proj && proj.coverage ? proj.coverage : {};
    var redacted = Array.isArray(coverage.redacted) ? coverage.redacted.length : 0;
    var summary = Array.isArray(coverage.summary) ? coverage.summary.length : 0;
    var full = Array.isArray(coverage.full) ? coverage.full.length : 0;
    var rows = [
      { label: "Coverage durumu", value: (coverage.error ? "Hata" : "Hazır") },
      { label: "Redacted alan", value: redacted },
      { label: "Summary alan", value: summary },
      { label: "Full alan", value: full },
      { label: "Provenance", value: "observer-snapshot" },
      { label: "Polling", value: syncStatus.etag ? "ETag aktif" : "Bekliyor" },
      { label: "Son log", value: Array.isArray(coverage.unmappedPaths) && coverage.unmappedPaths.length ? coverage.unmappedPaths.slice(0, 3).join(", ") : "—" }
    ];
    var body = rows.map(function(r) {
      return '<div class="status-row"><span class="status-row__label">' + escapeHtml(r.label) +
             '</span><span class="status-row__value">' + escapeHtml(String(r.value)) + "</span></div>";
    }).join("");
    return '<div class="audit-detail ae-slide-up">' +
           AeCard({ className: "audit-card", children: body }) +
           '<div class="audit-hint">Yalnızca izin verilen alanlar observer\'a yansıtılır. Detaylar panelCoverageManifest.js\'te tanımlı.</div>' +
           "</div>";
  }

  function renderMessages() {
    var root = isObject(appData) ? appData : {};
    var notifications = Array.isArray(root.notifications) ? root.notifications : [];
    var qa = (root.aeon && Array.isArray(root.aeon.qa)) ? root.aeon.qa : [];

    function makeNotif(n) {
      return { direction: "in", from: n.from || "Observer", kind: n.kind || "notification", text: n.text || n.body || "", title: n.title || "", ts: n.ts || n.createdAt || n.inboxAt || "", readAt: n.readAt, synced: !!n.synced };
    }
    function makeQA(q) {
      var out = [];
      if (q.question) out.push({ direction: "out", from: "Sen", kind: "aeon_ask", text: String(q.question), ts: q.ts || q.askedAt || "", readAt: null, synced: true });
      if (q.answer) out.push({ direction: "in", from: "Observer", kind: "aeon_answer", text: String(q.answer), ts: q.answeredAt || q.answerReceivedAt || q.ts || "", readAt: q.answerReadAt, synced: !!q.answerSynced });
      return out;
    }

    var messages = notifications.map(makeNotif);
    qa.forEach(function(q) { messages = messages.concat(makeQA(q)); });
    messages.sort(function(a, b) { return String(b.ts || "").localeCompare(String(a.ts || "")); });

    var list = messages.length
      ? messages.map(function(m) {
          var status = "";
          if (m.kind === "aeon_answer" && !m.readAt) status = " · okunmamış";
          else if (m.readAt) status = " · okundu";
          else if (m.synced) status = " · sync";
          return '<div class="message-bubble message-bubble--' + m.direction + '">' +
                 '<div class="message-bubble__meta">' + escapeHtml(m.from) + " · " + escapeHtml(formatTs(m.ts)) + " · " + escapeHtml(m.kind || "mesaj") + status + "</div>" +
                 (m.title ? '<div class="message-bubble__title">' + escapeHtml(safeText(m.title, 120)) + "</div>" : "") +
                 '<div class="message-bubble__text">' + nl2br(escapeHtml(safeText(m.text, 1200))) + "</div>" +
                 "</div>";
        }).join("")
      : AeEmpty({ icon: "💬", title: "Henüz mesaj yok", message: "Gelen ve giden mesajlar burada listelenecek." });

    var tokenValue = (ui.panelToken || "").replace(/./g, "•");
    var saveBtn = ui.panelToken
      ? AeButton({ label: "↻ Şimdi senkronize et", variant: "primary", onclick: "AeonV2.refresh()", ariaLabel: "Şimdi senkronize et" })
      : "";
    return '<div class="messages-detail ae-slide-up">' +
           AeCard({ className: "messages-card", children: list }) +
           '<div class="ae-card ae-card--solid ae-card--summary token-card">' +
           '<div class="ae-label">GitHub token</div>' +
           '<input type="password" class="token-input" id="ae-token-input" value="' + escapeHtml(tokenValue) + '" placeholder="github_pat_..." onchange="AeonV2.savePanelToken(this.value)" />' +
           '<div class="token-hint">Token yalnızca bu tarayıcıda kalır; DOM\'da veya test çıktısında asla açık görünmez. Değiştirip dışarıya tıkladığında kaydedilir.</div>' +
           saveBtn +
           "</div>" +
           "</div>";
  }

  function renderSettings() {
    var densities = [
      { id: "compact", label: "Sıkı" },
      { id: "comfortable", label: "Rahat" },
      { id: "spacious", label: "Geniş" }
    ];
    var densityButtons = densities.map(function(d) {
      var active = ui.density === d.id ? " is-active" : "";
      return '<button type="button" class="density-btn' + active + '" onclick="AeonV2.setDensity(\'' + d.id + '\')">' + escapeHtml(d.label) + "</button>";
    }).join("");

    var themeBtn = ui.theme === "dark"
      ? AeButton({ label: "☀️ Aydınlık temaya geç", variant: "secondary", onclick: "AeonV2.setTheme(\'light\')" })
      : AeButton({ label: "🌙 Koyu temaya geç", variant: "secondary", onclick: "AeonV2.setTheme(\'dark\')" });

    return '<div class="settings-detail ae-slide-up">' +
           AeCard({
             className: "settings-card",
             children: '<div class="settings-group">' +
                       '<div class="ae-label">Yoğunluk</div>' +
                       '<div class="density-select">' + densityButtons + "</div>" +
                       "</div>" +
                       '<div class="settings-group">' +
                       '<div class="ae-label">Tema</div>' + themeBtn + "</div>" +
                       '<div class="settings-group">' +
                       '<div class="ae-label">Oturum</div>' +
                       AeButton({ label: "Oturumu sonlandır", variant: "drop", onclick: "AeonV2.logout()" }) +
                       "</div>"
           }) +
           "</div>";
  }

  function renderSystem() {
    var subTab = ui.systemSubTab || "status";
    var tabs = [
      { id: "status", label: "Durum" },
      { id: "audit", label: "Audit" },
      { id: "messages", label: "Mesajlar" },
      { id: "settings", label: "Ayarlar" }
    ];
    var contentBySubTab = {
      status: renderStatusDetail,
      audit: renderAuditDetail,
      messages: renderMessages,
      settings: renderSettings
    };
    var renderFn = contentBySubTab[subTab] || renderStatusDetail;
    return '<div class="system-view ae-slide-up">' +
           SubTabs({ tabs: tabs, active: subTab, onChange: "AeonV2.setSystemSubTab(\'{id}\')" }) +
           '<div class="system-panel">' + renderFn() + "</div></div>";
  }

  function getArchiveLibrary() {
    var root = isObject(appData) ? appData : {};
    var library = isObject(root.library) ? root.library : {};
    var books = Array.isArray(library.books) ? library.books : [];
    var byId = {};
    books.forEach(function(b) { if (b && b.id) byId[b.id] = b; });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var reading = (days[date].reading || {}).entries;
      if (!Array.isArray(reading)) return;
      reading.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.bookId && byId[e.bookId]) {
          var b = byId[e.bookId];
          b._lastRead = date;
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
            byId[key]._lastRead = date;
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
    items.forEach(function(i) { if (i && i.id) byId[i.id] = i; });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var watching = (days[date].watching || {}).entries;
      if (!Array.isArray(watching)) return;
      watching.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.itemId && byId[e.itemId]) {
          var it = byId[e.itemId];
          it._lastWatch = date;
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
            byId[key]._lastWatch = date;
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
    items.forEach(function(i) { if (i && i.id) byId[i.id] = i; });

    var days = isObject(root.days) ? root.days : {};
    Object.keys(days).forEach(function(date) {
      var listening = (days[date].listening || {}).entries;
      if (!Array.isArray(listening)) return;
      listening.forEach(function(e) {
        if (!e || !e.title) return;
        if (e.itemId && byId[e.itemId]) {
          var it = byId[e.itemId];
          it._lastListen = date;
          it._dailyMinutes = (it._dailyMinutes || 0) + (safeNumber(e.minutes) || 0);
        } else {
          var key = "daily:" + (e.id || e.title);
          if (!byId[key]) {
            byId[key] = {
              id: key, title: e.title, artist: e.artist || "", kind: e.kind || "sarki",
              source: "daily", _lastListen: date, _dailyMinutes: safeNumber(e.minutes) || 0
            };
          } else {
            byId[key]._lastListen = date;
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

  function renderPagination(state, onClickPrefix) {
    if (state.totalPages <= 1) return "";
    var buttons = "";
    if (state.hasPrev) {
      buttons += AeButton({
        label: "◀",
        variant: "mini",
        onclick: onClickPrefix + "(" + (state.page - 1) + ")",
        ariaLabel: "Önceki sayfa"
      });
    }
    buttons += '<span class="pagination__info">' + state.page + " / " + state.totalPages + "</span>";
    if (state.hasNext) {
      buttons += AeButton({
        label: "▶",
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

  function ArchiveRow(opts) {
    opts = opts || {};
    return '<div class="archive-row">' +
           '<div class="archive-row__main">' +
           (opts.icon ? '<span class="archive-row__icon" aria-hidden="true">' + escapeHtml(opts.icon) + "</span>" : "") +
           '<div class="archive-row__body">' +
           '<div class="archive-row__title">' + escapeHtml(safeText(opts.title, 80)) + "</div>" +
           (opts.meta ? '<div class="archive-row__meta">' + escapeHtml(safeText(opts.meta, 120)) + "</div>" : "") +
           "</div></div>" +
           (opts.badge ? '<span class="ae-chip">' + escapeHtml(opts.badge) + "</span>" : "") +
           "</div>";
  }

  function renderArchiveLibrary(page) {
    var items = getArchiveLibrary();
    var state = paginate(items, page || ui.archivePage || 1, ARCHIVE_PAGE_SIZE);
    if (!state.items.length) {
      return AeEmpty({ icon: "📚", title: "Kütüphane boş", message: "Henüz kitap veya okuma kaydı yok." });
    }
    var rows = state.items.map(function(b) {
      var progress = "";
      if (safeNumber(b.totalPages) > 0 && safeNumber(b.currentPage) >= 0) {
        progress = b.currentPage + "/" + b.totalPages + " sayfa";
      } else if (b._dailyPages) {
        progress = b._dailyPages + " sayfa günlük";
      }
      var meta = [b.author, b._lastRead ? "Son: " + formatDateLabel(b._lastRead) : "", progress].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: b.emoji || "📖",
        title: b.title,
        meta: meta,
        badge: { reading: "Okunuyor", finished: "Bitti", dropped: "Bırakıldı" }[b.status] || "Kayıtlı"
      });
    }).join("");
    return '<div class="archive-list ae-slide-up">' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveWatch(page) {
    var items = getArchiveWatch();
    var state = paginate(items, page || ui.archivePage || 1, ARCHIVE_PAGE_SIZE);
    if (!state.items.length) {
      return AeEmpty({ icon: "🎬", title: "İzleme listesi boş", message: "Henüz film/dizi veya izleme kaydı yok." });
    }
    var rows = state.items.map(function(it) {
      var progress = "";
      if (safeNumber(it.totalEp) > 0) {
        progress = (it.watchedEp || 0) + "/" + it.totalEp + " bölüm";
      } else if (it._dailyEps) {
        progress = it._dailyEps + " bölüm günlük";
      }
      if (it._dailyMinutes) progress += (progress ? " · " : "") + it._dailyMinutes + " dk";
      var meta = [it.kind === "dizi" ? "Dizi" : "Film", it._lastWatch ? "Son: " + formatDateLabel(it._lastWatch) : "", progress].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: it.emoji || (it.kind === "dizi" ? "📺" : "🎞"),
        title: it.title,
        meta: meta,
        badge: { watching: "İzleniyor", finished: "Bitti", dropped: "Bırakıldı" }[it.status] || "Kayıtlı"
      });
    }).join("");
    return '<div class="archive-list ae-slide-up">' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveListen(page) {
    var items = getArchiveListen();
    var state = paginate(items, page || ui.archivePage || 1, ARCHIVE_PAGE_SIZE);
    if (!state.items.length) {
      return AeEmpty({ icon: "🎧", title: "Dinleme listesi boş", message: "Henüz müzik/podcast veya dinleme kaydı yok." });
    }
    var rows = state.items.map(function(it) {
      var kindLabel = { sarki: "Şarkı", album: "Albüm", podcast: "Podcast" }[it.kind] || it.kind || "Müzik";
      var meta = [it.artist, it._lastListen ? "Son: " + formatDateLabel(it._lastListen) : "", it._dailyMinutes ? it._dailyMinutes + " dk" : ""].filter(Boolean).join(" · ");
      return ArchiveRow({
        icon: it.emoji || (it.kind === "podcast" ? "🎙" : "🎵"),
        title: it.title,
        meta: meta,
        badge: kindLabel
      });
    }).join("");
    return '<div class="archive-list ae-slide-up">' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
  }

  function renderArchiveQuotes(page) {
    var items = getArchiveQuotes();
    var state = paginate(items, page || ui.archivePage || 1, ARCHIVE_PAGE_SIZE);
    if (!state.items.length) {
      return AeEmpty({ icon: "✍️", title: "Alıntı yok", message: "Henüz kitap, film/dizi veya müzik alıntısı yok." });
    }
    var rows = state.items.map(function(q) {
      return '<div class="archive-row archive-row--quote">' +
             '<div class="archive-row__body">' +
             '<div class="archive-row__title">“' + escapeHtml(safeText(q.text, 160)) + '”</div>' +
             '<div class="archive-row__meta">' + escapeHtml(safeText(q.source + (q.title ? " · " + q.title : ""), 80)) + "</div>" +
             "</div></div>";
    }).join("");
    return '<div class="archive-list ae-slide-up">' + rows + renderPagination(state, "AeonV2.setArchivePage") + "</div>";
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
    return '<div class="archives-view ae-slide-up">' +
           SubTabs({ tabs: tabs, active: subTab, onChange: "AeonV2.setArchiveSubTab(\'{id}\')" }) +
           '<div class="archive-panel">' + renderFn() + "</div>" +
           "</div>";
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
    return '<div class="ae-panel ae-slide-up" id="ae-panel-' + ui.tab + '" role="tabpanel" aria-labelledby="ae-tab-' + ui.tab + '">' +
           fn() +
           "</div>";
  }

  // ── Main render ────────────────────────────────────────────────────────
  function render() {
    var app = root.document && root.document.getElementById("app");
    if (!app) return;
    var projection = projectData(null);
    var activeContent = isFetching ? renderLoadingState() : renderActiveTab();
    app.innerHTML =
      renderTopbar() +
      renderTabs() +
      '<main class="ae-app__body">' + activeContent + "</main>" +
      renderToastHost() +
      '<div class="ae-projection-meta" id="ae-projection-meta" data-day-count="' + projection.dayCount + '"></div>';

    runCountUps();

    // Leaflet haritaları başlat (bir sonraki tick'te DOM hazır olur)
    setTimeout(initMaps, 50);
  }

  function initMaps() {
    if (typeof root.L === "undefined") return;
    var containers = root.document.querySelectorAll(".loc-map");
    containers.forEach(function(el) {
      if (el._leaflet_map) return;
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
        root.L.circleMarker([p.lat, p.lng], {
          radius: i === points.length - 1 ? 8 : 5,
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2
        }).addTo(map).bindPopup("<strong>" + escapeHtml(ts) + "</strong><br>" +
          p.lat.toFixed(4) + ", " + p.lng.toFixed(4) + acc);
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
    });
  }

  function setTab(id) {
    if (!id || !TABS.some(function(t) { return t.id === id; })) return;
    ui.tab = id;
    render();
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
    return root.fetch(api, { headers: H, cache: "no-store" }).then(function(r) {
      var etag = responseHeader(r, "ETag");
      if (r.status === 401 || r.status === 403) throw new Error("Token gecersiz veya yetkisiz.");
      if (r.status === 404) {
        var e = new Error("data/latest.json bulunamadi.");
        e.notFound = true;
        throw e;
      }
      if (r.status === 304) {
        syncStatus.status = "accepted";
        syncStatus.lastSyncedAt = new Date().toISOString();
        syncStatus.notModifiedCount = (syncStatus.notModifiedCount || 0) + 1;
        render();
        return { notModified: true, meta: { etag: etag, completedAt: syncStatus.lastSyncedAt } };
      }
      if (!r.ok) throw new Error("Sunucu hatasi: " + r.status);
      return r.json().then(function(data) {
        syncStatus.etag = etag;
        syncStatus.snapshotRevision = (data && data.syncReceipt && data.syncReceipt.snapshotRevision) || null;
        syncStatus.sourceUpdatedAt = (data && data.syncReceipt && data.syncReceipt.sourceUpdatedAt) || null;
        syncStatus.status = "accepted";
        syncStatus.lastErrorCode = null;
        syncStatus.lastSyncedAt = new Date().toISOString();
        appData = data;
        render();
        return { notModified: false, data: data, meta: { etag: etag, completedAt: syncStatus.lastSyncedAt } };
      });
    });
  }

  function load() {
    if (isFetching) return Promise.resolve(null);
    ui.panelToken = normalizeToken(ui.panelToken || getLocalToken());
    if (!ui.panelToken) {
      syncStatus.status = "idle";
      syncStatus.lastErrorCode = "no_token";
      render();
      return Promise.resolve(null);
    }
    isFetching = true;
    syncStatus.status = "saving";
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
      .then(function(res) {
        isFetching = false;
        render();
        if (res && res.notModified) return appData;
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
    return load();
  }

  function logout() {
    removeLocalToken();
    ui.panelToken = "";
    syncStatus.status = "idle";
    syncStatus.lastErrorCode = null;
    syncStatus.etag = null;
    syncStatus.snapshotRevision = null;
    syncStatus.sourceUpdatedAt = null;
    syncStatus.lastSyncedAt = null;
    appData = null;
    ui.tab = "today";
    ui.subTab = null;
    render();
  }

  function updateStatus(s) {
    if (s && typeof s === "object") syncStatus = s;
    render();
  }

  function init() {
    var rootEl = root.document && root.document.getElementById("root");
    if (rootEl && ui.theme) rootEl.setAttribute("data-theme", ui.theme);
    ui.panelToken = normalizeToken(ui.panelToken || getLocalToken());
    render();
    if (ui.panelToken) load();
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
    setArchiveSubTab: setArchiveSubTab,
    setSystemSubTab: setSystemSubTab,
    setArchivePage: setArchivePage,
    setDensity: setDensity,
    setTheme: setTheme,
    setPanelToken: setPanelToken,
    savePanelToken: setPanelToken,
    load: load,
    fetchLatest: fetchLatest,
    refresh: refresh,
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
    getAppSessionInfo: getAppSessionInfo,
    getDaySavedAt: getDaySavedAt,
    SummaryCard: SummaryCard,
    AnomalyCard: AnomalyCard,
    DetailSection: DetailSection,
    DetailBlock: DetailBlock,
    AeSparkline: AeSparkline
  };
})(typeof window !== "undefined" ? window : this);
