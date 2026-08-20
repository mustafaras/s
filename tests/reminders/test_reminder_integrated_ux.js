"use strict";

// REM-71 / G14-E — Integrated UX, accessibility ve visual acceptance.
//
// Reminder app (Şeyma mobile) and current ÆON observer panel render the same
// data with different privacy / density / operator context. This fixture
// compares those two surfaces in one deterministic, synthetic harness:
//  1. App mobile light/dark vs panel responsive light/dark / density states.
//  2. App user copy vs panel operator copy never share private detail.
//  3. Focus, keyboard, screen reader, live region, reduced motion, long
//     Turkish text, empty / stale / error / redacted states on both surfaces.
//  4. App action -> panel status visual state transition measured by
//     deterministic markup / style assertion.
//  5. Premium branding preserved while status severity, privacy and
//     capability text stay visible.
//
// Panel-v2 is intentionally out of scope (separate fixture / evidence).
// No browser, network, token, real localStorage, notification body or
// external write is used.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const APP_CSS = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const APP_SOURCE = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const PANEL_CSS = fs.readFileSync(path.join(ROOT, "panel.css"), "utf8");
const PANEL_SOURCE = fs.readFileSync(path.join(ROOT, "panel.js"), "utf8");
const NOW = "2026-08-20T10:00:00.000Z";
const PRIVATE = "REM71_PRIVATE_THERAPY_NOTE_MED_MOOD_PRAYER_JOURNAL";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function failIfLeaks(surface, value, forbidden) {
  const serialized = JSON.stringify(value == null ? "" : value);
  (forbidden || []).forEach((needle) => assert(!serialized.includes(needle), `surface=${surface} leak=${needle}`));
}

function fixtureElement(id, documentRef, options) {
  const attrs = {};
  const classes = new Set();
  const opts = options || {};
  const element = {
    id: id || "", tagName: String(opts.tagName || "DIV").toUpperCase(), type: opts.type || "",
    _html: "", _text: "", style: { cssText: "", overflow: "", overscrollBehavior: "", setProperty() {} },
    classList: {
      add(...tokens) { tokens.forEach((token) => classes.add(token)); },
      remove(...tokens) { tokens.forEach((token) => classes.delete(token)); },
      toggle(token, force) { if (force === true || (force !== false && !classes.has(token))) classes.add(token); else classes.delete(token); return classes.has(token); },
      contains(token) { return classes.has(token); }
    },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 390, clientHeight: 600, scrollHeight: 1800,
    value: opts.value || "", files: [], parentNode: null, firstChild: null, firstElementChild: null,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; },
    set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); this[name] = String(value); },
    getAttribute(name) { return attrs[name] || null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter((item) => item !== child); child.parentNode = null; },
    remove() { if (this.parentNode && this.parentNode.removeChild) this.parentNode.removeChild(this); },
    replaceWith(next) { if (this.parentNode && this.parentNode.replaceChild) this.parentNode.replaceChild(next, this); },
    insertBefore(child) { return this.appendChild(child); },
    replaceChild(next, old) {
      const index = this.children.indexOf(old);
      if (index >= 0) this.children[index] = next; else this.children.push(next);
      next.parentNode = this;
      old.parentNode = null;
      return old;
    },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { if (documentRef) documentRef.activeElement = this; },
    blur() { if (documentRef && documentRef.activeElement === this) documentRef.activeElement = null; },
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
  return element;
}

function baseState() {
  return {
    version: 2,
    startDate: "2026-08-20",
    lastOpenedDate: "2026-08-20",
    days: {},
    notifications: [],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: {
      schemaVersion: 1,
      preferences: {
        "reminder.catalog.v1.therapy": {
          reminderId: "reminder.catalog.v1.therapy",
          enabled: true,
          channel: "in_app",
          privacyMode: "private",
          userNote: PRIVATE,
          therapyText: PRIVATE
        }
      },
      medications: []
    },
    settings: {
      nickname: "REM-71 UX fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: false, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function bootApp(options) {
  const opts = options || {};
  const registry = {};
  let documentRef;
  let appPaints = 0;
  function register(element) { if (element && element.id) registry[element.id] = element; return element; }
  function collectIds(html) {
    const pattern = /\bid=["']([^"']+)["']/gu;
    let match;
    while ((match = pattern.exec(String(html)))) register(fixtureElement(match[1], documentRef));
  }
  const app = register(fixtureElement("app", null));
  Object.defineProperty(app, "innerHTML", {
    configurable: true,
    get() { return app._html; },
    set(value) { app._html = String(value); appPaints += 1; collectIds(app._html); }
  });
  const root = register(fixtureElement("root", null));
  root.setAttribute("data-theme", "light");
  const body = register(fixtureElement("body", null));
  const store = { "seyma-reset-v1": JSON.stringify(baseState()) };
  if (opts.dark) store["seyma-theme"] = "dark";
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const document = {
    hidden: false, activeElement: null, body, documentElement: root,
    getElementById(id) { return registry[id] || null; },
    querySelector(selector) { if (selector === "[data-scroll]") return fixtureElement("fixture-main-scroll", documentRef); return null; },
    querySelectorAll() { return []; },
    createElement() { return fixtureElement("", documentRef); },
    createDocumentFragment() { return fixtureElement("", documentRef); },
    addEventListener() {}, removeEventListener() {}
  };
  documentRef = document;
  document.__register = register;
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body", documentRef), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: {
      vibrate() {}, userAgent: "rem-71-ux-fixture",
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} }
    },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: opts.reducedMotion === true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-71-ux-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-71"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise,
    Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"]
    .forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  sandbox.App.requestLocationGatePermission();
  return { sandbox, app, root, body, document, registry, getPaints: () => appPaints, store };
}

function extractTopLevelFunction(source, name) {
  const start = source.indexOf("function " + name + "(");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  const end = source.indexOf("\nfunction ", start + 10);
  return source.slice(start, end < 0 ? source.length : end).trim();
}

function extractBalancedVar(source, name) {
  const start = source.indexOf("var " + name + "=");
  if (start < 0) throw new Error(name + " panel.js içinde bulunamadı");
  let depth = 0;
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const c = source[index];
    if (quote) {
      if (c === "\\") index += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === "{") depth += 1;
    if (c === "}" && --depth === 0) return source.slice(start, index + 1).trim();
  }
  throw new Error(name + " balanced değil");
}

function loadPanelContext() {
  const names = [
    "reminderStatusToneMapP", "reminderSystemStatusP", "reminderReceiptStatusP",
    "reminderCapabilityStatusP", "reminderSourceStatusP", "reminderPrivacyStatusP",
    "reminderDeviceAcceptanceStatusP", "reminderWorkingClaimP", "reminderStatusCardHTMLP",
    "normalizeSyncReceiptP", "syncReceiptEvidenceP", "syncStatusP", "panelStatusBadgeHTMLP",
    "panelLegacyBadgeHTMLP"
  ];
  const context = {
    Date, Math, String, Number, Boolean, Object, Array, JSON, isNaN, isFinite, RegExp,
    esc,
    icon() { return ""; },
    tsShort(value) { return value ? String(value) : "—"; },
    p3TimeP(value) { return value ? String(value) : "—"; }
  };
  vm.runInNewContext(
    extractBalancedVar(PANEL_SOURCE, "SYNC_STATUS_P") + "\n" + names.map((name) => extractTopLevelFunction(PANEL_SOURCE, name)).join("\n"),
    context,
    { filename: "rem-71-panel-status.js" }
  );
  return context;
}

function completeReceipt() {
  return {
    status: "accepted",
    snapshotRevision: "a".repeat(40),
    sourceLatestSha: "b".repeat(40),
    sourceUpdatedAt: "2026-08-20T09:00:00.000Z",
    submittedAt: "2026-08-20T09:00:01.000Z",
    acceptedAt: "2026-08-20T09:00:02.000Z"
  };
}

function projectionState(reason, compat) {
  return {
    source: reason === "ready" || reason === "projection" ? "projection" : "legacy_fallback",
    reason: reason || "ready",
    snapshot: { reminderCoverageVersion: "panel-reminder-coverage-v1", projectionBuiltAt: "2026-08-20T09:04:00.000Z" },
    compatibility: compat || null
  };
}

const cases = [
  // ── Task 1: app light/dark vs panel light/dark + density ──────────────
  ["app mobile light/dark reminder tokens and panel responsive light/dark/density coexist", () => {
    assert(APP_CSS.includes("#root{--reminder-strong:#684B73"));
    assert(APP_CSS.includes('#root[data-theme="dark"]{--reminder-strong:#E8D5F1'));
    assert(APP_CSS.includes("#root[data-theme=\"dark\"]") && APP_CSS.includes("--reminder-action-ink:"));
    assert(APP_CSS.includes("@media (max-width:460px)"));
    assert(APP_CSS.includes("@media (prefers-reduced-motion:reduce)"));
    assert(PANEL_CSS.includes("--bg:#070709") && PANEL_CSS.includes("--gold:#e6c15a"));
    assert(PANEL_CSS.includes("@media (prefers-color-scheme:light)"));
    assert(PANEL_CSS.includes("--bg:#f7f4ee"));
    assert(PANEL_CSS.includes(".page[data-density=\"quick\"]"));
    assert(PANEL_CSS.includes("@media(max-width:480px)"));
    assert(PANEL_SOURCE.includes("data-density="));
    assert(PANEL_SOURCE.includes("Görünüm yoğunluğu"));
    assert(PANEL_SOURCE.includes("setDensityP"));
  }],
  ["app inbox card renders an explicit empty state with warm non-shaming copy", () => {
    const out = bootApp();
    out.sandbox.App.go("bugun");
    const html = out.app.innerHTML;
    assert(html.includes("sey-reminder-inbox-card"));
    assert(html.includes("data-reminder-render-target=\"reminder-inbox\""));
    assert(!html.toLocaleLowerCase("tr-TR").includes("başarısız"));
    assert(!html.toLocaleLowerCase("tr-TR").includes("kaçırdın"));
    failIfLeaks("app.inbox", html, [PRIVATE]);
  }],
  // ── 2: user vs operator copy do not share private detail ──────────────
  ["app inbox card carries no private note, therapy text, mood or journal", () => {
    const out = bootApp();
    out.sandbox.App.go("bugun");
    const html = out.app.innerHTML;
    assert(!html.includes(PRIVATE));
    assert(!html.includes("ghToken"));
    assert(!html.includes("openaiKey"));
  }],
  ["panel status card carries only operator-safe metadata and no app private detail", () => {
    const P = loadPanelContext();
    const card = P.reminderStatusCardHTMLP(completeReceipt(), NOW, projectionState("ready"), { ok: true });
    assert(card.includes("data-component=\"reminder-status-card\""));
    ["source", "receipt", "capability", "privacy", "device"].forEach((dim) => {
      assert(card.includes("data-reminder-dim=\"" + dim + "\""));
    });
    assert(card.includes('role="status" aria-live="polite"'));
    failIfLeaks("panel.status-card", card, [PRIVATE]);
    assert(!card.includes("reminder.catalog.v1.therapy"));
    assert(card.includes("Reminder gözlem durumu"));
  }],
  // ── 3: focus / keyboard / live region / reduced motion / long text / states ──
  ["focus, keyboard, live-region, reduced-motion and long-text contracts exist on both surfaces", () => {
    assert(APP_CSS.includes("[data-reminder-render-target],[data-reminder-render-target] *"));
    assert(APP_CSS.includes("animation:none!important;transition:none!important"));
    assert(APP_CSS.includes(":focus-visible"));
    assert(APP_SOURCE.includes("sey-reminder-inbox-live"));
    assert(APP_SOURCE.includes("aria-live=\"polite\""));
    assert(PANEL_CSS.includes("button:focus-visible"));
    assert(PANEL_CSS.includes("@media(prefers-reduced-motion:reduce)"));
    assert(PANEL_CSS.includes("--touch-min:44px"));
    assert(APP_CSS.includes("overflow-wrap:anywhere"));
    assert(PANEL_CSS.includes(".reminder-status-head-note{min-width:0;overflow-wrap:anywhere"));
  }],
  ["empty, stale, error and redacted states render distinctly on both surfaces", () => {
    const P = loadPanelContext();
    const ok = P.reminderSourceStatusP(projectionState("ready"), { ok: true });
    const stale = P.reminderSourceStatusP(projectionState("projection_stale"), { ok: true });
    const broken = P.reminderSourceStatusP(projectionState("projection_invalid"), { ok: true });
    const missing = P.reminderSourceStatusP(projectionState("projection_missing"), { ok: true });
    assertEqual(ok.code, "ok");
    assertEqual(stale.code, "stale");
    assertEqual(broken.code, "error");
    assertEqual(missing.code, "unavailable");
    const tones = [ok.tone, stale.tone, broken.tone, missing.tone];
    assert(new Set(tones).size === 4);
    const out = bootApp();
    assert(typeof out.sandbox.App.reminderSystemStatus === "function");
    // No prayer data in the synthetic fixture: overall state is honestly
    // unavailable (not falsely fresh), while in-app capability stays open.
    const noPrayer = out.sandbox.App.reminderSystemStatus({ configured: true, receipt: completeReceipt(), timezone: "Europe/Istanbul", permissionState: "granted" });
    assertEqual(noPrayer.state, "unavailable");
    assertEqual(noPrayer.capability.inApp, "available");
    assertEqual(noPrayer.capability.prayerInApp, "blocked");
  }],
  // ── 4: visual state transition measured deterministically ─────────────
  ["app action -> panel status transition is a deterministic layer advance", () => {
    const out = bootApp();
    const before = { layers: {
      capability: { code: "blocked" }, localScheduled: { code: "not_scheduled" },
      delivered: { code: "not_delivered" }, syncAccepted: { code: "unverified" },
      projectionBuilt: { code: "missing" }, panelVisible: { code: "not_visible" },
      deviceAccepted: { code: "unverified" }
    } };
    const after = { layers: {
      capability: { code: "available" }, localScheduled: { code: "scheduled" },
      delivered: { code: "delivered" }, syncAccepted: { code: "accepted" },
      projectionBuilt: { code: "built" }, panelVisible: { code: "visible" },
      deviceAccepted: { code: "unverified" }
    } };
    const transition = out.sandbox.App.reminderCrossSurfaceTransition(before, after);
    assertEqual(transition.direction, "advance");
    assertEqual(transition.nonMonotonic, false);
    assert(transition.changes.some((item) => item.layer === "capability" && item.direction === "advance"));
    const status = out.sandbox.App.reminderCrossSurfaceStatus({
      capability: { inApp: "available", permissionState: "granted" },
      local: { scheduled: true }, delivery: { delivered: true, channel: "in_app" },
      sync: { configured: true, receipt: completeReceipt() },
      projection: { source: "projection", reason: "ready", built: true },
      panel: { visible: true, pollStatus: "updated" },
      device: { accepted: false }
    });
    assertEqual(status.overall.code, "unverified");
    assertEqual(status.overall.claim, false);
    assertEqual(status.layers.deviceAccepted.code, "unverified");
    const P = loadPanelContext();
    assertEqual(P.reminderWorkingClaimP(completeReceipt(), projectionState("ready"), { ok: true }).ok, true);
    assertEqual(P.reminderWorkingClaimP(completeReceipt(), projectionState("projection_missing"), { ok: true }).reason, "kaynak_kanit_yok");
  }],
  // ── 5: premium branding + severity / privacy / capability visible ─────
  ["panel premium branding preserved while severity, privacy and capability text remain visible", () => {
    const P = loadPanelContext();
    const card = P.reminderStatusCardHTMLP(completeReceipt(), NOW, projectionState("ready"), { ok: true });
    assert(card.includes("Reminder gözlem durumu"));
    assert(card.includes("data-reminder-dim=\"capability\""));
    assert(card.includes("data-reminder-dim=\"privacy\""));
    assert(card.includes('data-reminder-working="ok"'));
    assert(card.includes("Reminder gözlemi çalışıyor"));
    assert(card.includes("Yerel · redacted"));
    assert(card.includes("Hatırlatma raw ayrıntıları redacted"));
    assert(card.includes("contract v1"));
    failIfLeaks("panel.status-card", card, [PRIVATE]);
  }],
  ["app user copy and panel operator copy use different voices and share no user data", () => {
    const appCatalog = fs.readFileSync(path.join(ROOT, "app/core/reminderCatalog.js"), "utf8");
    assert(appCatalog.includes("privateTitle"));
    assert(!appCatalog.includes("REM71_PRIVATE"));
    assert(!PANEL_SOURCE.includes("REM71_PRIVATE"));
    assert(!PANEL_SOURCE.includes("Hatırlatma merkezini aç"));
    assert(!PANEL_SOURCE.includes("Bu durağı aç"));
    assert(PANEL_SOURCE.includes("observer") || PANEL_SOURCE.includes("gözlemci"));
  }]
];

runTests(cases).catch(() => { process.exitCode = 1; });
