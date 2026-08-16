"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-15";
const NOW = "2026-08-15T09:00:00.000Z";
const LOCATION = "41.0082,28.9784,İstanbul";
const TIMES = { fajr: "05:30", sunrise: "06:58", dhuhr: "13:08", asr: "16:55", maghrib: "20:04", isha: "21:35" };

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

function prayerData(overrides = {}) {
  return Object.assign({
    localDate: DATE, fetchedAt: "2026-08-15T08:00:00.000Z", fetchedFor: LOCATION, method: "diyanet",
    revision: "prayer-r4-istanbul-diyanet", times: Object.assign({}, TIMES)
  }, overrides);
}

function baseState() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] }, reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-14 prayer fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW },
      prayer: { method: "diyanet", location: { lat: 41.0082, lon: 28.9784, cityName: "İstanbul" }, hijriOffset: 0, reminderOffsetMinutes: 15 }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed = baseState()) {
  const app = element("app");
  const root = element("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let fetches = 0;
  function NotificationMock() {}
  NotificationMock.permission = "default";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("default"); };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-14-prayer-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-14-prayer-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-14"; }, revokeObjectURL() {} }), URLSearchParams,
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
  return { sandbox, app, localStorage, fetches: () => fetches };
}

function prayerInput(extra = {}) {
  return Object.assign({ prayerData: prayerData(), localDate: DATE, timezone: "Europe/Istanbul", instantIso: NOW, offsetMinutes: -15, hijriOffset: 0 }, extra);
}

runTests([
  ["selected prayer and signed offset produce one safe occurrence with faith deep-link", () => {
    const out = boot();
    const result = out.sandbox.App.reminderPrayerOccurrence(Object.assign(prayerInput(), { prayerKey: "fajr", offsetMinutes: -15, hijriOffset: 2 }));
    assert(result.ok); assertEqual(result.localDate, DATE); assertEqual(result.scheduledAt, "05:15"); assertEqual(result.prayerKey, "fajr");
    assertEqual(result.deepLink, "faith"); assertEqual(result.hijriOffset, 2); assert(!result.occurrence.performed); assert(!("missed" in result.occurrence));
    const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: "reminder.catalog.v1.prayer", deepLink: result.deepLink });
    assert(target.ok); assertEqual(target.targetId, "faith"); assertEqual(target.kind, "overlay");
  }],
  ["all six prayer keys produce distinct deterministic occurrences", () => {
    const out = boot();
    const results = out.sandbox.App.reminderPrayerOccurrences(prayerInput({ offsetMinutes: 10 }));
    assertEqual(results.length, 6);
    assertEqual(results.filter((item) => item.ok).length, 6);
    assertEqual(new Set(results.map((item) => item.prayerKey)).size, 6);
    assertEqual(new Set(results.map((item) => item.occurrenceId)).size, 6);
    assert(results.every((item) => item.deepLink === "faith" && item.offsetMinutes === 10));
    const plus = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "fajr", hijriOffset: 2 }));
    const minus = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "fajr", hijriOffset: -2 }));
    assertEqual(plus.occurrenceId, minus.occurrenceId);
  }],
  ["stale, missing and offline fallback timing fail closed", () => {
    const out = boot();
    const stale = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "fajr", prayerData: prayerData({ fetchedAt: "2026-08-12T08:00:00.000Z" }) }));
    assertEqual(stale.ok, false); assertEqual(stale.reason, "stale-prayer-data"); assertEqual(stale.occurrence, null); assertEqual(stale.nativeReplay, false);
    const missing = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "fajr", prayerData: prayerData({ times: {} }) }));
    assertEqual(missing.ok, false); assertEqual(missing.reason, "missing-prayer-time"); assertEqual(missing.occurrence, null);
    const offline = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "fajr", offline: true, prayerData: prayerData({ fallback: true, fresh: false }) }));
    assertEqual(offline.ok, false); assertEqual(offline.reason, "offline-prayer-data"); assertEqual(offline.occurrence, null);
  }],
  ["method and location changes reject an otherwise fresh snapshot", () => {
    const out = boot();
    const method = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "dhuhr", prayerMethod: "mwl" }));
    assertEqual(method.ok, false); assertEqual(method.reason, "prayer-method-changed"); assertEqual(method.stale, true);
    const location = out.sandbox.App.reminderPrayerOccurrence(prayerInput({ prayerKey: "dhuhr", locationHash: "39.9334,32.8597,Ankara" }));
    assertEqual(location.ok, false); assertEqual(location.reason, "prayer-location-changed"); assertEqual(location.stale, true);
  }],
  ["private prayer copy ignores performed, missed and note detail", () => {
    const out = boot();
    const definition = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.prayer");
    const copy = out.sandbox.App.reminderPrayerPrivateCopy({ performed: true, missed: true, note: "PRIVATE_NOTE", privateBody: "Namazı kaçırdın" }, definition);
    const serialized = JSON.stringify(copy);
    assert(!serialized.includes("performed")); assert(!serialized.includes("missed")); assert(!serialized.includes("PRIVATE_NOTE")); assert(!serialized.includes("kaçırdın"));
    const items = out.sandbox.App.reminderInboxItems({ nowIso: NOW, localDate: DATE, occurrences: [{ occurrence: Object.assign({}, out.sandbox.App.reminderPrayerOccurrence(Object.assign(prayerInput(), { prayerKey: "fajr" })).occurrence, { due: true, past: false }), definition, privateBody: "Namazı kaçırdın", detail: "performed=true" }] });
    assertEqual(items.items.length, 1); assert(!JSON.stringify(items.items).includes("kaçırdın")); assert(!JSON.stringify(items.items).includes("performed=true"));
  }],
  ["legacy prayer day is not a certain lifecycle source until method metadata is present", () => {
    const seed = baseState();
    seed.reminders.preferences["reminder.catalog.v1.prayer"] = { reminderId: "reminder.catalog.v1.prayer", enabled: true, channel: "in_app" };
    seed.days[DATE] = { prayer: Object.assign({ fetchedAt: "2026-08-15T08:00:00.000Z", fetchedFor: LOCATION }, Object.fromEntries(Object.entries(TIMES).map(([key, time]) => [key, { time }])) ) };
    const out = boot(seed);
    const defs = [out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.prayer")];
    const blocked = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, definitions: defs, timezone: "Europe/Istanbul", visibilityState: "visible" });
    assertEqual(blocked.shownCount, 0); assertEqual(blocked.scheduledCount, 0);
    seed.days[DATE].prayer.fetchedMethod = "diyanet";
    const ready = boot(seed);
    const lifecycle = ready.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, definitions: defs, timezone: "Europe/Istanbul", visibilityState: "visible" });
    assert(lifecycle.ok); assert(lifecycle.results.length > 0); assert(!JSON.stringify(lifecycle.results).includes("performed")); assert(!JSON.stringify(lifecycle.results).includes("missed"));
    const generated = ready.sandbox.App.reminderPrayerOccurrences(prayerInput({ prayerKeys: ["fajr"], prayerMethod: "diyanet", locationHash: LOCATION }));
    assertEqual(generated.length, 1); assert(generated[0].ok);
  }]
]);
