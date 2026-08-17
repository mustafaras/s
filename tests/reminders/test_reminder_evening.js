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
const SAYGI_ID = "reminder.catalog.v1.saygi";
const READING_ID = "reminder.catalog.v1.reading";
const JOURNAL_ID = "reminder.catalog.v1.journal";
const PRIVATE_NOTE = "PRIVATE_JOURNAL_NOTE";
const PRIVATE_MOOD = "PRIVATE_MOOD_CONTEXT";
const PRIVATE_PERSON = "PRIVATE_PERSON_CONTEXT";

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

function baseState(preferences) {
  const state = {
    version: 2, startDate: DATE, lastOpenedDate: DATE,
    days: { [DATE]: { journal: { text: PRIVATE_NOTE }, mood: PRIVATE_MOOD, note: PRIVATE_NOTE } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: {
      schemaVersion: 1, preferences: preferences || {},
      policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" }
    },
    settings: { nickname: "REM-18 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    zikr: { schemaVersion: 4, migrationVersion: "zikr_v2", presets: [{ id: "subhanallah", name: "Sübhanallah", phrase: "Sübhanallah", target: 33, kind: "core", builtIn: true }], journeys: {}, sessions: {}, reflections: [], activeSession: null, settings: { activePresetId: "subhanallah" } }
  };
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
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-18-evening-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-18-evening-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-18"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "saygiPeople.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, localStorage, app };
}

function preference(id, extra) {
  return Object.assign({ reminderId: id, enabled: true, channel: "in_app" }, extra || {});
}

function candidate(out, id, deepLink, priority, start, extra) {
  const definition = out.sandbox.ReminderCatalogV1.get(id);
  const occurrence = {
    reminderId: id, occurrenceId: `fixture:${id}:${start}`, localDate: DATE, scheduledAt: start, timezone: TIMEZONE,
    priority, category: definition.category, deepLink, due: true, past: false, replay: false, nativeReplay: false
  };
  return Object.assign({ occurrence, definition, preference: preference(id, { timeWindow: { start, end: "23:00" } }), reminderId: id }, extra || {});
}

function eveningContext(extra) {
  return Object.assign({ timezone: TIMEZONE, localDate: DATE, localTime: "21:30", nowIso: NOW, capacityMode: "balanced", permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1, quietHours: { start: "22:30", end: "07:30" } }, extra || {});
}

function privateFree(value) {
  const text = JSON.stringify(value);
  return !text.includes(PRIVATE_NOTE) && !text.includes(PRIVATE_MOOD) && !text.includes(PRIVATE_PERSON);
}

runTests([
  ["coalesces zikir, Saygı, reading and journal into one safe occurrence", () => {
    const out = boot(baseState());
    const reading = candidate(out, READING_ID, "reading", "P3", "18:00", { preference: preference(READING_ID, { channel: "native", nativeOptIn: true, eveningPrimary: true }) });
    const saygi = candidate(out, SAYGI_ID, "saygi", "P3", "18:30");
    const zikr = candidate(out, ZIKR_ID, "zikr", "P2", "20:00", { preference: preference(ZIKR_ID, { channel: "in_app", timeWindow: { start: "20:00", end: "22:00" } }) });
    const journal = candidate(out, JOURNAL_ID, "gunluk", "P2", "19:00", { preference: preference(JOURNAL_ID, { channel: "in_app" }) });
    const grouped = out.sandbox.App.reminderEveningCoalesce([reading, saygi, zikr, journal], eveningContext());
    assertEqual(grouped.length, 1);
    assertEqual(grouped[0].eveningCoalesced, true);
    assertEqual(grouped[0].occurrence.eveningCoalesced, true);
    assertEqual(grouped[0].occurrence.deepLink, "reading");
    assertEqual(grouped[0].occurrence.reminderId, READING_ID);
    assertEqual(grouped[0].occurrence.eveningGroup.count, 4);
    assertEqual(grouped[0].occurrence.scheduledAt, "18:00");
    assert(privateFree(grouped));
    assertEqual(grouped[0].occurrence.nativeTitle, "Akşamı tek bir küçük davetle kapatabilirsin");
    assertEqual(grouped[0].occurrence.nativeBody, "İstersen Şeyma’da seçtiğin küçük durağı açabilirsin.");
  }],
  ["lifecycle emits at most one native occurrence and keeps alternatives in-app", () => {
    const preferences = {};
    preferences[READING_ID] = preference(READING_ID, { channel: "native", nativeOptIn: true, eveningPrimary: true });
    preferences[JOURNAL_ID] = preference(JOURNAL_ID, { channel: "in_app" });
    preferences[ZIKR_ID] = preference(ZIKR_ID, { channel: "in_app", dailyEnabled: true, timeWindow: { start: "20:00", end: "22:00" } });
    const out = boot(baseState(preferences));
    const before = out.localStorage.getItem("seyma-reset-v1");
    const first = out.sandbox.App.evaluateReminderLifecycle("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: true });
    assertEqual(first.ok, true);
    assertEqual(first.errors.length, 0);
    assertEqual(first.results.length, 1);
    assertEqual(first.results[0].channel, "native");
    assertEqual(first.results[0].status, "shown");
    assertEqual(first.results[0].occurrenceId.startsWith("reminder.coalesced.evening.v1:"), true);
    assertEqual(out.localStorage.getItem("seyma-reset-v1"), before);
    const items = out.sandbox.App.reminderInboxItems({ nowIso: NOW, timezone: TIMEZONE });
    assertEqual(items.active.length, 1);
    assertEqual(items.active[0].eveningGroup.count, 3);
    const html = out.sandbox.App.reminderInboxCardHTML({ nowIso: NOW, timezone: TIMEZONE });
    assert(html.includes("Bu akşam · tek davet"));
    assert(html.includes("Günlük Işığı"));
    assert(html.includes("Zikir"));
    assert(!html.includes(PRIVATE_NOTE));
    const second = out.sandbox.App.evaluateReminderLifecycle("manual", { nowIso: NOW, visibilityState: "visible", zikrFeatureEnabled: true });
    assertEqual(second.results.length, 1);
    assertEqual(second.duplicateCount, 1);
    assert(privateFree(first));
  }],
  ["missing journal/library records are invitation-neutral, not a failure", () => {
    const preferences = {};
    preferences[READING_ID] = preference(READING_ID, { channel: "in_app", eveningPrimary: true });
    preferences[JOURNAL_ID] = preference(JOURNAL_ID, { channel: "in_app" });
    const out = boot(baseState(preferences));
    const result = out.sandbox.App.evaluateReminderLifecycle("manual", { nowIso: NOW, visibilityState: "visible" });
    assertEqual(result.ok, true);
    assertEqual(result.errors.length, 0);
    assertEqual(result.results.length, 1);
    const candidates = out.sandbox.App.reminderEveningCoalesce([
      candidate(out, READING_ID, "reading", "P3", "18:00"), candidate(out, JOURNAL_ID, "gunluk", "P2", "19:00")
    ], eveningContext());
    assertEqual(candidates[0].occurrence.dataRequirement, "none");
    assert(!JSON.stringify(candidates).includes(PRIVATE_NOTE));
  }],
  ["quiet hours and native budget remain authoritative for the one coalesced invite", () => {
    const out = boot(baseState());
    const reading = candidate(out, READING_ID, "reading", "P3", "18:00", { preference: preference(READING_ID, { channel: "native", nativeOptIn: true, eveningPrimary: true }) });
    const journal = candidate(out, JOURNAL_ID, "gunluk", "P2", "19:00", { preference: preference(JOURNAL_ID, { channel: "in_app" }) });
    const grouped = out.sandbox.App.reminderEveningCoalesce([reading, journal], eveningContext());
    const quiet = out.sandbox.App.reminderEvaluateReminders({ nowIso: NOW, visibilityState: "visible", context: eveningContext({ localTime: "23:00", quietHours: { start: "22:30", end: "07:30" } }), occurrences: grouped, deliveryLog: { schemaVersion: 1, entries: [] } });
    assertEqual(quiet.results.length, 1);
    assertEqual(quiet.results[0].status, "shown");
    assertEqual(quiet.results[0].channel, "in_app");
    assert(!quiet.results.some((item) => item.channel === "native"));
    const capped = out.sandbox.App.reminderEvaluateReminders({ nowIso: NOW, visibilityState: "visible", context: eveningContext({ nativeBudgetUsed: 3 }), occurrences: grouped, deliveryLog: { schemaVersion: 1, entries: [] } });
    assertEqual(capped.results.length, 1);
    assertEqual(capped.results[0].channel, "in_app");
    assertEqual(capped.results[0].status, "shown");
  }],
  ["morning check-in does not create a second evening-native pair", () => {
    const out = boot(baseState());
    const reading = candidate(out, READING_ID, "reading", "P3", "18:00", { preference: preference(READING_ID, { channel: "native", nativeOptIn: true }) });
    const journal = candidate(out, JOURNAL_ID, "gunluk", "P2", "19:00", { preference: preference(JOURNAL_ID, { channel: "in_app" }) });
    const morning = out.sandbox.App.reminderEveningCoalesce([reading, journal], eveningContext({ localTime: "08:30" }));
    assertEqual(morning.length, 1);
    assertEqual(morning[0].eveningCoalesced, true);
    assertEqual(morning[0].occurrence.due, false);
    const catchup = out.sandbox.App.reminderCatchup({ nowIso: NOW, timezone: TIMEZONE, context: eveningContext(), occurrences: [{ occurrence: Object.assign({}, morning[0].occurrence, { past: true, due: true }), definition: morning[0].definition, preference: morning[0].preference }] });
    assertEqual(catchup.summaries.length, 1);
    assertEqual(catchup.summaries[0].nativeReplay, false);
    assertEqual(catchup.summaries[0].inAppOnly, true);
  }]
]);
