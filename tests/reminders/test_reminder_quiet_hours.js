"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");

function element(id) {
  return {
    id: id || "", _html: "", style: { cssText: "", setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, value: "", parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._html; }, set textContent(value) { this._html = String(value); }, setAttribute() {}, getAttribute() { return null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; }, removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function boot() {
  const app = element("app");
  const root = element("root");
  const storage = { "seyma-reset-v1": JSON.stringify({
    version: 2, startDate: "2026-08-13", lastOpenedDate: "2026-08-13", days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-07 quiet fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  }) };
  const localStorage = { getItem(key) { return storage[key] || null; }, setItem(key, value) { storage[key] = String(value); }, removeItem(key) { delete storage[key]; }, clear() {} };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = { hidden: false, body: element("body"), documentElement: root, getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {} };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock, navigator: { userAgent: "rem-07-quiet-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} }, matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-07-quiet-uuid"; } }, URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-07"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  return sandbox.App;
}

function decision(App, localTime, behavior) {
  return App.reminderPolicyEvaluate({
    definition: { id: "quiet-r2", category: "ritual", priority: "P2", defaultChannel: "native" },
    preference: { enabled: true, channel: "native", quietHoursBehavior: behavior },
    context: { localTime, permissionState: "granted", nativeDailyCap: 3, nativeBudgetUsed: 0 }
  });
}

runTests([
  ["default overnight quiet interval has exact inclusive/exclusive boundaries", () => {
    const App = boot();
    assertEqual(App.reminderIsWithinQuietHours("22:29", { start: "22:30", end: "07:30" }), false);
    assertEqual(App.reminderIsWithinQuietHours("22:30", { start: "22:30", end: "07:30" }), true);
    assertEqual(App.reminderIsWithinQuietHours("23:59", { start: "22:30", end: "07:30" }), true);
    assertEqual(App.reminderIsWithinQuietHours("00:00", { start: "22:30", end: "07:30" }), true);
    assertEqual(App.reminderIsWithinQuietHours("07:29", { start: "22:30", end: "07:30" }), true);
    assertEqual(App.reminderIsWithinQuietHours("07:30", { start: "22:30", end: "07:30" }), false);
  }],
  ["daytime and non-overnight custom intervals are deterministic", () => {
    const App = boot();
    assertEqual(App.reminderIsWithinQuietHours("12:00", { start: "22:30", end: "07:30" }), false);
    assertEqual(App.reminderIsWithinQuietHours("09:59", { start: "10:00", end: "18:00" }), false);
    assertEqual(App.reminderIsWithinQuietHours("10:00", { start: "10:00", end: "18:00" }), true);
    assertEqual(App.reminderIsWithinQuietHours("17:59", { start: "10:00", end: "18:00" }), true);
    assertEqual(App.reminderIsWithinQuietHours("18:00", { start: "10:00", end: "18:00" }), false);
    assertEqual(App.reminderIsWithinQuietHours("bad", { start: "10:00", end: "18:00" }), false);
  }],
  ["quiet P2 is deferred to in-app and never creates a native occurrence", () => {
    const App = boot();
    const quiet = decision(App, "22:30");
    assertEqual(quiet.allowed, true); assertEqual(quiet.inAppAllowed, true); assertEqual(quiet.nativeAllowed, false); assertEqual(quiet.nativeOccurrence, false);
    assertEqual(quiet.channel, "in_app"); assertEqual(quiet.reason, "quiet-hours-deferred");
    const suppressed = decision(App, "23:00", "suppress");
    assertEqual(suppressed.allowed, false); assertEqual(suppressed.reason, "quiet-hours-suppressed");
  }],
  ["P0 action-required is retained in-app during quiet hours; P1 exception is explicit", () => {
    const App = boot();
    const p0 = App.reminderPolicyEvaluate({ definition: { id: "system-r2", category: "system", priority: "P0", defaultChannel: "native" }, preference: { enabled: true, channel: "native" }, context: { localTime: "23:00", actionRequired: true, permissionState: "granted" } });
    assertEqual(p0.allowed, true); assertEqual(p0.nativeAllowed, false); assertEqual(p0.channel, "in_app"); assertEqual(p0.reason, "p0-quiet-hours-in-app");
    const p1 = App.reminderPolicyEvaluate({ definition: { id: "personal-r2", category: "support", priority: "P1", defaultChannel: "native" }, preference: { enabled: true, channel: "native", explicitlySelected: true, quietHoursException: true }, context: { localTime: "23:00", explicitlySelected: true, permissionState: "granted" } });
    assertEqual(p1.nativeAllowed, true); assertEqual(p1.channel, "native");
  }],
  ["policy uses no live clock and malformed intervals fail closed to daytime", () => {
    const App = boot();
    const input = { localTime: "22:30", quietHours: { start: "not-a-time", end: "07:30" } };
    const snapshot = JSON.stringify(input);
    const result = App.reminderQuietHoursState(input.localTime, input.quietHours);
    assertEqual(result.quiet, false);
    assertEqual(JSON.stringify(input), snapshot);
  }]
]).catch(() => process.exitCode = 1);
