"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const TIMEZONE = "Europe/Istanbul";
const NOW = "2026-08-14T09:00:00.000Z"; // 12:00 local time

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseState() {
  return {
    version: 2, startDate: "2026-08-14", lastOpenedDate: "2026-08-14", days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {}, policy: {} },
    settings: { nickname: "REM-11 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed || baseState()) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
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
    navigator: { userAgent: "rem-11-catchup-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-11-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-11"; }, revokeObjectURL() {} }),
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

function candidate(id, overrides) {
  return Object.assign({
    occurrenceId: id, reminderId: id, localDate: "2026-08-14", scheduledAt: "09:00", timezone: TIMEZONE,
    category: "discovery", priority: "P3", due: true, past: true, nativeReplay: true,
    definition: { id, category: "discovery", priority: "P3", defaultChannel: "native" },
    preference: { reminderId: id, enabled: true, channel: "native", nativeOptIn: true }
  }, overrides || {});
}

const safeContext = { localTime: "12:00", timezone: TIMEZONE, permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1 };

runTests([
  ["ten due low-priority occurrences become one generic in-app summary", () => {
    const out = boot();
    const occurrences = Array.from({ length: 10 }, (_, index) => candidate(`discovery-${index}`, { scheduledAt: "09:00" }));
    const plan = out.App.reminderCatchup({ nowIso: NOW, timezone: TIMEZONE, context: safeContext, occurrences });
    assertEqual(plan.summaries.length, 1);
    assertEqual(plan.summary.count, 10);
    assertEqual(plan.summary.channel, "in_app");
    assertEqual(plan.summary.inAppOnly, true);
    assertEqual(plan.summary.nativeAllowed, false);
    assertEqual(plan.summary.nativeReplay, false);
    assertEqual(plan.summary.reason, "catchup-grouped");
    assert(!Object.prototype.hasOwnProperty.call(plan.summary, "nativeTitle"));
    assert(!Object.prototype.hasOwnProperty.call(plan.summary, "nativeBody"));
  }],
  ["reopen produces one summary, marks members locally, and never replays native", () => {
    const out = boot();
    const occurrences = Array.from({ length: 10 }, (_, index) => candidate(`replay-${index}`));
    const first = out.App.evaluateReminders({ source: "reopen", nowIso: NOW, catchUp: true, visibilityState: "visible", context: safeContext, occurrences });
    assertEqual(first.catchUpSummaries.length, 1);
    assertEqual(first.catchUpCount, 10);
    assertEqual(first.results.length, 1);
    assertEqual(first.results[0].channel, "in_app");
    assertEqual(first.results[0].summary, true);
    const journal = first.log.entries;
    assertEqual(journal.length, 11);
    assert(journal.every((entry) => entry.channel === "in_app"));
    assert(journal.every((entry) => entry.occurrenceId.indexOf("replay-") < 0 || entry.status === "suppressed"));
    const second = out.App.evaluateReminders({ source: "reopen", nowIso: NOW, catchUp: true, visibilityState: "visible", context: safeContext, occurrences, deliveryLog: first.log });
    assertEqual(second.catchUpSummaries.length, 0);
    assertEqual(second.shownCount, 0);
    assertEqual(second.changed, false);
  }],
  ["older history is suppressed without native replay", () => {
    const out = boot();
    const old = candidate("old-prayer", { localDate: "2026-08-12", scheduledAt: "09:00", category: "ritual", priority: "P2", nativeReplay: true, definition: { id: "old-prayer", category: "ritual", priority: "P2", defaultChannel: "native" } });
    const oldMedication = candidate("old-medication", { localDate: "2026-08-12", scheduledAt: "10:00", category: "health", priority: "P2", nativeReplay: true, definition: { id: "old-medication", category: "health", priority: "P2", defaultChannel: "native" } });
    const result = out.App.evaluateReminders({ source: "reopen", nowIso: NOW, catchUp: true, visibilityState: "visible", context: safeContext, occurrences: [old, oldMedication] });
    assertEqual(result.catchUpSummaries.length, 0);
    assertEqual(result.results.length, 0);
    const entry = result.log.entries[0];
    assertEqual(entry.status, "suppressed");
    assertEqual(entry.reason, "catchup-expired");
    assertEqual(entry.channel, "in_app");
    const copy = JSON.stringify(result);
    ["kaçırdın", "kaçırıldı", "suçluluk", "başarısız", "atladın"].forEach((word) => assert(!copy.includes(word)));
  }],
  ["lifecycle catch-up includes the previous local date after midnight", () => {
    const definition = { id: "reminder.test.evening", category: "reflection", priority: "P2", triggerType: "fixed-time", scheduledAt: "23:00", defaultChannel: "in_app", definitionVersion: "1" };
    const state = baseState();
    state.reminders.preferences[definition.id] = { reminderId: definition.id, enabled: true, channel: "in_app" };
    const out = boot(state);
    const result = out.App.evaluateReminders({
      source: "reopen", nowIso: "2026-08-14T04:00:00.000Z", catchUp: true, visibilityState: "visible",
      timezone: TIMEZONE, definitions: [definition], context: { timezone: TIMEZONE, localTime: "07:00", permissionState: "granted" }
    });
    assertEqual(result.catchUpSummaries.length, 1);
    assertEqual(result.catchUpCount, 1);
    assertEqual(result.results[0].channel, "in_app");
    assertEqual(result.log.entries.filter((entry) => entry.status === "suppressed").length, 1);
  }],
  ["summary and local journal exclude native and sensitive fields", () => {
    const out = boot();
    const sensitive = candidate("safe-occurrence", {
      nativeTitle: "THERAPY_TITLE_SECRET", nativeBody: "THERAPY_BODY_SECRET", userNote: "USER_NOTE_SECRET",
      therapyText: "THERAPY_TEXT_SECRET", medicationName: "MEDICATION_SECRET", dose: "DOSE_SECRET"
    });
    const result = out.App.evaluateReminders({ source: "reopen", nowIso: NOW, catchUp: true, visibilityState: "visible", context: safeContext, occurrences: [sensitive] });
    const serialized = JSON.stringify(result.catchUpSummary)+' '+JSON.stringify(result.log);
    ["THERAPY_TITLE_SECRET", "THERAPY_BODY_SECRET", "USER_NOTE_SECRET", "THERAPY_TEXT_SECRET", "MEDICATION_SECRET", "DOSE_SECRET"].forEach((secret) => assert(!serialized.includes(secret)));
    assert(!serialized.includes("nativeTitle"));
    assert(!serialized.includes("nativeBody"));
    assert(!serialized.includes("userNote"));
    assert(!serialized.includes("therapyText"));
    assert(!serialized.includes("medicationName"));
    assert(!serialized.includes("dose"));
  }]
]).catch(() => process.exitCode = 1);
