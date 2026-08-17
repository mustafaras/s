"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const NOW = "2026-08-17T12:34:56.000Z";
const CSS = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

function makeElement(id, documentRef, options) {
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
    set innerHTML(value) {
      this._html = String(value);
      if (!opts.parseFirst) return;
      const match = /^\s*<([A-Za-z0-9-]+)([^>]*)>/u.exec(this._html);
      const idMatch = match && /\bid=["']([^"']+)["']/u.exec(match[2]);
      if (idMatch) {
        const child = makeElement(idMatch[1], documentRef, { tagName: match[1] });
        child._html = this._html;
        this.firstChild = child;
        this.firstElementChild = child;
      }
    },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
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
      if (documentRef && documentRef.__register) documentRef.__register(next);
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
    version: 2, startDate: "2026-08-17", lastOpenedDate: "2026-08-17", days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-49 render fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: false, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(options) {
  const opts = options || {};
  const registry = {};
  let documentRef;
  let appPaints = 0;
  function register(element) { if (element && element.id) registry[element.id] = element; return element; }
  function collectIds(html) {
    const pattern = /\bid=["']([^"']+)["']/gu;
    let match;
    while ((match = pattern.exec(String(html)))) register(makeElement(match[1], documentRef));
  }
  const app = register(makeElement("app", null));
  Object.defineProperty(app, "innerHTML", {
    configurable: true,
    get() { return app._html; },
    set(value) { app._html = String(value); appPaints += 1; collectIds(app._html); }
  });
  const root = register(makeElement("root", null));
  root.setAttribute("data-theme", "light");
  const body = register(makeElement("body", null));
  const store = { "seyma-reset-v1": JSON.stringify(baseState()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const document = {
    hidden: false, activeElement: null, body, documentElement: root,
    getElementById(id) { return registry[id] || null; },
    querySelector(selector) { if (selector === "[data-scroll]") return makeElement("fixture-main-scroll", documentRef); return null; },
    querySelectorAll() { return []; },
    createElement() { return makeElement("", documentRef, { parseFirst: true }); },
    createDocumentFragment() { return makeElement("", documentRef); }, addEventListener() {}, removeEventListener() {}
  };
  documentRef = document;
  document.__register = register;
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  class DOMParserStub { parseFromString() { return { body: makeElement("body", documentRef), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-49-render-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20 } }); }, watchPosition() { return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: opts.reducedMotion === true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub, fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-49-render-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-49"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  sandbox.App.requestLocationGatePermission();
  return { App: sandbox.App, app, body, document, registry, getPaints: () => appPaints };
}

function candidate() {
  return {
    occurrenceId: "rem-49-target", reminderId: "rem-49-target", localDate: "2026-08-17", scheduledAt: "12:00",
    timezone: "Europe/Istanbul", category: "reflection", priority: "P2", due: true,
    definition: { id: "rem-49-target", category: "reflection", priority: "P2", defaultChannel: "in_app" },
    preference: { reminderId: "rem-49-target", enabled: true, channel: "in_app" }
  };
}

function mount(out, id) {
  const old = out.registry[id] || makeElement(id, out.document);
  const host = makeElement("host-" + id, out.document);
  host.appendChild(old);
  out.registry[id] = old;
  return old;
}

function evaluate(out, source, extra) {
  return out.App.reminderLifecycleEvaluate(source || "timer", Object.assign({
    nowIso: NOW, occurrences: [candidate()], visibilityState: "visible",
    context: { localTime: "12:00", permissionState: "granted", visibilityState: "visible", timezone: "Europe/Istanbul" }
  }, extra || {}));
}

runTests([
  ["candidate unchanged is an explicit no-op policy", () => {
    const out = boot();
    const policy = out.App.reminderRenderPolicy({ source: "timer", result: { changed: false }, context: { visibilityState: "visible" } });
    assertEqual(policy.mode, "no-op");
    assertEqual(policy.reason, "candidate-unchanged");
    const first = evaluate(out);
    const second = evaluate(out);
    assert(first.rendered);
    assertEqual(second.rendered, false);
    assertEqual(out.App.reminderLifecycleState().renderReceipt.reason, "candidate-unchanged");
  }],
  ["visible inbox uses a targeted update and keeps inline handlers and aria live state", () => {
    const out = boot();
    out.App.go("bugun");
    mount(out, "sey-reminder-inbox-card");
    const before = out.getPaints();
    const result = out.App.reminderRenderAction("action-accepted", { target: "reminder-inbox", nowIso: NOW });
    const state = out.App.reminderLifecycleState();
    assert(result);
    assertEqual(out.getPaints(), before);
    assertEqual(state.renderReceipt.mode, "targeted");
    assertEqual(state.renderReceipt.target, "reminder-inbox");
    assert(out.registry["sey-reminder-inbox-card"]._html.includes("App.openReminderCenter"));
    assert(out.registry["sey-reminder-inbox-card"]._html.includes('aria-live="polite"'));
  }],
  ["draft and focused textarea use live-region-only repaint without losing modal scroll", () => {
    const out = boot();
    out.App.go("ayarlar");
    out.App.openReminderCenter();
    const scroll = out.registry["sey-reminder-scroll"];
    scroll.scrollTop = 221;
    const field = makeElement("fixture-draft", out.document, { tagName: "TEXTAREA" });
    out.document.activeElement = field;
    const live = mount(out, "sey-reminder-center-live-region");
    mount(out, "sey-reminder-system-status");
    const before = out.getPaints();
    const evaluated = evaluate(out, "timer");
    const state = out.App.reminderLifecycleState();
    assertEqual(out.getPaints(), before);
    assertEqual(state.renderReceipt.reason, "draft-active");
    assertEqual(state.renderReceipt.mode, "targeted");
    assertEqual(out.document.activeElement, field);
    assertEqual(scroll.scrollTop, 221);
    assert(live.innerHTML.toLowerCase().includes("reminder"));
  }],
  ["overlay-open and inactive-tab policies defer full render", () => {
    const overlay = boot();
    overlay.App.openReading({ preserveDraft: true });
    const overlayBefore = overlay.getPaints();
    evaluate(overlay, "timer");
    assertEqual(overlay.getPaints(), overlayBefore);
    assertEqual(overlay.App.reminderLifecycleState().renderReceipt.reason, "overlay-open");

    const inactive = boot();
    inactive.App.go("rapor");
    const inactiveBefore = inactive.getPaints();
    evaluate(inactive, "timer");
    assertEqual(inactive.getPaints(), inactiveBefore);
    assertEqual(inactive.App.reminderLifecycleState().renderReceipt.reason, "tab-inactive");
  }],
  ["accepted center action records a full-render reason and retains aria handlers", () => {
    const out = boot();
    out.App.go("ayarlar");
    out.App.openReminderCenter();
    out.registry["sey-reminder-scroll"].scrollTop = 99;
    const before = out.getPaints();
    out.App.reminderRenderAction("action-accepted", { target: "reminder-center", requiresFullRender: true, nowIso: NOW });
    const state = out.App.reminderLifecycleState();
    assert(out.getPaints() > before);
    assertEqual(state.renderReceipt.mode, "full");
    assertEqual(state.renderReceipt.reason, "action-accepted");
    assert(out.app.innerHTML.includes('id="sey-reminder-overlay"'));
    assert(out.app.innerHTML.includes("App.onReminderKeydown"));
    assert(out.app.innerHTML.includes('aria-live="polite"'));
  }],
  ["reduced-motion CSS disables target transitions and motion replay", () => {
    const out = boot({ reducedMotion: true });
    assert(CSS.includes("REM-49: targeted reminder paints"));
    assert(CSS.includes("[data-reminder-render-target],[data-reminder-render-target] *"));
    assert(out.App.reminderRenderPolicy({ source: "timer", result: { changed: true }, context: { visibilityState: "visible" } }).reason === "targeted-update");
  }]
]).catch(() => process.exitCode = 1);
