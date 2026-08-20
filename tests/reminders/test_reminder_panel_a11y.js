"use strict";

// REM-65 — current ÆON panel responsive + accessibility contract.
// Browser, ağ, token, localStorage ve gerçek kullanıcı verisi yoktur. Panel-v2
// bu fixture'ın kapsamı dışındadır; ayrı Panel-v2 fixture'ları ayrıca çalışır.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
const PANEL_CSS = fs.readFileSync(path.join(ROOT, "panel.css"), "utf8");
const PANEL_HTML = fs.readFileSync(path.join(ROOT, "panel.html"), "utf8");

function extractTopLevelFunction(name) {
  const start = PANEL_SOURCE.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = PANEL_SOURCE.indexOf("\nfunction ", start + 10);
  return PANEL_SOURCE.slice(start, end < 0 ? PANEL_SOURCE.length : end).trim();
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function loadPanelHelpers(names, extra) {
  const context = Object.assign({
    Date, Math, String, Number, Boolean, Object, Array, JSON, RegExp,
    isNaN, isFinite, esc, UI: { expandedCards: {} },
    icon: () => "", document: { getElementById: () => null }
  }, extra || {});
  vm.runInNewContext(names.map(extractTopLevelFunction).join("\n"), context, {
    filename: "rem-65-panel-a11y.js"
  });
  return context;
}

function statusBadgeHTML(label) {
  return '<span class="status-badge status-ok" data-component="status-badge">' + esc(label) + "</span>";
}

const cases = [
  ["current panel keeps the six requested viewport contracts and excludes Panel-v2", () => {
    const widths = [375, 390, 430, 768, 1280, 1440];
    widths.forEach((width) => {
      if (width <= 480) assert(PANEL_CSS.includes("@media(max-width:480px)"));
      else if (width <= 768) assert(PANEL_CSS.includes("@media(max-width:768px)"));
      else if (width < 1200) assert(PANEL_CSS.includes("@media(min-width:769px) and (max-width:1199px)"));
      else assert(PANEL_CSS.includes("@media(min-width:1200px)"));
    });
    assert(PANEL_CSS.includes(".d2-hero-grid,.d4-module-grid{grid-template-columns:1fr}"));
    assert(PANEL_CSS.includes(".d2-hero-grid,.d4-module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}"));
    assert(PANEL_CSS.includes(".bento{grid-template-columns:repeat(12,minmax(0,1fr));max-width:1280px}"));
    assert(!PANEL_HTML.includes("panel-v2") && !PANEL_SOURCE.includes("panel-v2"));
  }],
  ["light/dark system themes, high contrast and focus appearance remain tokenized", () => {
    assert(PANEL_CSS.includes("@media (prefers-color-scheme:light)"));
    assert(PANEL_CSS.includes("--bg:#f7f4ee") && PANEL_CSS.includes("--bg:#070709"));
    assert(PANEL_CSS.includes("@media(prefers-contrast:more)"));
    assert(PANEL_CSS.includes("--focus-ring:0 0 0 4px #fff"));
    assert(PANEL_CSS.includes("button:focus-visible"));
    assert(PANEL_CSS.includes("--touch-min:44px"));
    assert(PANEL_CSS.includes("@media(prefers-reduced-motion:reduce)"));
    assert(PANEL_CSS.includes("animation-duration:.01ms!important"));
    assert(PANEL_CSS.includes("scroll-behavior:auto!important"));
  }],
  ["accordion title and key stay safe across text and inline-handler contexts", () => {
    const ctx = loadPanelHelpers(["cardWrap"], {
      UI: { expandedCards: {} }, localStorage: { setItem() {} }
    });
    const html = ctx.cardWrap({
      key: "kart-'\"</script>",
      title: "<img src=x onerror=alert(1)> · Uzun Türkçe başlık ıİğĞşŞçÇ",
      summary: "Güvenli özet",
      details: "Ayrıntı"
    });
    assert(html.includes('type="button"'));
    assert(html.includes('aria-expanded="false"') && html.includes('aria-hidden="true"'));
    assert(html.includes("&lt;img") && !html.includes("<img src=x"));
    assert(PANEL_SOURCE.includes("var keyArg=String(key==null?'':key)"));
  }],
  ["status surface has a named live claim and remains safe with long Turkish copy", () => {
    const ctx = loadPanelHelpers(["reminderStatusCardHTMLP"], {
      panelStatusBadgeHTMLP: statusBadgeHTML,
      reminderSourceStatusP: () => ({ tone: "accepted", label: "Kaynak", text: "Çok uzun kaynak açıklaması · ".repeat(8), cls: "b-ok" }),
      reminderReceiptStatusP: () => ({ tone: "accepted", label: "Receipt", text: "Kabul edildi", cls: "b-ok" }),
      reminderCapabilityStatusP: () => ({ tone: "ok", label: "Capability", text: "Sözleşme", cls: "b-ok" }),
      reminderPrivacyStatusP: () => ({ tone: "ok", label: "Privacy", text: "Yerel/redacted", cls: "b-ok" }),
      reminderDeviceAcceptanceStatusP: () => ({ tone: "pending", label: "Cihaz", text: "S5 bekliyor", cls: "b-warn" }),
      reminderWorkingClaimP: () => ({ ok: false, reason: "receipt_kanıtı_yok" }),
      normalizeSyncReceiptP: () => ({ acceptedAt: null }),
      p3TimeP: () => "—", tsShort: () => "—"
    });
    const html = ctx.reminderStatusCardHTMLP(null, null, { snapshot: null }, {});
    assert(html.includes('data-component="reminder-status-card"'));
    ["source", "receipt", "capability", "privacy", "device"].forEach((dim) => {
      assert(html.includes('data-reminder-dim="' + dim + '"'));
    });
    assert(html.includes('role="status" aria-live="polite"'));
    assert(html.includes("Çok uzun kaynak açıklaması"));
    assert(PANEL_CSS.includes(".reminder-status-head-note{min-width:0;overflow-wrap:anywhere"));
  }],
  ["timeline output is named, keyboard-safe and wraps long event copy", () => {
    const ctx = loadPanelHelpers(["jsArgP", "eventLogCardInnerHTMLP", "eventLogCardHTMLP"], {
      UI: { eventLimit: 5, eventFilter: "all" },
      EVENT_LOG_STATE: {
        source: "event_files", loadedAt: "2026-08-20T10:00:00.000Z",
        audit: { ok: true, issueCount: 0 },
        events: [{ eventId: "evt-a11y", correlationId: "evt-a11y", sequence: 1, occurredAt: "2026-08-20T10:00:00.000Z" }]
      },
      eventLogSourceP: () => ({ label: "Günlük event dosyaları", cls: "b-ok", note: "Kaynak hazır" }),
      eventCategoryDefsP: () => [["all", "Tümü", "Tüm kayıtlar"]],
      eventMatchesFilterP: () => true,
      eventStatusP: () => ({ label: "Hazır", cls: "b-ok" }),
      eventSourceKindForP: () => ({ kind: "observer", label: "Observer" }),
      eventFeatureForP: () => ({ icon: "activity", label: "Reminder" }),
      eventClassificationP: () => ({ key: "reminder", label: "Reminder" }),
      eventChangeDescriptorP: () => ({ title: "Çok uzun ve güvenli Türkçe event özeti · ".repeat(5) }),
      eventTimeP: () => "10:00",
      eventDateStateP: () => ({ key: "normal", label: "" }),
      isReminderEventP: () => false,
      reminderEventActionP: () => "",
      safeEventSummaryP: () => "Güvenli özet",
      panelLegacyBadgeHTMLP: statusBadgeHTML,
      tsShort: () => "10:00"
    });
    const html = ctx.eventLogCardHTMLP();
    assert(html.includes('role="region" aria-label="Son değişiklikler"'));
    assert(html.includes('role="group" aria-label="Son değişiklik filtresi"'));
    assert(html.includes('role="group" aria-label="Event sayısı filtresi"'));
    assert(html.includes('aria-live="polite"'));
    assert(html.includes('type="button"'));
    assert(html.includes("Çok uzun ve güvenli Türkçe event özeti"));
    assert(PANEL_CSS.includes(".event-log-main b{font-size:var(--f3);overflow-wrap:anywhere;white-space:normal}"));
    assert(PANEL_CSS.includes(".timeline-chain-row span:nth-child(2){overflow-wrap:anywhere;white-space:normal"));
  }],
  ["drawer semantics, Escape, focus return and filename/title escaping are explicit", () => {
    const ctx = loadPanelHelpers(["d4ModuleDrawerHTMLP"], {
      p3StatusP: () => statusBadgeHTML("Durum"),
      p3BadgeP: (value, kind) => '<span data-badge="' + esc(kind) + '">' + esc(value) + "</span>",
      d4CoverageBadgeP: () => '<span>Redacted</span>'
    });
    const html = ctx.d4ModuleDrawerHTMLP({
      title: "<svg/onload=alert(1)>",
      decision: "Uzun karar açıklaması",
      status: "redacted", source: "summary", privacy: "local",
      coverage: "redacted", summary: "Özet", rows: [["Dosya adı", "rapor.pdf"]],
      canonical: "1", crossCheck: "2", time: "—", note: "Not"
    });
    assert(html.includes('role="dialog" aria-modal="true"'));
    assert(html.includes('aria-labelledby="d4-drawer-title"') && html.includes('aria-describedby="d4-drawer-desc"'));
    assert(html.includes('tabindex="-1"') && html.includes('onkeydown="eventDrawerKeydownP(event)"'));
    assert(html.includes('type="button"') && html.includes('aria-label='));
    assert(html.includes("&lt;svg/onload=alert(1)&gt;") && !html.includes("<svg/onload"));
    assert(PANEL_SOURCE.includes("function eventDrawerFocusableP"));
    assert(PANEL_SOURCE.includes("if(ev.key==='Escape')"));
    assert(PANEL_SOURCE.includes("D4_DRAWER_RETURN_ID"));
    assert(PANEL_SOURCE.includes("esc(jsArgP(String(f.name||\"tahlil.pdf\")))"));
  }],
  ["panel shell exposes current asset cache busts and no positive keyboard tabindex", () => {
    assert(/name="viewport"[^>]*viewport-fit=cover/.test(PANEL_HTML));
    assert(/panel\.css\?v=20260820c/.test(PANEL_HTML));
    assert(/panel\.js\?v=20260820b/.test(PANEL_HTML));
    assert(!/tabindex=["'][1-9]/.test(PANEL_SOURCE));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
