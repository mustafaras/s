"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-16";
const NOW = "2026-08-16T10:00:00.000Z";
const REMINDER_ID = "reminder.catalog.v1.prayer";

function fixtureElement(id) {
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

function baseState(reminders) {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: reminders || { schemaVersion: 1, preferences: {} },
    settings: { nickname: "REM-34 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-34-personalization-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-34-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-34"; }, revokeObjectURL() {} }), URLSearchParams,
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
  return { sandbox, app, localStorage };
}

function storedData(out) { return JSON.parse(out.localStorage.getItem("seyma-reset-v1")); }
function reminderState(out) { return storedData(out).reminders; }
function optIn(out) { return out.sandbox.App.setReminderPersonalizationOptIn(true, { nowIso: NOW }); }
function record(out, signal) { return out.sandbox.App.reminderPersonalizationRecordSignal(signal, NOW); }
function nativeState() {
  return { schemaVersion: 1, preferences: { [REMINDER_ID]: { reminderId: REMINDER_ID, enabled: true, channel: "native", privacyMode: "private" } }, policy: { capacityMode: "balanced" } };
}

runTests([
  ["default and malformed state fail closed without retaining unknown fields", () => {
    const out = boot(baseState({ schemaVersion: 1, preferences: {}, personalization: { optIn: true, historyMode: "local", autoApply: true, signals: [{ type: "feedback", source: "explicit-feedback", value: "mood", mood: "low", recordedAt: NOW }], privateText: "drop" } }));
    const state = reminderState(out).personalization;
    assertEqual(state.optIn, true);
    assertEqual(state.historyMode, "local");
    assertEqual(state.autoApply, false);
    assertEqual(state.signals.length, 0);
    assert(!Object.prototype.hasOwnProperty.call(state, "privateText"));
    const fresh = boot(baseState());
    assertEqual(reminderState(fresh).personalization.optIn, false);
    assertEqual(fresh.sandbox.App.reminderPersonalizationSuggestions().length, 0);
  }],
  ["without opt-in no explicit signal is retained and no adaptation is produced", () => {
    const out = boot(baseState());
    const result = record(out, { type: "snooze", source: "explicit-snooze", reminderId: REMINDER_ID, value: "10m" });
    assertEqual(result.ok, false);
    assertEqual(result.reason, "opt-in-required");
    assertEqual(reminderState(out).personalization.signals.length, 0);
    assertEqual(out.sandbox.App.reminderPersonalizationSuggestions().length, 0);
  }],
  ["only explicitly sourced category, time, snooze and feedback signals are accepted", () => {
    const out = boot(baseState());
    optIn(out);
    assert(record(out, { type: "category", source: "explicit-category-choice", reminderId: REMINDER_ID, value: "channel_native" }).ok);
    assert(record(out, { type: "time", source: "explicit-time-choice", reminderId: REMINDER_ID, value: "09:30" }).ok);
    assert(record(out, { type: "snooze", source: "explicit-snooze", reminderId: REMINDER_ID, value: "30m" }).ok);
    assert(record(out, { type: "feedback", source: "explicit-feedback", value: "more_quiet" }).ok);
    assert(!record(out, { type: "feedback", source: "inferred-mood", value: "more_quiet", mood: "low" }).ok);
    const state = reminderState(out).personalization;
    assertEqual(state.signals.length, 4);
    assert(deepEqual(state.signals.map((item) => item.source), ["explicit-category-choice", "explicit-time-choice", "explicit-snooze", "explicit-feedback"]));
    const serialized = JSON.stringify(state);
    ["mood", "therapy", "ibadet", "health", "silence", "rawText", "occurrenceId"].forEach((forbidden) => assert(!serialized.includes(forbidden)));
  }],
  ["explicit category and time handlers record only their allowlisted source", () => {
    const out = boot(baseState({ schemaVersion: 1, preferences: { [REMINDER_ID]: { reminderId: REMINDER_ID, enabled: true, channel: "in_app" } } }));
    optIn(out);
    out.sandbox.App.setReminderCategoryChannel("ritual", "native");
    out.sandbox.App.setReminderTimeWindow(REMINDER_ID, "09:30", "10:00");
    const signals = reminderState(out).personalization.signals;
    assert(signals.some((item) => item.type === "category" && item.source === "explicit-category-choice"));
    assert(signals.some((item) => item.type === "time" && item.source === "explicit-time-choice" && item.value === "09:30-10:00"));
    assert(!signals.some((item) => Object.prototype.hasOwnProperty.call(item, "body") || Object.prototype.hasOwnProperty.call(item, "note")));
  }],
  ["no-history mode, opt-out and reset clear local adaptation history", () => {
    const out = boot(baseState());
    optIn(out);
    assert(record(out, { type: "feedback", source: "explicit-feedback", value: "more_quiet" }).ok);
    assertEqual(out.sandbox.App.setReminderPersonalizationHistoryMode("none", NOW).ok, true);
    assertEqual(reminderState(out).personalization.signals.length, 0);
    assertEqual(record(out, { type: "feedback", source: "explicit-feedback", value: "more_quiet" }).ok, false);
    assertEqual(out.sandbox.App.setReminderPersonalizationOptIn(false, { nowIso: NOW }).ok, true);
    assertEqual(reminderState(out).personalization.optIn, false);
    assertEqual(out.sandbox.App.resetReminderPersonalization(NOW).ok, true);
    assertEqual(reminderState(out).personalization.historyMode, "none");
  }],
  ["three explicit snoozes create only a reversible lower-intensity suggestion", () => {
    const out = boot(baseState(nativeState()));
    optIn(out);
    ["10m", "30m", "1h"].forEach((value) => { const result = record(out, { type: "snooze", source: "explicit-snooze", reminderId: REMINDER_ID, value }); assert(result.ok); });
    const before = JSON.stringify(reminderState(out).preferences[REMINDER_ID]);
    const suggestions = out.sandbox.App.reminderPersonalizationSuggestions();
    assertEqual(suggestions.length, 1);
    assertEqual(suggestions[0].proposedValue, "in_app");
    assertEqual(suggestions[0].source, "explicit-snooze");
    assertEqual(suggestions[0].reversible, true);
    assert(suggestions[0].reason.includes("üç"));
    assertEqual(JSON.stringify(reminderState(out).preferences[REMINDER_ID]), before);
    const applied = out.sandbox.App.applyReminderPersonalizationSuggestion(suggestions[0].id, NOW);
    assertEqual(applied.ok, true);
    assertEqual(reminderState(out).preferences[REMINDER_ID].channel, "in_app");
    assertEqual(reminderState(out).personalization.applied[0].status, "accepted");
    const undone = out.sandbox.App.undoReminderPersonalizationSuggestion(suggestions[0].id, NOW);
    assertEqual(undone.ok, true);
    assertEqual(reminderState(out).preferences[REMINDER_ID].channel, "native");
    assertEqual(reminderState(out).personalization.applied[0].status, "undone");
    assertEqual(out.sandbox.App.dismissReminderPersonalizationSuggestion(suggestions[0].id, NOW).ok, true);
    assertEqual(out.sandbox.App.reminderPersonalizationSuggestions().length, 0);
  }],
  ["explicit quieter feedback can suggest light mode but never exceeds policy guardrails", () => {
    const out = boot(baseState(nativeState()));
    optIn(out);
    assert(record(out, { type: "feedback", source: "explicit-feedback", value: "more_quiet" }).ok);
    const suggestions = out.sandbox.App.reminderPersonalizationSuggestions();
    const quiet = suggestions.find((item) => item.kind === "capacity");
    assert(quiet);
    assertEqual(quiet.proposedValue, "light");
    assertEqual(out.sandbox.App.applyReminderPersonalizationSuggestion(quiet.id, NOW).ok, true);
    assertEqual(reminderState(out).policy.capacityMode, "light");
    const blocked = out.sandbox.App.reminderPolicyEvaluate({ definition: { id: REMINDER_ID, category: "ritual", priority: "P2", defaultChannel: "native" }, preference: { enabled: true, channel: "native" }, context: { localTime: "12:00", permissionState: "granted", capacityMode: "light", nativeDailyCap: 3, nativeBudgetUsed: 0 } });
    assertEqual(blocked.nativeAllowed, false);
    assertEqual(blocked.reason, "capacity-light");
    const capped = out.sandbox.App.reminderPolicyEvaluate({ definition: { id: REMINDER_ID, category: "ritual", priority: "P2", defaultChannel: "native" }, preference: { enabled: true, channel: "native" }, context: { localTime: "12:00", permissionState: "granted", capacityMode: "balanced", nativeDailyCap: 0, nativeBudgetUsed: 0 } });
    assertEqual(capped.nativeAllowed, false);
    assertEqual(capped.reason, "native-daily-cap");
  }],
  ["UI explains opt-in, explicit source, no automatic change and reversibility", () => {
    const out = boot(baseState());
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    assert(out.app.innerHTML.includes("AÇIK SEÇİMLERLE UYARLAMA"));
    assert(out.app.innerHTML.includes("Uyarlama kapalı"));
    assert(out.app.innerHTML.includes("Hiç sinyal tutulmuyor"));
    out.sandbox.App.setReminderPersonalizationOptIn(true, { nowIso: NOW });
    assert(out.app.innerHTML.includes("Otomatik uygulama: her zaman kapalı"));
    assert(out.app.innerHTML.includes("Açık kategori seçimi"));
    assert(out.app.innerHTML.includes("geri alınabilir"));
  }]
]).catch(() => process.exitCode = 1);
