"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const TIMEZONE = "Europe/Istanbul";
const NOW = "2026-08-14T09:00:00.000Z";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, dataset: {}, children: [],
    scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; }, replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function boot() {
  const app = element("app");
  const root = element("root");
  const entries = new Map([["seyma-reset-v1", JSON.stringify({
    version: 2, startDate: "2026-08-14", lastOpenedDate: "2026-08-14", days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: {} },
    settings: { nickname: "REM-11 budget fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  })]]);
  const localStorage = {
    getItem(key) { return entries.has(key) ? entries.get(key) : null; }, setItem(key, value) { entries.set(key, String(value)); },
    removeItem(key) { entries.delete(key); }, clear() { entries.clear(); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-11-budget-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-11-budget-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-11-budget"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { App: sandbox.App, storage: localStorage };
}

function candidate(id, priority, category, flags) {
  return Object.assign({
    occurrenceId: id, reminderId: id, localDate: "2026-08-14", scheduledAt: "09:00", timezone: TIMEZONE, due: true, past: true,
    priority, category, definition: { id, category, priority, defaultChannel: "native" },
    preference: { reminderId: id, enabled: true, channel: "native", nativeOptIn: true }
  }, flags || {});
}

const context = { localTime: "12:00", timezone: TIMEZONE, permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1 };

runTests([
  ["user-created P1 wins over ritual P2 and discovery P3", () => {
    const out = boot();
    const plan = out.App.reminderCatchup({
      nowIso: NOW, timezone: TIMEZONE, context,
      occurrences: [
        candidate("discovery", "P3", "discovery", { source: "discovery" }),
        candidate("ritual", "P2", "ritual", { source: "ritual" }),
        candidate("user", "P1", "support", { source: "custom", userCreated: true })
      ]
    });
    assertEqual(plan.summaries.length, 1);
    assertEqual(plan.summary.priority, "P1");
    assertEqual(plan.summary.precedence, "user-created-p1");
    assertEqual(plan.summary.count, 3);
  }],
  ["ritual P2 wins over discovery P3 when no user-created P1 exists", () => {
    const out = boot();
    const plan = out.App.reminderCatchup({
      nowIso: NOW, timezone: TIMEZONE, context,
      occurrences: [candidate("discovery-only", "P3", "discovery", { source: "discovery" }), candidate("ritual-only", "P2", "ritual", { source: "ritual" })]
    });
    assertEqual(plan.summary.priority, "P2");
    assertEqual(plan.summary.precedence, "ritual-p2");
  }],
  ["native budget never selects more than three and preserves deterministic precedence", () => {
    const out = boot();
    const candidates = [
      { id: "discovery", scheduledAt: "09:00", policy: { id: "discovery", priority: "P3", nativeAllowed: true, requestedChannel: "native" } },
      { id: "ritual", scheduledAt: "09:00", policy: { id: "ritual", priority: "P2", nativeAllowed: true, requestedChannel: "native" } },
      { id: "user", scheduledAt: "09:00", userCreated: true, policy: { id: "user", priority: "P1", nativeAllowed: true, requestedChannel: "native" } },
      { id: "extra-p2", scheduledAt: "09:01", policy: { id: "extra-p2", priority: "P2", nativeAllowed: true, requestedChannel: "native" } }
    ];
    const result = out.App.reminderSelectNativeCandidates({ nativeDailyCap: 3, candidates });
    assertEqual(result.selected.length, 3);
    assertEqual(result.remaining, 0);
    assert(deepEqual(result.selected.map((item) => item.id), ["user", "ritual", "extra-p2"]));
    assertEqual(result.rejected.length, 1);
    assertEqual(result.rejected[0].candidate.id, "discovery");
  }],
  ["low-priority native cap remains enforced without borrowing data.notifications budget", () => {
    const out = boot();
    const decision = out.App.reminderPolicyEvaluate({
      definition: { id: "ritual-budget", category: "ritual", priority: "P2", defaultChannel: "native" },
      preference: { enabled: true, channel: "native" },
      context: { localTime: "12:00", permissionState: "granted", nativeDailyCap: 3, nativeBudgetUsed: 0, lowPriorityNativeCap: 1, lowPriorityNativeUsed: 1 }
    });
    assertEqual(decision.nativeAllowed, false);
    assertEqual(decision.reason, "low-priority-native-cap");
    const state = JSON.parse(out.storage.getItem("seyma-reset-v1"));
    assertEqual(state.notifications.length, 1);
    assertEqual(state.notifications[0].id, "observer-fixture");
  }],
  ["care occurrences share the native daily cap and never expand the selected-category budget", () => {
    const out = boot();
    const careContext = Object.assign({}, context, { localDate: "2026-08-14", localTime: "18:30", nowIso: NOW });
    const care = out.App.reminderCareLifecycleCandidates({ policy: { careNativeCategories: ["water", "caffeine", "sleep"] }, context: careContext });
    const selectedCategories = new Set(care.filter((item) => item.preference.channel === "native").map((item) => item.careKey));
    const result = out.App.reminderEvaluateReminders({ nowIso: NOW, visibilityState: "visible", context: careContext, occurrences: care, deliveryLog: { schemaVersion: 1, entries: [] } });
    const nativeShown = result.results.filter((item) => item.status === "shown" && item.channel === "native");
    assertEqual(selectedCategories.size, 2);
    assert(nativeShown.length <= 3);
    assert(result.results.some((item) => item.status === "suppressed" || item.channel === "in_app"));
  }]
]).catch(() => process.exitCode = 1);
