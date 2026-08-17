"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");

function node(id) {
  return {
    id: id || "", _html: "", style: { cssText: "", setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, dataset: {}, children: [], scrollTop: 0, value: "", parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); }, get textContent() { return this._html; }, set textContent(value) { this._html = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; }, removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; }, replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function boot() {
  const app = node("app");
  const root = node("root");
  const store = { "seyma-reset-v1": JSON.stringify({
    version: 2, startDate: "2026-08-13", lastOpenedDate: "2026-08-13", days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-08 timezone fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } }, cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  }) };
  const localStorage = { getItem(key) { return store[key] || null; }, setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() {} };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = { hidden: false, body: node("body"), documentElement: root, getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return node(""); }, createDocumentFragment() { return node(""); }, addEventListener() {}, removeEventListener() {} };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock, navigator: { userAgent: "rem-08-timezone-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} }, matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-08-timezone-uuid"; } }, URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-08"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  return sandbox.App;
}

function fixed(App, instantIso, timezone, date) {
  return App.reminderGenerateOccurrence({ definition: { id: "r-timezone", triggerType: "fixed-time", time: "00:00", definitionVersion: "1.0.0" }, instantIso, timezone, localDate: date || undefined });
}

runTests([
  ["Europe/Istanbul midnight transition uses injected instant and local date", () => {
    const App = boot();
    const before = App.reminderEngineLocalParts(Date.parse("2026-08-13T20:59:59.000Z"), "Europe/Istanbul");
    const after = App.reminderEngineLocalParts(Date.parse("2026-08-13T21:00:00.000Z"), "Europe/Istanbul");
    assertEqual(before.localDate, "2026-08-13"); assertEqual(before.localTime, "23:59:59");
    assertEqual(after.localDate, "2026-08-14"); assertEqual(after.localTime, "00:00:00");
    assert(fixed(App, "2026-08-13T20:59:59.000Z", "Europe/Istanbul").occurrenceId !== fixed(App, "2026-08-13T21:00:00.000Z", "Europe/Istanbul").occurrenceId);
  }],
  ["DST spring-forward skips the nonexistent local hour deterministically", () => {
    const App = boot();
    const before = App.reminderEngineLocalParts(Date.parse("2026-03-08T06:59:59.000Z"), "America/New_York");
    const after = App.reminderEngineLocalParts(Date.parse("2026-03-08T07:00:00.000Z"), "America/New_York");
    assertEqual(before.localDate, "2026-03-08"); assertEqual(before.localTime, "01:59:59");
    assertEqual(after.localDate, "2026-03-08"); assertEqual(after.localTime, "03:00:00");
  }],
  ["DST fall-back repeated hour stays on the same local date and ID components", () => {
    const App = boot();
    const first = App.reminderEngineLocalParts(Date.parse("2026-11-01T05:30:00.000Z"), "America/New_York");
    const second = App.reminderEngineLocalParts(Date.parse("2026-11-01T06:30:00.000Z"), "America/New_York");
    assertEqual(first.localDate, "2026-11-01"); assertEqual(second.localDate, "2026-11-01");
    assertEqual(first.localTime, "01:30:00"); assertEqual(second.localTime, "01:30:00");
    const a = fixed(App, "2026-11-01T05:30:00.000Z", "America/New_York");
    const b = fixed(App, "2026-11-01T06:30:00.000Z", "America/New_York");
    assertEqual(a.occurrenceId, b.occurrenceId);
  }],
  ["invalid timezone and invalid date fail closed without occurrence", () => {
    const App = boot();
    const badZone = App.reminderGenerateOccurrence({ definition: { id: "r-invalid", triggerType: "fixed-time", time: "09:00" }, localDate: "2026-08-13", timezone: "Not/AZone" });
    const badDate = App.reminderGenerateOccurrence({ definition: { id: "r-invalid-date", triggerType: "fixed-time", time: "09:00" }, localDate: "2026-02-30", timezone: "Europe/Istanbul" });
    assertEqual(badZone.ok, false); assertEqual(badZone.occurrence, null); assertEqual(badDate.ok, false); assertEqual(badDate.occurrence, null);
  }],
  ["prayer offset crosses the local midnight without changing timezone identity", () => {
    const App = boot();
    const result = App.reminderPrayerOccurrence({
      prayerKey: "isha", offsetMinutes: 10, localDate: "2026-08-14", timezone: "Europe/Istanbul",
      instantIso: "2026-08-14T12:00:00.000Z", prayerData: {
        localDate: "2026-08-14", fetchedAt: "2026-08-14T10:00:00.000Z", fetchedFor: "41.0082,28.9784,İstanbul", method: "diyanet",
        times: { isha: "23:55" }, revision: "prayer-midnight"
      }, hijriOffset: -2
    });
    assert(result.ok); assertEqual(result.localDate, "2026-08-15"); assertEqual(result.scheduledAt, "00:05"); assertEqual(result.timezone, "Europe/Istanbul"); assertEqual(result.hijriOffset, -2);
  }],
  ["Hicri offset is bounded metadata and does not alter deterministic occurrence identity", () => {
    const App = boot();
    const base = fixed(App, "2026-08-13T09:00:00.000Z", "Europe/Istanbul", "2026-08-13");
    const plus = App.reminderGenerateOccurrence({ definition: { id: "r-hijri", triggerType: "fixed-time", time: "12:00", definitionVersion: "1.0.0" }, localDate: "2026-08-13", timezone: "Europe/Istanbul", hijriOffset: 2 });
    const minus = App.reminderGenerateOccurrence({ definition: { id: "r-hijri", triggerType: "fixed-time", time: "12:00", definitionVersion: "1.0.0" }, localDate: "2026-08-13", timezone: "Europe/Istanbul", hijriOffset: -2 });
    assertEqual(plus.hijriOffset, 2); assertEqual(minus.hijriOffset, -2); assert(plus.occurrenceId === minus.occurrenceId); assert(base.occurrenceId !== plus.occurrenceId);
    const clamped = App.reminderGenerateOccurrence({ definition: { id: "r-hijri", triggerType: "fixed-time", time: "12:00", definitionVersion: "1.0.0" }, localDate: "2026-08-13", timezone: "Europe/Istanbul", hijriOffset: 9 });
    assertEqual(clamped.hijriOffset, 0);
  }]
]).catch(() => process.exitCode = 1);
