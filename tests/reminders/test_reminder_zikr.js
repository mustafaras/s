"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-15";
const NOW = "2026-08-15T18:30:00.000Z";
const TIMEZONE = "Europe/Istanbul";
const ZIKR_ID = "reminder.catalog.v1.zikr";

function element(id) {
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; }, addEventListener() {}, removeEventListener() {},
    click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; }, getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function baseZikr() {
  return {
    schemaVersion: 4, migrationVersion: "zikr_v2", presets: [{ id: "subhanallah", name: "Sübhanallah", phrase: "Sübhanallah", target: 33, kind: "core", builtIn: true }],
    journeys: { subhanallah: { presetId: "subhanallah", lifetimeCount: 33, activeHatimId: "", lastAt: "2026-08-01T18:00:00.000Z", lastSessionId: "", completedHatims: 0, hatims: [] } },
    sessions: {}, reflections: [], activeSession: null,
    settings: { activePresetId: "subhanallah" }
  };
}

function baseState(preference, zikr) {
  const state = {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" } },
    settings: { nickname: "REM-15 zikr fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }, zikr: zikr || baseZikr()
  };
  if (preference) state.reminders.preferences[ZIKR_ID] = preference;
  return state;
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  const notificationCalls = [];
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-15-zikr-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-15-zikr-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-15"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.Notification = NotificationMock;
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, localStorage, notificationCalls };
}

function input(out, preference, extra) {
  return Object.assign({
    preference, zikrData: JSON.parse(out.localStorage.getItem("seyma-reset-v1")).zikr,
    featureEnabled: true, timezone: TIMEZONE, nowIso: NOW, localDate: DATE, localTime: "21:30"
  }, extra || {});
}

runTests([
  ["no preference produces no zikir occurrence or native delivery", () => {
    const out = boot(baseState());
    const result = out.sandbox.App.reminderZikrDailyOccurrence(input(out, null));
    assertEqual(result.ok, false); assertEqual(result.reason, "preference-not-selected");
    const lifecycle = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: true });
    assertEqual(lifecycle.results.length, 0); assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 0);
  }],
  ["selected daily invitation may use native, with a deterministic occurrence", () => {
    const preference = { reminderId: ZIKR_ID, enabled: true, channel: "native", dailyEnabled: true, timeWindow: { start: "20:00", end: "22:00" } };
    const out = boot(baseState(preference));
    const result = out.sandbox.App.reminderZikrDailyOccurrence(input(out, preference));
    assert(result.ok); assertEqual(result.occurrence.deepLink, "zikr"); assertEqual(result.occurrence.due, true); assertEqual(result.occurrence.nativeReplay, false);
    const lifecycle = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: true });
    assertEqual(lifecycle.results.length, 1); assertEqual(lifecycle.results[0].channel, "native");
    assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW)[0].channel, "native");
  }],
  ["journey return is weekly or selected-window and remains low frequency", () => {
    const weekly = { reminderId: ZIKR_ID, enabled: true, channel: "in_app", dailyEnabled: false, journeyEnabled: true, journeyFrequency: "weekly" };
    const out = boot(baseState(weekly));
    const first = out.sandbox.App.reminderZikrJourneyOccurrence(input(out, weekly));
    const second = out.sandbox.App.reminderZikrJourneyOccurrence(input(out, weekly));
    assert(first.ok); assertEqual(first.occurrence.frequency, "weekly"); assertEqual(first.occurrence.occurrenceId, second.occurrence.occurrenceId);
    const nextWeek = out.sandbox.App.reminderZikrJourneyOccurrence(input(out, weekly, { nowIso: "2026-08-22T18:30:00.000Z", localDate: "2026-08-22", localTime: "21:30" }));
    assert(nextWeek.ok); assert(nextWeek.occurrence.intervalBucket > first.occurrence.intervalBucket); assert(nextWeek.occurrence.occurrenceId !== first.occurrence.occurrenceId);
    assert(!JSON.stringify(first).match(/streak|seri|ceza|doğru/i));
    const selected = Object.assign({}, weekly, { journeyFrequency: "selected-window", journeyWindow: { start: "20:00", end: "22:00" }, journeyDaysOfWeek: [6] });
    const selectedResult = out.sandbox.App.reminderZikrJourneyOccurrence(input(out, selected));
    assert(selectedResult.ok); assertEqual(selectedResult.occurrence.frequency, "selected-window"); assertEqual(selectedResult.occurrence.due, true);
  }],
  ["session reflection is optional, in-app only, and text-free at delivery boundary", () => {
    const preference = { reminderId: ZIKR_ID, enabled: true, channel: "native", dailyEnabled: false, reflectionAfterSession: true };
    const zikr = baseZikr();
    zikr.activeSession = { id: "session-15", presetId: "subhanallah", count: 12, pausedAt: "2026-08-15T18:25:00.000Z", privateReflection: "PRIVATE_REFLECTION" };
    const out = boot(baseState(preference, zikr));
    const result = out.sandbox.App.reminderZikrReflectionOccurrence(input(out, preference));
    assert(result.ok); assertEqual(result.occurrence.channel, "in_app"); assertEqual(result.occurrence.nativeAllowed, false); assert(!JSON.stringify(result).includes("PRIVATE_REFLECTION"));
    const lifecycle = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: true });
    assertEqual(lifecycle.results.length, 1); assertEqual(lifecycle.results[0].channel, "in_app"); assert(!JSON.stringify(lifecycle.log).includes("PRIVATE_REFLECTION"));
    const noReflection = Object.assign({}, preference, { reflectionAfterSession: false });
    assertEqual(out.sandbox.App.reminderZikrReflectionOccurrence(input(out, noReflection)).reason, "reflection-optional-off");
  }],
  ["hidden feature flag yields no candidate and visible flag restores the path", () => {
    const preference = { reminderId: ZIKR_ID, enabled: true, channel: "in_app", dailyEnabled: true, timeWindow: { start: "20:00", end: "22:00" } };
    const out = boot(baseState(preference));
    const hidden = out.sandbox.App.reminderZikrDailyOccurrence(input(out, preference, { featureEnabled: false }));
    assertEqual(hidden.ok, false); assertEqual(hidden.reason, "feature-disabled"); assertEqual(out.sandbox.App.reminderZikrFeatureEnabled({ featureEnabled: false }), false);
    const visible = out.sandbox.App.reminderZikrDailyOccurrence(input(out, preference, { featureEnabled: true }));
    assert(visible.ok); assertEqual(out.sandbox.App.reminderZikrFeatureEnabled({ featureEnabled: true }), true);
    const lifecycle = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: false });
    assertEqual(lifecycle.results.length, 0);
  }]
]);
