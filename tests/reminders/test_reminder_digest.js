"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

function fixtureElement(id) {
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

function baseState(overrides) {
  return Object.assign({
    version: 2,
    startDate: "2026-08-12",
    lastOpenedDate: "2026-08-16",
    days: {},
    notifications: [],
    settings: {
      nickname: "REM-35 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture", unlockedAt: "2026-08-16T00:00:00.000Z" }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    reminders: { schemaVersion: 1, preferences: {}, policy: { quietHours: { start: "22:30", end: "07:30" }, dailyFlowBudget: 3, nativeDailyCap: 3 } }
  }, overrides || {});
}

function boot(seed, options) {
  const opts = options || {};
  const counters = { fetches: 0, schedules: 0, permissionRequests: 0 };
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const elements = { app, root };
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root, activeElement: null,
    getElementById(id) { return elements[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const Notification = function NotificationStub() { throw new Error("native notification must not be created"); };
  Notification.permission = "default";
  Notification.requestPermission = function requestPermission() { counters.permissionRequests += 1; return Promise.resolve("default"); };
  const sandbox = {
    console, localStorage, document, Notification,
    navigator: { vibrate() {}, userAgent: "rem-35-digest", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { counters.fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-35-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-35"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  if (opts.withSync) {
    sandbox.SeySync = { schedule() { counters.schedules += 1; }, pushNow() { return Promise.resolve(); } };
  }
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { sandbox, storage: localStorage, app, counters, error: null };
  } catch (error) {
    return { sandbox, storage: localStorage, app, counters, error: error && error.message ? error.message : "REM-35_FIXTURE_FAILED" };
  }
}

function sensitiveWeekState() {
  return baseState({
    startDate: "2026-08-12",
    days: {
      "2026-08-12": { note: "RAW_DAILY_SECRET", mood: "sad", therapy: { note: "THERAPY_SECRET" }, prayer: { fajr: { done: true } }, medications: [{ name: "MEDICATION_SECRET", dose: "DOSE_SECRET" }] },
      "2026-08-16": { note: "ANOTHER_DAILY_SECRET", mood: "happy", gratitude: ["GRATITUDE_SECRET"], prayer: { maghrib: { done: true } } }
    }
  });
}

let pureFixtureOut = null;
function pureFixture() {
  if (!pureFixtureOut) pureFixtureOut = boot(baseState({ startDate: "2026-08-16", days: {} }), { withSync: true });
  return pureFixtureOut;
}

runTests([
  ["empty history is neutral and has no delivery side effects", () => {
    const out = pureFixture();
    const baselineSchedules = out.counters.schedules;
    const baselineFetches = out.counters.fetches;
    assertEqual(out.error, null);
    const digest = out.sandbox.App.reminderDigest({ data: baseState({ startDate: "2026-08-16", days: {} }), nowIso: "2026-08-16T09:00:00.000Z", timezone: "Europe/Istanbul" });
    assertEqual(digest.state, "empty");
    assertEqual(digest.hasLocalHistory, false);
    assertEqual(digest.localOnly, true);
    assertEqual(digest.deliveryBoundary.nativeEligible, false);
    assertEqual(digest.policyBoundary.consumesReminderBudget, false);
    assertEqual(digest.policyBoundary.quietHoursAffects, false);
    assertEqual(out.counters.permissionRequests, 0);
    assertEqual(out.counters.fetches, baselineFetches);
    assertEqual(out.counters.schedules, baselineSchedules);
  }],
  ["first week exposes only calm reflection choices, never raw daily detail", () => {
    const state = sensitiveWeekState();
    const out = pureFixture();
    assertEqual(out.error, null);
    const digest = out.sandbox.App.reminderDigest({ data: state, nowIso: "2026-08-16T09:00:00.000Z", timezone: "Europe/Istanbul" });
    assertEqual(digest.state, "first-week");
    assertEqual(digest.window.startDate, "2026-08-10");
    assertEqual(digest.window.endDate, "2026-08-16");
    assertEqual(digest.reflectionOptions.length, 3);
    const text = JSON.stringify(digest);
    ["RAW_DAILY_SECRET", "ANOTHER_DAILY_SECRET", "THERAPY_SECRET", "sad", "happy", "GRATITUDE_SECRET", "MEDICATION_SECRET", "DOSE_SECRET"].forEach((secret) => assert(!text.includes(secret)));
    assertEqual(digest.privacyBoundary.rawDaily, false);
    assertEqual(digest.privacyBoundary.therapy, false);
    assertEqual(digest.privacyBoundary.mood, false);
    assertEqual(digest.privacyBoundary.worshipCompletion, false);
    assertEqual(digest.privacyBoundary.medicationDetail, false);
  }],
  ["rolling local window ignores retained days outside the seven-day boundary", () => {
    const state = baseState({
      startDate: "2026-08-01",
      days: {
        "2026-08-01": { note: "OLD_RETENTION_SECRET" },
        "2026-08-10": { intention: "LOCAL_PRESENCE_ONLY" }
      }
    });
    const out = pureFixture();
    assertEqual(out.error, null);
    const digest = out.sandbox.App.reminderDigest({ data: state, nowIso: "2026-08-16T09:00:00.000Z", timezone: "Europe/Istanbul" });
    assertEqual(digest.state, "available");
    assertEqual(digest.historyState, "present");
    assert(!JSON.stringify(digest).includes("OLD_RETENTION_SECRET"));
    assert(!JSON.stringify(digest).includes("LOCAL_PRESENCE_ONLY"));
  }],
  ["cleared history is explicit, private and still a no-op for delivery", () => {
    const state = sensitiveWeekState();
    const out = pureFixture();
    assertEqual(out.error, null);
    const baselineSchedules = out.counters.schedules;
    const baselineFetches = out.counters.fetches;
    const digest = out.sandbox.App.reminderDigest({ data: state, historyCleared: true, nowIso: "2026-08-16T09:00:00.000Z", timezone: "Europe/Istanbul" });
    assertEqual(digest.state, "cleared-history");
    assertEqual(digest.noOp.persists, false);
    assertEqual(digest.deliveryBoundary.notificationCreated, false);
    assert(!JSON.stringify(digest).includes("RAW_DAILY_SECRET"));
    assertEqual(out.counters.schedules, baselineSchedules);
    assertEqual(out.counters.fetches, baselineFetches);
  }],
  ["timezone is calculated from the requested local zone", () => {
    const state = baseState({ startDate: "2026-08-15", days: { "2026-08-16": { note: "LOCAL_SECRET" } } });
    const out = boot(state);
    assertEqual(out.error, null);
    const istanbul = out.sandbox.App.reminderDigest({ data: state, nowIso: "2026-08-15T21:30:00.000Z", timezone: "Europe/Istanbul" });
    const utc = out.sandbox.App.reminderDigest({ data: state, nowIso: "2026-08-15T21:30:00.000Z", timezone: "UTC" });
    assertEqual(istanbul.window.endDate, "2026-08-16");
    assertEqual(utc.window.endDate, "2026-08-15");
    assertEqual(istanbul.timezone, "Europe/Istanbul");
    assertEqual(utc.timezone, "UTC");
  }],
  ["center flow is explicitly user-requested, selectable and ephemeral", () => {
    const state = sensitiveWeekState();
    const out = boot(state, { withSync: true });
    assertEqual(out.error, null);
    const before = out.storage.getItem("seyma-reset-v1");
    const baselineSchedules = out.counters.schedules;
    const baselineFetches = out.counters.fetches;
    const openedWithoutCenter = out.sandbox.App.openReminderDigest();
    assertEqual(openedWithoutCenter.ok, false);
    out.sandbox.App.openReminderCenter();
    const opened = out.sandbox.App.openReminderDigest();
    assertEqual(opened.ok, true);
    assert(out.app.innerHTML.includes("data-reminder-digest-state"));
    assert(out.app.innerHTML.includes("Native opt-in’den bağımsızdır"));
    const selected = out.sandbox.App.selectReminderDigestReflection("soften");
    assertEqual(selected.ok, true);
    assert(out.app.innerHTML.includes("Neyi biraz yavaşlatmak"));
    const noOp = out.sandbox.App.dismissReminderDigest();
    assertEqual(noOp.noOp, true);
    assert(out.app.innerHTML.includes('data-reminder-digest-state="no-op"'));
    assertEqual(out.storage.getItem("seyma-reset-v1"), before);
    assertEqual(out.counters.schedules, baselineSchedules);
    assertEqual(out.counters.fetches, baselineFetches);
    assertEqual(out.counters.permissionRequests, 0);
    assert(!out.app.innerHTML.includes("RAW_DAILY_SECRET"));
    assert(!out.app.innerHTML.includes("THERAPY_SECRET"));
    assert(!out.app.innerHTML.includes("MEDICATION_SECRET"));
  }],
  ["on this day card does not render raw mood, completion or note detail", () => {
    const state = baseState({ startDate: "2025-08-16", days: { "2025-08-16": { note: "ON_THIS_DAY_SECRET", mood: "sad", gratitude: ["GRATITUDE_SECRET"] } } });
    const out = boot(state);
    assertEqual(out.error, null);
    assert(out.app.innerHTML.includes('data-reminder-on-this-day="safe"'));
    assert(out.app.innerHTML.includes("O güne bak"));
    assert(!out.app.innerHTML.includes("ON_THIS_DAY_SECRET"));
    assert(!out.app.innerHTML.includes("GRATITUDE_SECRET"));
  }]
]).catch(() => { process.exitCode = 1; });
