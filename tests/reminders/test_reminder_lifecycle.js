"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const NOW = "2026-08-14T12:00:00.000Z";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  return {
    version: 2,
    startDate: "2026-08-14",
    lastOpenedDate: "2026-08-14",
    days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-10 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed, storageSeed) {
  const app = element("app");
  const root = element("root");
  const store = Object.assign({}, storageSeed || {}, { "seyma-reset-v1": JSON.stringify(seed || baseState()) });
  const listeners = { document: {}, window: {} };
  const counters = { fetches: 0 };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); },
    addEventListener(type, handler) { listeners.document[type] = handler; },
    removeEventListener() {}
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-10-lifecycle-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { counters.fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-10-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-10"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener(type, handler) { listeners.window[type] = handler; },
    removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { App: sandbox.App, document, listeners, storage: localStorage, counters };
}

function candidate(id, overrides) {
  return Object.assign({
    occurrenceId: id,
    reminderId: id,
    localDate: "2026-08-14",
    scheduledAt: "12:00",
    timezone: "Europe/Istanbul",
    category: "reflection",
    priority: "P2",
    due: true,
    definition: { id, category: "reflection", priority: "P2", defaultChannel: "in_app" },
    preference: { reminderId: id, enabled: true, channel: "in_app" }
  }, overrides || {});
}

function evaluate(out, source, item, context) {
  return out.App.evaluateReminders({
    source,
    nowIso: NOW,
    occurrences: [item],
    context: Object.assign({ localTime: "12:00", permissionState: "granted" }, context || {})
  });
}

runTests([
  ["occurrence -> policy -> delivery is idempotent across repeated evaluation", () => {
    const out = boot();
    const item = candidate("rem-10-repeat");
    const first = evaluate(out, "boot", item);
    const second = evaluate(out, "focus", item);
    const third = evaluate(out, "pageshow", item);
    assertEqual(first.results[0].status, "shown");
    assertEqual(first.shownCount, 1);
    assertEqual(second.duplicateCount, 1);
    assertEqual(third.duplicateCount, 1);
    assertEqual(out.App.reminderDeliveryEntries(NOW).length, 1);
    assertEqual(out.App.reminderDeliveryGet("rem-10-repeat", NOW).status, "shown");
  }],
  ["hidden policy suppression resurfaces once on foreground without a second row", () => {
    const out = boot();
    const item = candidate("rem-10-hidden");
    const hidden = evaluate(out, "hidden", item, { visibilityState: "hidden" });
    const visible = evaluate(out, "visibilitychange", item, { visibilityState: "visible" });
    const repeated = evaluate(out, "online", item, { visibilityState: "visible" });
    assertEqual(hidden.results[0].reason, "not-visible");
    assertEqual(hidden.suppressedCount, 1);
    assertEqual(visible.results[0].status, "shown");
    assertEqual(visible.shownCount, 1);
    assertEqual(repeated.duplicateCount, 1);
    assertEqual(out.App.reminderDeliveryEntries(NOW).length, 1);
    assertEqual(out.App.reminderDeliveryGet("rem-10-hidden", NOW).status, "shown");
  }],
  ["policy suppression is not reopened merely by another foreground event", () => {
    const out = boot();
    const item = candidate("rem-10-quiet", {
      preference: { reminderId: "rem-10-quiet", enabled: true, channel: "in_app", quietHoursBehavior: "suppress" },
      definition: { id: "rem-10-quiet", category: "reflection", priority: "P2", defaultChannel: "in_app" }
    });
    const quiet = evaluate(out, "boot", item, { localTime: "23:00", quietHours: { start: "22:30", end: "07:30" } });
    const foreground = evaluate(out, "focus", item, { localTime: "12:00", quietHours: { start: "22:30", end: "07:30" } });
    assertEqual(quiet.results[0].reason, "quiet-hours");
    assertEqual(foreground.duplicateCount, 1);
    assertEqual(out.App.reminderDeliveryGet("rem-10-quiet", NOW).status, "suppressed");
    assertEqual(out.App.reminderDeliveryGet("rem-10-quiet", NOW).reason, "quiet-hours");
  }],
  ["lifecycle listeners route boot, visibility, focus, pageshow, online and timer to safe checkpoints", () => {
    const out = boot();
    assertEqual(typeof out.listeners.document.visibilitychange, "function");
    ["focus", "pageshow", "online"].forEach((event) => assertEqual(typeof out.listeners.window[event], "function"));
    out.listeners.window.focus();
    assertEqual(out.App.reminderLifecycleState().lastSource, "focus");
    out.listeners.window.pageshow();
    assertEqual(out.App.reminderLifecycleState().lastSource, "pageshow");
    out.listeners.window.online();
    assertEqual(out.App.reminderLifecycleState().lastSource, "online");
    out.document.hidden = true;
    out.listeners.document.visibilitychange();
    assertEqual(out.App.reminderLifecycleState().lastSource, "hidden");
    out.document.hidden = false;
    out.listeners.document.visibilitychange();
    assertEqual(out.App.reminderLifecycleState().lastSource, "visibilitychange");
    const timer = out.App.reminderLifecycleTick();
    assertEqual(timer.source, "timer");
    assert(out.counters.fetches >= 1);
  }],
  ["scheduler failures expose only whitelisted reasons", () => {
    const out = boot();
    const invalid = evaluate(out, "boot", { due: true, definition: null, preference: null });
    assertEqual(invalid.ok, false);
    invalid.errors.forEach((error) => assert(["quiet-hours", "daily-budget", "category-cooldown", "permission-denied", "not-visible", "today-muted", "stale-data", "already-completed", "duplicate", "capacity", "disabled", "invalid", "not-required", "channel-policy", "unsupported", "storage-error", "native-error", "unknown"].includes(error.reason)));
    const exploding = candidate("rem-10-failure");
    Object.defineProperty(exploding, "policy", { get() { throw new Error("RAW_SECRET_EXCEPTION"); } });
    const failed = evaluate(out, "timer", exploding);
    assertEqual(failed.ok, false);
    assertEqual(failed.errors[0].reason, "unknown");
    assertEqual(out.App.reminderDeliveryGet("rem-10-failure", NOW).status, "failed");
    const stored = out.storage.getItem(DELIVERY_KEY) || "";
    assert(!stored.includes("Error"));
    assert(!stored.includes("RAW_SECRET_EXCEPTION"));
    assert(!stored.includes("exception"));
  }]
]).catch(() => process.exitCode = 1);
