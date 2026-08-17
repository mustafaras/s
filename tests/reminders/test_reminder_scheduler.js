"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

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
  const store = { "seyma-reset-v1": JSON.stringify({
    version: 2, startDate: "2026-08-13", lastOpenedDate: "2026-08-13", days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-08 scheduler fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  }) };
  const localStorage = { getItem(key) { return store[key] || null; }, setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() {} };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = { hidden: false, body: element("body"), documentElement: root, getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {} };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock, navigator: { userAgent: "rem-08-scheduler-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} }, matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-08-scheduler-uuid"; } }, URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-08"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  return { App: sandbox.App, source: fs.readFileSync(path.join(rootDir, "app.js"), "utf8") };
}

const fixed = { id: "r-scheduler-fixed", category: "reflection", priority: "P1", triggerType: "fixed-time", time: "09:30", definitionVersion: "1.2.0" };

runTests([
  ["pure engine block has no browser, network, live clock or persistence dependency", () => {
    const out = boot();
    const start = out.source.indexOf("// ── REM-08 Pure occurrence / timezone engine ──");
    const end = out.source.indexOf("var data=null;", start);
    assert(start >= 0 && end > start);
    const block = out.source.slice(start, end).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    ["document", "localStorage", "Notification", "Date.now"].forEach((forbidden) => assert(!block.includes(forbidden)));
    assert(!/\bfetch\s*\(/.test(block));
    assert(!/new\s+Date\s*\(\s*\)/.test(block));
  }],
  ["fixed-time occurrence is deterministic and exact threshold is observable", () => {
    const { App } = boot();
    const input = { definition: fixed, localDate: "2026-08-13", timezone: "Europe/Istanbul", nowLocalTime: "09:29:59" };
    const before = App.reminderGenerateOccurrence(input);
    const again = App.reminderGenerateOccurrence(input);
    assertEqual(before.ok, true); assertEqual(before.occurrenceId, again.occurrenceId); assertEqual(before.due, false); assertEqual(before.past, false);
    assertEqual(before.localDate, "2026-08-13"); assertEqual(before.scheduledAt, "09:30"); assertEqual(before.timezone, "Europe/Istanbul"); assertEqual(before.definitionVersion, "1.2.0");
    const exact = App.reminderGenerateOccurrence(Object.assign({}, input, { nowLocalTime: "09:30:00" }));
    assertEqual(exact.due, true); assertEqual(exact.past, false);
    const after = App.reminderGenerateOccurrence(Object.assign({}, input, { nowLocalTime: "09:30:01" }));
    assertEqual(after.due, true); assertEqual(after.past, true);
    const changed = App.reminderGenerateOccurrence(Object.assign({}, input, { definition: Object.assign({}, fixed, { definitionVersion: "1.3.0" }) }));
    assert(changed.occurrenceId !== before.occurrenceId);
    assertEqual(App.reminderOccurrenceId("r-scheduler-fixed", "2026-08-13", "09:30", "Europe/Istanbul", "1.2.0"), before.occurrenceId);
  }],
  ["day-part trigger uses stable defaults and invalid trigger fails closed", () => {
    const { App } = boot();
    const result = App.reminderGenerateOccurrence({ definition: { id: "r-morning", category: "ritual", priority: "P2", triggerType: "day-part", dayPart: "morning", definitionVersion: "1.0.0" }, localDate: "2026-08-13", timezone: "Europe/Istanbul" });
    assertEqual(result.ok, true); assertEqual(result.scheduledAt, "08:00");
    const custom = App.reminderGenerateOccurrence({ definition: { id: "r-evening", triggerType: "day-part", dayPart: "evening", dayPartTimes: { evening: "20:45" } }, localDate: "2026-08-13", timezone: "Europe/Istanbul" });
    assertEqual(custom.scheduledAt, "20:45");
    const invalid = App.reminderGenerateOccurrence({ definition: { id: "r-bad", triggerType: "fixed-time", time: "25:00" }, localDate: "2026-08-13", timezone: "Europe/Istanbul" });
    assertEqual(invalid.ok, false); assertEqual(invalid.reason, "invalid-trigger");
  }],
  ["fresh prayer offset produces an occurrence and preserves Hicri context without changing ID inputs", () => {
    const { App } = boot();
    const result = App.reminderGenerateOccurrence({
      definition: { id: "r-prayer", category: "ritual", priority: "P2", triggerType: "prayer-offset", definitionVersion: "2.0.0" },
      prayerKey: "fajr", offsetMinutes: 15, localDate: "2026-08-13", timezone: "Europe/Istanbul", hijriOffset: -2,
      instantIso: "2026-08-13T07:00:00.000Z",
      prayerData: { localDate: "2026-08-13", fetchedAt: "2026-08-13T05:00:00.000Z", revision: "prayer-r4", times: { fajr: "05:30" } }
    });
    assertEqual(result.ok, true); assertEqual(result.localDate, "2026-08-13"); assertEqual(result.scheduledAt, "05:45"); assertEqual(result.hijriOffset, -2); assertEqual(result.sourceRevision, "prayer-r4"); assertEqual(result.due, true);
    const offsetChanged = App.reminderGenerateOccurrence({
      definition: { id: "r-prayer", category: "ritual", priority: "P2", triggerType: "prayer-offset", definitionVersion: "2.0.0" }, prayerKey: "fajr", offsetMinutes: 15, localDate: "2026-08-13", timezone: "Europe/Istanbul", hijriOffset: 2,
      prayerData: { localDate: "2026-08-13", fetchedAt: "2026-08-13T05:00:00.000Z", revision: "prayer-r4", times: { fajr: "05:30" } }, instantIso: "2026-08-13T07:00:00.000Z"
    });
    assertEqual(offsetChanged.occurrenceId, result.occurrenceId);
  }],
  ["prayer offset can cross midnight deterministically", () => {
    const { App } = boot();
    const result = App.reminderGenerateOccurrence({ definition: { id: "r-late-prayer", triggerType: "prayer-offset", definitionVersion: "1.0.0" }, prayerKey: "isha", offsetMinutes: 10, localDate: "2026-08-13", timezone: "Europe/Istanbul", prayerData: { localDate: "2026-08-13", fetchedAt: "2026-08-13T10:00:00.000Z", times: { isha: "23:55" } }, instantIso: "2026-08-13T12:00:00.000Z" });
    assertEqual(result.ok, true); assertEqual(result.localDate, "2026-08-14"); assertEqual(result.scheduledAt, "00:05");
  }],
  ["stale or incomplete prayer cache never creates a false exact occurrence", () => {
    const { App } = boot();
    const stale = App.reminderGenerateOccurrence({ definition: { id: "r-stale", triggerType: "prayer-offset" }, prayerKey: "fajr", localDate: "2026-08-13", timezone: "Europe/Istanbul", instantIso: "2026-08-13T12:00:00.000Z", prayerData: { localDate: "2026-08-13", fetchedAt: "2026-08-10T12:00:00.000Z", times: { fajr: "05:30" } } });
    assertEqual(stale.ok, false); assertEqual(stale.occurrence, null); assertEqual(stale.reason, "stale-prayer-data"); assertEqual(stale.nativeReplay, false); assertEqual(stale.replay, false);
    const missing = App.reminderGenerateOccurrence({ definition: { id: "r-missing", triggerType: "prayer-offset" }, prayerKey: "fajr", localDate: "2026-08-13", timezone: "Europe/Istanbul", prayerData: { localDate: "2026-08-13", fetchedAt: "2026-08-13T11:00:00.000Z", times: {} }, instantIso: "2026-08-13T12:00:00.000Z" });
    assertEqual(missing.ok, false); assertEqual(missing.reason, "missing-prayer-time");
    const unscoped = App.reminderGenerateOccurrence({ definition: { id: "r-unscoped", triggerType: "prayer-offset" }, prayerKey: "fajr", localDate: "2026-08-13", timezone: "Europe/Istanbul", locationHash: "istanbul", prayerData: { fetchedAt: "2026-08-13T11:00:00.000Z", times: { fajr: "05:30" } }, instantIso: "2026-08-13T12:00:00.000Z" });
    assertEqual(unscoped.ok, false); assertEqual(unscoped.reason, "stale-prayer-data");
  }],
  ["past occurrence is represented for catch-up but never becomes native replay", () => {
    const { App } = boot();
    const result = App.reminderGenerateOccurrence({ definition: fixed, localDate: "2026-08-12", timezone: "Europe/Istanbul", nowLocalDate: "2026-08-13", nowLocalTime: "08:00" });
    assertEqual(result.ok, true); assertEqual(result.past, true); assertEqual(result.due, true); assertEqual(result.replay, false); assertEqual(result.nativeReplay, false); assertEqual(result.shouldReplay, false);
  }],
  ["unknown input fields are not mutated and source revision is stable", () => {
    const { App } = boot();
    const input = { definition: fixed, localDate: "2026-08-13", timezone: "Europe/Istanbul", unknown: { keep: true } };
    const snapshot = JSON.stringify(input);
    const result = App.reminderGenerateOccurrence(input);
    assertEqual(result.sourceRevision, "1.2.0"); assertEqual(JSON.stringify(input), snapshot); assert(deepEqual(result.occurrence.unknown, undefined));
  }]
]).catch(() => process.exitCode = 1);
