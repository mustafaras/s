"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-15";
const NOW = "2026-08-15T18:30:00.000Z";
const QUIET_NOW = "2026-08-15T20:00:00.000Z";
const TIMEZONE = "Europe/Istanbul";
const THERAPY_ID = "reminder.catalog.v1.therapy";
const PRIVATE_MARKERS = ["CBT_NOTE_SECRET", "FEELING_SECRET", "SAFE_SHARE_SECRET", "CRISIS_SECRET", "THERAPY_NOTE_SECRET"];

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

function baseState(preference) {
  const state = {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" } },
    settings: { nickname: "REM-16 therapy fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
  if (preference) state.reminders.preferences[THERAPY_ID] = preference;
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
    navigator: { userAgent: "rem-16-therapy-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-16-therapy-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-16"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["motivationProgramV2.js", "motivationNarratives.js", "profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { sandbox, localStorage, app };
}

function preference(tool, extra) {
  return Object.assign({
    reminderId: THERAPY_ID, enabled: true, channel: "native", selectedTool: tool,
    frequency: "selected-window", timeWindow: { start: "20:00", end: "22:00" }, daysOfWeek: [6],
    cbtNote: "CBT_NOTE_SECRET", feeling: "FEELING_SECRET", safeShareText: "SAFE_SHARE_SECRET", crisisText: "CRISIS_SECRET", therapyNote: "THERAPY_NOTE_SECRET"
  }, extra || {});
}

function occurrenceInput(pref, extra) {
  return Object.assign({ preference: pref, timezone: TIMEZONE, nowIso: NOW, localDate: DATE, localTime: "21:30" }, extra || {});
}

function sensitiveFree(value) {
  const text = JSON.stringify(value);
  return PRIVATE_MARKERS.every((marker) => !text.includes(marker));
}

runTests([
  ["no explicit practice selection produces no therapy occurrence", () => {
    const out = boot(baseState());
    [
      {},
      { enabled: false, selectedTool: "breath" },
      { enabled: true, selectedTool: "unknown" },
      { enabled: true, selectedTool: "share" },
      { enabled: true, selectedTool: "crisis" },
      { enabled: true, selectedTool: "mood" }
    ].forEach((pref) => {
      const result = out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(Object.assign({ reminderId: THERAPY_ID }, pref)));
      assertEqual(result.ok, false);
      assert(result.reason === "preference-not-selected" || result.reason === "preference-disabled");
    });
    assertEqual(out.sandbox.App.reminderTherapyLifecycleCandidates({ preference: { enabled: true }, localDate: DATE, localTime: "21:30", nowIso: NOW, timezone: TIMEZONE }).length, 0);
  }],
  ["selected breath, first step, self-compassion and CBT tools map to the room without forced completion", () => {
    const out = boot(baseState());
    [
      ["breath", "breath"], ["firstStep", "firstStep"], ["selfCompassion", "selfCompassion"], ["cbt", "thought"]
    ].forEach(([selected, expected]) => {
      const result = out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(preference(selected)));
      assert(result.ok); assertEqual(result.occurrence.therapyToolId, expected); assertEqual(result.occurrence.toolTarget, `room:${expected}`);
      assertEqual(result.occurrence.deepLink, "room"); assertEqual(result.occurrence.due, true); assertEqual(result.occurrence.frequency, "selected-window");
      assertEqual(result.occurrence.requiresForm, false); assertEqual(result.occurrence.requiresResult, false); assertEqual(result.occurrence.forced, false);
      assert(sensitiveFree(result));
    });
  }],
  ["native/private copy is generic and contains no clinical or crisis wording", () => {
    const out = boot(baseState());
    const result = out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(preference("thought")));
    const copy = out.sandbox.App.reminderTherapyPrivateCopy({ occurrence: result.occurrence });
    assert(copy); assertEqual(copy.deepLink, "room"); assertEqual(copy.therapyToolId, "thought");
    [copy.title, copy.detail].forEach((text) => assert(!/(terapi|cbt|mood|duygu|ruh hali|kriz|acil yardım|güvenli paylaşım)/i.test(text)));
  }],
  ["CBT, feeling, safe-share and crisis text stay out of occurrence, delivery result and journal", () => {
    const out = boot(baseState());
    const pref = preference("thought");
    const candidate = out.sandbox.App.reminderTherapyLifecycleCandidates(occurrenceInput(pref))[0];
    assert(candidate); assert(sensitiveFree(candidate));
    const evaluated = out.sandbox.App.reminderEvaluateReminders({
      source: "manual", nowIso: NOW, visibilityState: "visible",
      context: { timezone: TIMEZONE, localDate: DATE, localTime: "21:30", capacityMode: "balanced", permissionState: "granted", quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0 },
      occurrences: [candidate], deliveryLog: { schemaVersion: 1, entries: [] }
    });
    assertEqual(evaluated.results.length, 1); assertEqual(evaluated.results[0].channel, "native"); assert(sensitiveFree(evaluated));
    assert(out.sandbox.App.reminderDeliveryEntries(NOW).every((entry) => sensitiveFree(entry)));
  }],
  ["light and silent capacity reduce or suppress, never increase therapy frequency", () => {
    const out = boot(baseState());
    const daily = preference("breath", { frequency: "daily", dailyEnabled: true, timeWindow: { start: "20:00", end: "22:00" }, daysOfWeek: [] });
    assertEqual(out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(daily, { capacityMode: "light" })).reason, "capacity-light-reduced");
    assertEqual(out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(daily, { capacityMode: "silent" })).reason, "capacity-silent");
    const weekly = preference("firstStep", { frequency: "weekly" });
    const candidate = out.sandbox.App.reminderTherapyLifecycleCandidates(occurrenceInput(weekly))[0];
    const light = out.sandbox.App.reminderEvaluateReminders({
      nowIso: NOW, visibilityState: "visible", context: { timezone: TIMEZONE, localDate: DATE, localTime: "21:30", capacityMode: "light", permissionState: "granted" }, occurrences: [candidate], deliveryLog: { schemaVersion: 1, entries: [] }
    });
    assertEqual(light.results[0].status, "suppressed"); assertEqual(light.results[0].reason, "capacity");
  }],
  ["quiet hours defer native to in-app and disabled preference has no lifecycle candidate", () => {
    const out = boot(baseState());
    const quietPref = preference("breath", { timeWindow: { start: "22:00", end: "23:30" } });
    const candidate = out.sandbox.App.reminderTherapyLifecycleCandidates(occurrenceInput(quietPref, { nowIso: QUIET_NOW, localTime: "23:00" }))[0];
    const quiet = out.sandbox.App.reminderEvaluateReminders({
      nowIso: QUIET_NOW, visibilityState: "visible", context: { timezone: TIMEZONE, localDate: DATE, localTime: "23:00", capacityMode: "balanced", permissionState: "granted", quietHours: { start: "22:30", end: "07:30" } }, occurrences: [candidate], deliveryLog: { schemaVersion: 1, entries: [] }
    });
    assertEqual(quiet.results[0].channel, "in_app"); assertEqual(quiet.results[0].status, "shown"); assert(!quiet.results.some((item) => item.channel === "native"));
    const disabled = out.sandbox.App.reminderTherapyLifecycleCandidates(occurrenceInput(Object.assign({}, quietPref, { enabled: false })));
    assertEqual(disabled.length, 0);
  }],
  ["lifecycle emits one selected therapy candidate and preserves the correct room tool deep-link", () => {
    const pref = preference("selfCompassion", { channel: "native" });
    const out = boot(baseState(pref));
    out.sandbox.App.reminderDeliveryClear();
    const lifecycle = out.sandbox.App.reminderLifecycleEvaluate("manual", { nowIso: NOW, visibilityState: "visible" });
    assertEqual(lifecycle.results.length, 1); assertEqual(lifecycle.results[0].channel, "native");
    const candidate = out.sandbox.App.reminderTherapyOccurrence(occurrenceInput(pref));
    const target = out.sandbox.App.reminderDeepLinkTarget({ reminderId: THERAPY_ID, therapyToolId: candidate.occurrence.therapyToolId });
    assert(target.ok); assertEqual(target.deepLink, "room"); assertEqual(target.targetId, "room"); assertEqual(target.therapyToolId, "selfCompassion");
    const aliasTarget = out.sandbox.App.reminderDeepLinkTarget({ reminderId: THERAPY_ID, therapyToolId: "cbt" });
    assert(aliasTarget.ok); assertEqual(aliasTarget.therapyToolId, "thought");
    const opened = out.sandbox.App.openReminderTarget({ reminderId: THERAPY_ID, therapyToolId: "selfCompassion" });
    assert(opened.ok); assertEqual(opened.therapyToolId, "selfCompassion");
  }]
]);
