"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const TIMEZONE = "Europe/Istanbul";
const NOW = "2026-08-13T09:00:00.000Z";

function node(id) {
  return {
    id: id || "", _html: "", style: { cssText: "", setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, dataset: {}, children: [], scrollTop: 0, value: "", parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); }, get textContent() { return this._html; }, set textContent(value) { this._html = String(value); },
    setAttribute() {}, getAttribute() { return null; }, appendChild(child) { child.parentNode = this; this.children.push(child); return child; }, removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; }, replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; }
  };
}

function boot(seed) {
  const app = node("app");
  const root = node("root");
  const state = Object.assign({
    version: 2, startDate: "2026-08-13", lastOpenedDate: "2026-08-13", days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {}, policy: { quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0, capacityMode: "balanced" } },
    settings: { nickname: "REM-21 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", prayer: { hijriOffset: 0 }, auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: "2026-08-13T08:00:00.000Z" } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  }, seed || {});
  const store = { "seyma-reset-v1": JSON.stringify(state) };
  const localStorage = { getItem(key) { return store[key] || null; }, setItem(key, value) { store[key] = String(value); }, removeItem(key) { delete store[key]; }, clear() {} };
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  const document = { hidden: false, body: node("body"), documentElement: root, getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return node(""); }, createDocumentFragment() { return node(""); }, addEventListener() {}, removeEventListener() {} };
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { userAgent: "rem-21-special-days-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} }, matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-21-special-uuid"; } }, URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-21"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["hijriCalendar.js", "profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file }));
  sandbox.App.start();
  return { sandbox, App: sandbox.App, store, app };
}

function shiftDate(date, delta) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + delta)).toISOString().slice(0, 10);
}

function findHolyDay(sandbox) {
  for (let day = 1; day <= 365; day += 1) {
    const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
    const label = sandbox.HijriCalendarV1.holyDay(date);
    if (label) return { date, label };
  }
  throw new Error("REMINDER_SPECIAL_FIXTURE_NO_HOLY_DAY");
}

function findOrdinaryDay(sandbox, excluded) {
  for (let day = 1; day <= 365; day += 1) {
    const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
    if (date !== excluded && !sandbox.HijriCalendarV1.holyDay(date)) return date;
  }
  throw new Error("REMINDER_SPECIAL_FIXTURE_NO_ORDINARY_DAY");
}

function occurrence(App, specialDays, localDate, offsetDays) {
  return App.reminderSpecialDayOccurrence({
    specialDays, localDate, nowLocalDate: localDate, nowLocalTime: "12:00", instantIso: NOW,
    timezone: TIMEZONE, offsetDays
  });
}

runTests([
  ["migration keeps special-day reminders opt-in with native off", () => {
    const out = boot();
    const preference = out.App.reminderSpecialDaysPreference();
    assertEqual(preference.mode, "none");
    assertEqual(preference.channel, "in_app");
    assertEqual(preference.selectedDays.length, 0);
    const def = out.App.reminderSpecialDayDefinition();
    const policy = out.App.reminderPolicyEvaluate({ definition: def, preference: out.App.reminderSpecialDayPolicyPreference(preference), context: { localTime: "12:00", permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0 } });
    assertEqual(policy.requestedChannel, "in_app");
    assertEqual(policy.nativeAllowed, false);
    assertEqual(out.App.reminderSpecialDayLifecycleCandidates({ context: { localDate: "2026-01-31", localTime: "12:00", timezone: TIMEZONE, nowIso: NOW }, hijriOffset: 0 }).length, 0);
  }],
  ["all / selected / none modes control occurrence creation", () => {
    const out = boot();
    const holy = findHolyDay(out.sandbox);
    const ordinary = findOrdinaryDay(out.sandbox, holy.date);
    const all = { mode: "all", selectedDays: [], time: "10:00", timezone: TIMEZONE, channel: "in_app" };
    assertEqual(occurrence(out.App, all, holy.date, 0).specialDayLabel, holy.label);
    assertEqual(occurrence(out.App, all, ordinary, 0).ok, false);
    const option = out.App.reminderSpecialDayOptions().find((item) => item.label === holy.label);
    assert(option && option.id);
    const selected = Object.assign({}, all, { mode: "selected", selectedDays: [option.id] });
    assertEqual(occurrence(out.App, selected, holy.date, 0).ok, true);
    const other = out.App.reminderSpecialDayOptions().find((item) => item.id !== option.id);
    assert(other && occurrence(out.App, Object.assign({}, selected, { selectedDays: [other.id] }), holy.date, 0).reason === "outside-selected-days");
    assertEqual(occurrence(out.App, Object.assign({}, all, { mode: "none" }), holy.date, 0).reason, "preference-not-selected");
  }],
  ["offset -2, 0 and +2 resolve the same source day without rewriting HijriCalendarV1", () => {
    const out = boot();
    const holy = findHolyDay(out.sandbox);
    const specialDays = { mode: "all", selectedDays: [], time: "10:00", timezone: TIMEZONE, channel: "in_app" };
    const minus = occurrence(out.App, specialDays, shiftDate(holy.date, 2), -2);
    const zero = occurrence(out.App, specialDays, holy.date, 0);
    const plus = occurrence(out.App, specialDays, shiftDate(holy.date, -2), 2);
    assertEqual(minus.ok, true); assertEqual(zero.ok, true); assertEqual(plus.ok, true);
    assertEqual(minus.specialDayLabel, holy.label); assertEqual(zero.specialDayLabel, holy.label); assertEqual(plus.specialDayLabel, holy.label);
    assertEqual(minus.occurrence.hijriOffset, -2); assertEqual(zero.occurrence.hijriOffset, 0); assertEqual(plus.occurrence.hijriOffset, 2);
    assertEqual(minus.occurrence.localDate, shiftDate(holy.date, 2)); assertEqual(plus.occurrence.localDate, shiftDate(holy.date, -2));
    assertEqual(minus.occurrence.timezone, TIMEZONE); assertEqual(plus.occurrence.timezone, TIMEZONE);
  }],
  ["native opt-in still obeys quiet hours and daily budget", () => {
    const out = boot();
    out.App.setReminderSpecialDaysMode("all");
    const inApp = out.App.reminderSpecialDaysPreference();
    const def = out.App.reminderSpecialDayDefinition();
    const native = out.App.reminderSpecialDayPolicyPreference(Object.assign({}, inApp, { channel: "native" }));
    const holy = findHolyDay(out.sandbox);
    assertEqual(out.App.reminderSpecialDayLifecycleCandidates({ context: { localDate: holy.date, localTime: "12:00", timezone: TIMEZONE, nowIso: NOW } }).length, 1);
    out.App.reminderDisable("reminder.special.v1.hijri");
    assertEqual(out.App.reminderSpecialDayLifecycleCandidates({ context: { localDate: holy.date, localTime: "12:00", timezone: TIMEZONE, nowIso: NOW } }).length, 0);
    const allowed = out.App.reminderPolicyEvaluate({ definition: def, preference: native, context: { localTime: "12:00", permissionState: "granted", nativeDailyCap: 3, lowPriorityNativeCap: 1, lowPriorityNativeUsed: 0, sameCategoryCooldownMinutes: 0 } });
    assertEqual(allowed.nativeAllowed, true); assertEqual(allowed.channel, "native");
    const quiet = out.App.reminderPolicyEvaluate({ definition: def, preference: native, context: { localTime: "23:00", permissionState: "granted", quietHours: { start: "22:30", end: "07:30" }, nativeDailyCap: 3, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0 } });
    assertEqual(quiet.nativeAllowed, false); assert(quiet.reason.indexOf("quiet-hours") >= 0);
    const budget = out.App.reminderPolicyEvaluate({ definition: def, preference: native, context: { localTime: "12:00", permissionState: "granted", nativeDailyCap: 0, lowPriorityNativeCap: 1, sameCategoryCooldownMinutes: 0 } });
    assertEqual(budget.nativeAllowed, false); assertEqual(budget.reason, "native-daily-cap");
  }],
  ["copy is optional and non-commercial / non-scoring", () => {
    const out = boot();
    const def = out.App.reminderSpecialDayDefinition();
    const copy = [def.privateTitle, def.privateBody, "Şeyma’da küçük bir durak hazır", "İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin."].join(" ").toLocaleLowerCase("tr-TR");
    assert(!/zorunlu|puan|skor|ticari|satın/.test(copy));
    assertEqual(def.defaultChannel, "in_app");
  }]
]).catch(() => { process.exitCode = 1; });
