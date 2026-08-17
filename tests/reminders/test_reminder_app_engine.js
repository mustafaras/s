"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const ENGINE_SOURCE = fs.readFileSync(path.join(ROOT, "app/core/reminderEngine.js"), "utf8");
const FIXED_NOW = "2026-08-13T21:00:00.000Z";
const LIFECYCLE_NOW = "2026-08-13T21:10:00.000Z";
const TIMEZONE = "Europe/Istanbul";

function pureEngine() {
  const sandbox = { Date, Intl, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(ENGINE_SOURCE, sandbox, { filename: "app/core/reminderEngine.js" });
  return sandbox.ReminderEngineV1;
}

function element(id) {
  return {
    id: id || "", _html: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._html; }, set textContent(value) { this._html = String(value); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function bootApp() {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify({
    version: 2, startDate: "2026-08-01", lastOpenedDate: "2026-08-13", days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-46 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      prayer: { hijriOffset: 0, method: "diyanet", location: { cityName: "İstanbul", lat: 41.0082, lon: 28.9784 } },
      auth: { rememberMe: true, usernameHash: "rem-46-fixture", unlockedAt: FIXED_NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  }) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-46-app-engine-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 41.0082, longitude: 28.9784, accuracy: 20, speed: 0 } }); }, watchPosition() { return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-46-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-46"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
  });
  vm.runInContext(ENGINE_SOURCE, context, { filename: "app/core/reminderEngine.js" });
  vm.runInContext(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), context, { filename: "app.js" });
  sandbox.App.start();
  return { App: sandbox.App, engine: sandbox.ReminderEngineV1 };
}

const definition = { id: "reminder.fixture.clock", category: "reflection", priority: "P1", triggerType: "fixed-time", time: "00:05", definitionVersion: "1.0.0" };

runTests([
  ["pure engine has no app/browser/persistence boundary and remains deterministic", () => {
    assert(!/localStorage|document|Notification|fetch\s*\(|Date\.now|new\s+Date\s*\(\s*\)/.test(ENGINE_SOURCE));
    const engine = pureEngine();
    const input = { definition, localDate: "2026-08-14", timezone: TIMEZONE, nowIso: FIXED_NOW };
    const first = engine.generateOccurrence(input);
    const second = engine.generateOccurrence(input);
    assert(first.ok); assert(deepEqual(first, second));
    assertEqual(first.occurrence.localDate, "2026-08-14");
    assertEqual(first.occurrence.scheduledAt, "00:05");
    assertEqual(first.occurrence.timezone, TIMEZONE);
  }],
  ["app adapter and pure engine produce the same occurrence from one injected clock", () => {
    const out = bootApp();
    const input = { definition, localDate: "2026-08-14", timezone: TIMEZONE, nowIso: LIFECYCLE_NOW };
    const pure = out.engine.generateOccurrence(input);
    const adapted = out.App.reminderGenerateOccurrence(input);
    assert(deepEqual(adapted, pure));
    assertEqual(out.App.reminderOccurrenceId(definition.id, "2026-08-14", "00:05", TIMEZONE, "1.0.0"), pure.occurrenceId);
  }],
  ["clock boundary separates Istanbul wall date from selected historical UI date", () => {
    const out = bootApp();
    out.App.editDay("2026-08-01");
    const clock = out.App.reminderClockBoundary({ nowIso: "2026-08-13T21:00:00.000Z", timezone: TIMEZONE });
    assertEqual(clock.wallClockDate, "2026-08-14");
    assertEqual(clock.wallClockTime, "00:00");
    assertEqual(clock.activeDate, "2026-08-01");
    assertEqual(clock.selectedDateIsHistorical, true);
    const historical = out.App.reminderGenerateOccurrence({ definition, localDate: "2026-08-01", timezone: TIMEZONE, nowIso: FIXED_NOW, activeDate: "2026-08-01" });
    assertEqual(historical.occurrence.localDate, "2026-08-01");
    assert(historical.occurrence.occurrenceId.includes("2026-08-01"));
  }],
  ["boot, foreground and historical navigation keep one ID; delivery journal deduplicates it", () => {
    const out = bootApp();
    const input = { definition, localDate: "2026-08-14", timezone: TIMEZONE, nowIso: LIFECYCLE_NOW };
    const boot = out.App.reminderGenerateOccurrence(input);
    const foreground = out.App.reminderGenerateOccurrence(Object.assign({}, input, { activeDate: "2026-08-01" }));
    const navigation = out.App.reminderGenerateOccurrence(Object.assign({}, input, { activeDate: "2026-08-12" }));
    assertEqual(boot.occurrenceId, foreground.occurrenceId);
    assertEqual(foreground.occurrenceId, navigation.occurrenceId);
    const candidate = (occurrence) => ({ occurrence, definition, preference: { reminderId: definition.id, enabled: true, channel: "in_app" } });
    const first = out.App.evaluateRemindersPure({ source: "boot", nowIso: LIFECYCLE_NOW, occurrences: [candidate(boot.occurrence)], context: { timezone: TIMEZONE, localDate: "2026-08-14", localTime: "00:10", permissionState: "granted" } });
    const second = out.App.evaluateRemindersPure({ source: "focus", nowIso: LIFECYCLE_NOW, occurrences: [candidate(foreground.occurrence)], deliveryLog: first.log, context: { timezone: TIMEZONE, localDate: "2026-08-14", localTime: "00:10", permissionState: "granted" } });
    assertEqual(first.shownCount, 1);
    assertEqual(second.duplicateCount, 1);
  }],
  ["DST and midnight use wall-clock date while Hicri metadata stays outside identity", () => {
    const out = bootApp();
    const before = out.App.reminderEngineLocalParts(Date.parse("2026-08-13T20:59:59.000Z"), TIMEZONE);
    const after = out.App.reminderEngineLocalParts(Date.parse("2026-08-13T21:00:00.000Z"), TIMEZONE);
    assertEqual(before.localDate, "2026-08-13");
    assertEqual(after.localDate, "2026-08-14");
    const minus = out.App.reminderGenerateOccurrence({ definition: Object.assign({}, definition, { time: "09:00" }), localDate: "2026-08-14", timezone: TIMEZONE, nowIso: FIXED_NOW, hijriOffset: -2 });
    const plus = out.App.reminderGenerateOccurrence({ definition: Object.assign({}, definition, { time: "09:00" }), localDate: "2026-08-14", timezone: TIMEZONE, nowIso: FIXED_NOW, hijriOffset: 2 });
    assertEqual(minus.occurrenceId, plus.occurrenceId);
    assertEqual(minus.hijriOffset, -2);
    assertEqual(plus.hijriOffset, 2);
  }],
  ["stale prayer data is unavailable and never becomes an occurrence candidate", () => {
    const out = bootApp();
    const prayerInput = { definition: { id: "reminder.fixture.prayer", triggerType: "prayer-offset", priority: "P2", definitionVersion: "1.0.0" }, prayerKey: "fajr", offsetMinutes: 10, localDate: "2026-08-14", timezone: TIMEZONE, nowIso: FIXED_NOW, prayerData: { localDate: "2026-08-14", fetchedAt: "2026-08-10T12:00:00.000Z", times: { fajr: "05:30" } } };
    const stale = out.App.reminderGenerateOccurrence(prayerInput);
    assertEqual(stale.ok, false);
    assertEqual(stale.occurrence, null);
    assertEqual(stale.reason, "stale-prayer-data");
  }]
]).catch(() => { process.exitCode = 1; });
