"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";

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
    settings: { nickname: "REM-07 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(seed) {
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const store = { "seyma-reset-v1": JSON.stringify(seed) };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); }, addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-07-policy-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {}, crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-07-policy-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-07"; }, revokeObjectURL() {} }), URLSearchParams,
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

const definition = { id: "r-policy", category: "ritual", priority: "P2", defaultChannel: "native" };
const enabledNative = { enabled: true, channel: "native" };
const daytime = { localTime: "12:00", permissionState: "granted", nativeDailyCap: 3, nativeBudgetUsed: 0 };
function evaluate(out, priority, preference, context, category) {
  return out.sandbox.App.reminderPolicyEvaluate({
    definition: Object.assign({}, definition, { priority, category: category || definition.category }),
    preference: preference || enabledNative,
    context: Object.assign({}, daytime, context || {})
  });
}

runTests([
  ["pure policy block has no browser, network, clock or persistence dependency", () => {
    const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
    const start = source.indexOf("// ── REM-07 Pure reminder policy ──");
    const end = source.indexOf("function migrateReminderState", start);
    assert(start >= 0 && end > start);
    const pureBlock = source.slice(start, end);
    ["document", "localStorage", "fetch", "Notification", "new Date", "Date.now"].forEach((forbidden) => assert(!pureBlock.includes(forbidden)));
  }],
  ["policy defaults are explicit and migrated as user preference", () => {
    const out = boot(baseState({ schemaVersion: 1, preferences: {}, policy: { dailyCap: 5, quietHours: { start: "broken", end: "08:00" }, futurePolicyField: { keep: true } } }));
    const defaults = out.sandbox.App.reminderPolicyDefaults();
    assertEqual(defaults.quietHours.start, "22:30");
    assertEqual(defaults.quietHours.end, "07:30");
    assertEqual(defaults.nativeDailyCap, 3);
    assertEqual(defaults.lowPriorityNativeCap, 1);
    assertEqual(defaults.sameCategoryCooldownMinutes, 360);
    assertEqual(defaults.capacityMode, "balanced");
    const policy = out.sandbox.App.reminderPolicyForState();
    assertEqual(policy.nativeDailyCap, 5);
    assertEqual(policy.quietHours.start, "22:30");
    assertEqual(policy.quietHours.end, "08:00");
    assert(policy.futurePolicyField.keep === true);
  }],
  ["priority matrix keeps P0 only for a real required action", () => {
    const out = boot(baseState());
    const p0 = evaluate(out, "P0", { enabled: true, channel: "native" }, { actionRequired: true });
    assertEqual(p0.allowed, true); assertEqual(p0.nativeAllowed, true); assertEqual(p0.channel, "native");
    const quietP0 = evaluate(out, "P0", { enabled: true, channel: "native" }, { actionRequired: true, localTime: "23:00" });
    assertEqual(quietP0.allowed, true); assertEqual(quietP0.nativeAllowed, false); assertEqual(quietP0.channel, "in_app");
    const unnecessaryP0 = evaluate(out, "P0", { enabled: true, channel: "native" }, { actionRequired: false });
    assertEqual(unnecessaryP0.allowed, false); assertEqual(unnecessaryP0.reason, "p0-not-required");
    const p1 = evaluate(out, "P1", { enabled: true, channel: "native", explicitlySelected: true }, { explicitlySelected: true });
    assertEqual(p1.nativeAllowed, true);
    const p2 = evaluate(out, "P2", enabledNative);
    assertEqual(p2.nativeAllowed, true);
    const p3 = evaluate(out, "P3", { enabled: true, channel: "in_app" });
    assertEqual(p3.allowed, true); assertEqual(p3.nativeAllowed, false); assertEqual(p3.channel, "in_app");
  }],
  ["capacity modes are user-selected and never infer a diagnosis", () => {
    const out = boot(baseState());
    const lightP2 = evaluate(out, "P2", enabledNative, { capacityMode: "light", explicitlySelected: false });
    assertEqual(lightP2.allowed, false); assertEqual(lightP2.reason, "capacity-light");
    const lightP1 = evaluate(out, "P1", { enabled: true, channel: "native" }, { capacityMode: "light", explicitlySelected: true });
    assertEqual(lightP1.nativeAllowed, true);
    const silentP2 = evaluate(out, "P2", enabledNative, { capacityMode: "silent" });
    assertEqual(silentP2.allowed, false); assertEqual(silentP2.reason, "capacity-silent");
    const ritualSupport = evaluate(out, "P2", enabledNative, { capacityMode: "ritual", selectedCategory: "ritual" }, "support");
    assertEqual(ritualSupport.allowed, false); assertEqual(ritualSupport.grouped, true);
    const ritualSelected = evaluate(out, "P2", enabledNative, { capacityMode: "ritual", selectedCategory: "support" }, "support");
    assertEqual(ritualSelected.nativeAllowed, true);
  }],
  ["quiet, cooldown, permission and budget fall back to in-app without native occurrence", () => {
    const out = boot(baseState());
    const quiet = evaluate(out, "P2", enabledNative, { localTime: "22:30" });
    assertEqual(quiet.allowed, true); assertEqual(quiet.nativeAllowed, false); assertEqual(quiet.nativeOccurrence, false); assertEqual(quiet.channel, "in_app");
    const cooldown = evaluate(out, "P2", enabledNative, { recentCategoryDeliveries: [{ category: "ritual", minutesAgo: 120 }] });
    assertEqual(cooldown.nativeAllowed, false); assertEqual(cooldown.reason, "category-cooldown"); assert(cooldown.cooldownRemainingMinutes > 0);
    const budget = evaluate(out, "P2", enabledNative, { nativeBudgetUsed: 3 });
    assertEqual(budget.nativeAllowed, false); assertEqual(budget.reason, "native-daily-cap"); assertEqual(budget.nativeOccurrence, false);
    const remainingBudget = evaluate(out, "P2", enabledNative, { dailyBudgetRemaining: 0 });
    assertEqual(remainingBudget.nativeAllowed, false); assertEqual(remainingBudget.budgetRemaining, 0);
    const lowBudget = evaluate(out, "P2", enabledNative, { lowPriorityNativeUsed: 1 });
    assertEqual(lowBudget.nativeAllowed, false); assertEqual(lowBudget.reason, "low-priority-native-cap");
    const denied = evaluate(out, "P2", enabledNative, { permissionState: "denied" });
    assertEqual(denied.allowed, true); assertEqual(denied.nativeAllowed, false); assertEqual(denied.reason, "permission-denied");
  }],
  ["completion signals are neutral and cannot create punishment or alarm", () => {
    const out = boot(baseState());
    const plain = evaluate(out, "P2", enabledNative, {});
    const incomplete = evaluate(out, "P2", enabledNative, { completedSignals: { "r-policy": false }, incomplete: true });
    assert(deepEqual(plain, incomplete));
    assertEqual(incomplete.punitive, false); assertEqual(incomplete.alarm, false); assertEqual(incomplete.completionNeutral, true);
  }],
  ["native candidate selection is deterministic and caps at three", () => {
    const out = boot(baseState());
    const result = out.sandbox.App.reminderSelectNativeCandidates({ nativeDailyCap: 3, candidates: [
      { id: "p3", policy: { id: "p3", priority: "P3", nativeAllowed: true, requestedChannel: "native" } },
      { id: "p1", policy: { id: "p1", priority: "P1", nativeAllowed: true, requestedChannel: "native" } },
      { id: "p0", policy: { id: "p0", priority: "P0", nativeAllowed: true, requestedChannel: "native" } },
      { id: "p2", policy: { id: "p2", priority: "P2", nativeAllowed: true, requestedChannel: "native" } }
    ] });
    assertEqual(result.selected.length, 3);
    assert(deepEqual(result.selected.map((item) => item.id), ["p0", "p1", "p2"]));
    assertEqual(result.remaining, 0);
    assertEqual(result.rejected.length, 1);
  }],
  ["app adapter persists policy choices without changing reminder preferences", () => {
    const out = boot(baseState({ schemaVersion: 1, preferences: { keep: { reminderId: "keep", enabled: true, channel: "in_app", future: true } } }));
    out.sandbox.App.go("ayarlar");
    out.sandbox.App.openReminderCenter();
    out.sandbox.App.setReminderCapacityMode("silent");
    out.sandbox.App.setReminderQuietHours("21:15", "08:15");
    out.sandbox.App.setReminderNativeDailyCap(2);
    out.sandbox.App.setReminderSameCategoryCooldown(180);
    const stored = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(stored.reminders.policy.capacityMode, "silent");
    assertEqual(stored.reminders.policy.quietHours.start, "21:15");
    assertEqual(stored.reminders.policy.quietHours.end, "08:15");
    assertEqual(stored.reminders.policy.nativeDailyCap, 2);
    assertEqual(stored.reminders.policy.sameCategoryCooldownMinutes, 180);
    assert(stored.reminders.preferences.keep.future === true);
    assert(out.app.innerHTML.includes("Sessiz"));
    assert(out.app.innerHTML.includes("21:15–08:15"));
  }]
]).catch(() => process.exitCode = 1);
