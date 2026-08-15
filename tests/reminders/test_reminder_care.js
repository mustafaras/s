"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const TIMEZONE = "Europe/Istanbul";
const DATE = "2026-08-14";
const NOW = "2026-08-14T09:00:00.000Z";
const PRIVATE_NOTE = "REM-19 private note";
const PRIVATE_MOOD = "REM-19 private mood";

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

function baseState(policy) {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {
      [DATE]: {
        water: 4,
        caffeine: { last: "09:00", cups: 1, drinks: [{ type: "turk", time: "09:00", qty: 1 }] },
        sleep: { hours: 7.5, quality: "good", windDown: { steps: {}, events: [], sessions: [] } },
        mood: PRIVATE_MOOD, note: PRIVATE_NOTE,
        soulActivities: [{ type: "pilates", duration: 20, note: PRIVATE_NOTE }]
      }
    },
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: policy || {} },
    settings: {
      nickname: "REM-19 care fixture", targetBed: "23:30", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "",
      profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = element("app");
  const root = element("root");
  const entries = new Map([["seyma-reset-v1", JSON.stringify(seed || baseState())]]);
  const localStorage = {
    getItem(key) { return entries.has(key) ? entries.get(key) : null; },
    setItem(key, value) { entries.set(key, String(value)); },
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
    navigator: { userAgent: "rem-19-care-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-19-care-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-19-care"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { App: sandbox.App, storage: localStorage };
}

function context(localTime) {
  return {
    timezone: TIMEZONE, localDate: DATE, localTime: localTime || "12:00", nowIso: NOW,
    capacityMode: "balanced", permissionState: "granted", nativeDailyCap: 3,
    lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 360,
    quietHours: { start: "22:30", end: "07:30" }
  };
}

function careCandidates(out, policy, localTime) {
  return out.App.reminderCareLifecycleCandidates({ policy, context: context(localTime) });
}

function privateFree(value) {
  const text = JSON.stringify(value);
  return !text.includes(PRIVATE_NOTE) && !text.includes(PRIVATE_MOOD);
}

runTests([
  ["native care selection is normalized to at most two categories and persists in policy", () => {
    const out = boot();
    assert(deepEqual(out.App.reminderCareNativeCategories(["water", "sleep", "caffeine", "water"]), ["water", "sleep"]));
    out.App.setReminderCareNativeCategories(["water", "sleep", "caffeine"]);
    const stored = JSON.parse(out.storage.getItem("seyma-reset-v1"));
    assert(deepEqual(stored.reminders.policy.careNativeCategories, ["water", "sleep"]));
    assertEqual(stored.reminders.policy.careMovementOptIn, false);
  }],
  ["water has at most three wake-window slots and selected care stays native", () => {
    const out = boot();
    const candidates = careCandidates(out, { careNativeCategories: ["water", "sleep", "caffeine"] }, "12:00");
    assertEqual(candidates.length, 4);
    assertEqual(candidates.filter((item) => item.careKey === "water").length, 3);
    assertEqual(candidates.filter((item) => item.careKey === "caffeine").length, 0);
    assert(candidates.filter((item) => item.careKey === "water").every((item) => item.preference.channel === "native"));
    assert(candidates.filter((item) => item.careKey === "sleep").every((item) => item.preference.channel === "native"));
    assert(new Set(candidates.map((item) => item.occurrence.occurrenceId)).size === candidates.length);
    assert(new Set(candidates.map((item) => item.careNudgeKey)).size === candidates.length);
    assert(privateFree(candidates));
  }],
  ["sleep and caffeine each expose one evening window; movement needs explicit opt-in", () => {
    const out = boot();
    const evening = careCandidates(out, { careNativeCategories: ["sleep", "caffeine"] }, "23:00");
    assertEqual(evening.filter((item) => item.careKey === "sleep").length, 1);
    assertEqual(evening.filter((item) => item.careKey === "caffeine").length, 1);
    assert(evening.every((item) => item.occurrence.due === true));
    const withoutOptIn = careCandidates(out, { careNativeCategories: [] }, "16:00");
    assertEqual(withoutOptIn.length, 0);
    const withOptIn = careCandidates(out, { careNativeCategories: [], careMovementOptIn: true }, "16:00");
    assertEqual(withOptIn.length, 1);
    assertEqual(withOptIn[0].careKey, "movement");
    assertEqual(withOptIn[0].preference.channel, "in_app");
  }],
  ["existing care surfaces have one adapter owner and deep-link stays health-only", () => {
    const out = boot();
    const sources = out.App.reminderCareNudgeSources();
    assertEqual(new Set(sources.map((item) => item.existingSurface)).size, sources.length);
    sources.forEach((item) => {
      assertEqual(item.deepLink, "health");
      assert(out.App.reminderDeepLinkTarget({ reminderId: item.reminderId, deepLink: "health" }).ok);
    });
  }],
  ["lifecycle applies shared native cap and preserves canonical care records", () => {
    const out = boot(baseState({ careNativeCategories: ["water", "caffeine"] }));
    out.App.reminderDeliveryClear();
    const before = out.storage.getItem("seyma-reset-v1");
    const result = out.App.evaluateReminderLifecycle("manual", { nowIso: NOW, visibilityState: "visible", context: context("18:30") });
    const nativeShown = result.results.filter((item) => item.status === "shown" && item.channel === "native");
    assert(result.ok);
    assert(nativeShown.length <= 3);
    assert(result.results.some((item) => item.channel === "in_app" || item.status === "scheduled"));
    assertEqual(out.storage.getItem("seyma-reset-v1"), before);
    assert(out.App.reminderDeliveryEntries(NOW).length > 0);
  }]
]).catch(() => process.exitCode = 1);
