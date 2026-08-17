"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const DATE = "2026-08-13";
const PREVIOUS_DATE = "2026-08-12";
const PRAYER_ID = "reminder.catalog.v1.prayer";

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

function bootAppWithState(seedData, options) {
  const opts = options || {};
  const counters = { fetches: 0 };
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const elements = { app, root };
  const store = Object.assign({}, opts.storageSeed || {}, { "seyma-reset-v1": JSON.stringify(seedData) });
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return elements[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document,
    navigator: { vibrate() {}, userAgent: "rem-04-migration", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { counters.fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-04-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-04"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { data: JSON.parse(localStorage.getItem("seyma-reset-v1")), storage: localStorage, counters, sandbox, error: null };
  } catch (error) {
    return { data: null, storage: localStorage, counters, sandbox, error: error && error.message ? error.message : "REMINDER_MIGRATION_FIXTURE_FAILED" };
  }
}

function baseState(extra) {
  return Object.assign({
    version: 2,
    startDate: PREVIOUS_DATE,
    lastOpenedDate: PREVIOUS_DATE,
    days: {},
    notifications: [{ id: "aeon-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    settings: {
      nickname: "REM-04 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto"
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    __reminderFixture: { owner: "test", nested: { keep: true } }
  }, extra || {});
}

function richState() {
  return baseState({
    days: {
      [PREVIOUS_DATE]: {
        mood: "calm",
        note: "DAY_NOTE_SENTINEL",
        prayer: { fajr: { status: "jamaat", note: "PRAYER_SENTINEL" }, futurePrayerField: "keep" },
        zikr: { totalCount: 5, futureZikrDayField: "keep" },
        futureDayField: { keep: true }
      }
    },
    profileAssessment: {
      schemaVersion: 2,
      status: "active",
      responses: { futureItem: { value: 4, keep: true } },
      futureProfileField: "keep"
    },
    zikr: {
      schemaVersion: 4,
      presets: [{ id: "fixture-preset", name: "Fixture", phrase: "fixture", target: 33 }],
      futureZikrField: "keep"
    },
    reminders: {
      schemaVersion: 0,
      futureRootField: { keep: true },
      preferences: {
        [PRAYER_ID]: {
          reminderId: "wrong-owner-must-normalize",
          enabled: true,
          privacyMode: "private",
          daysOfWeek: [4, 1, 1, 7, "malformed"],
          timeWindow: { start: "07:00", end: "25:99", futureWindowField: "keep" },
          offsetMinutes: 15,
          timezone: "Europe/Istanbul",
          channel: "in_app",
          quietHoursBehavior: "defer",
          maxPerDay: 2,
          snoozeOptions: ["10m", "bad-option", "30m"],
          lastEditedAt: "2026-08-13T08:00:00.000Z",
          futurePreferenceField: { keep: true }
        }
      }
    }
  });
}

runTests([
  ["minimal state receives additive reminder root", () => {
    const out = bootAppWithState(baseState());
    assertEqual(out.error, null);
    assert(out.data && out.data.reminders);
    assertEqual(out.data.reminders.schemaVersion, 1);
    assert(deepEqual(out.data.reminders.preferences, {}));
    assert(out.data.__reminderFixture.nested.keep === true);
    assert(!Object.prototype.hasOwnProperty.call(out.data, "reminderDelivery"));
  }],
  ["rich preference is normalized without losing old state", () => {
    const out = bootAppWithState(richState());
    const data = out.data;
    const preference = data && data.reminders && data.reminders.preferences[PRAYER_ID];
    assertEqual(out.error, null);
    assert(preference && data.reminders.futureRootField.keep === true);
    assertEqual(preference.reminderId, PRAYER_ID);
    assertEqual(preference.enabled, true);
    assertEqual(preference.privacyMode, "private");
    assert(deepEqual(preference.daysOfWeek, [1, 4]));
    assertEqual(preference.timeWindow.start, "07:00");
    assert(!Object.prototype.hasOwnProperty.call(preference.timeWindow, "end"));
    assertEqual(preference.timeWindow.futureWindowField, "keep");
    assertEqual(preference.timezone, "Europe/Istanbul");
    assert(deepEqual(preference.snoozeOptions, ["10m", "30m"]));
    assert(preference.futurePreferenceField.keep === true);
    assert(data.days[PREVIOUS_DATE].prayer.fajr.note === "PRAYER_SENTINEL");
    assert(data.days[PREVIOUS_DATE].prayer.futurePrayerField === "keep");
    assert(data.days[PREVIOUS_DATE].zikr.futureZikrDayField === "keep");
    assert(data.profileAssessment.responses.futureItem.keep === true);
    assert(data.profileAssessment.futureProfileField === "keep");
    assert(data.zikr.futureZikrField === "keep");
  }],
  ["malformed reminder state gets privacy-safe defaults", () => {
    const malformed = baseState({
      reminders: {
        schemaVersion: "bad",
        preferences: {
          [PRAYER_ID]: {
            enabled: "yes",
            privacyMode: "toString",
            daysOfWeek: "bad",
            timeWindow: [],
            offsetMinutes: "15",
            timezone: "Not/IANA",
            channel: "toString",
            quietHoursBehavior: "toString",
            maxPerDay: 999,
            snoozeOptions: "10m",
            lastEditedAt: "not-a-date",
            unknownField: "preserve"
          }
        },
        futureRootField: "preserve"
      },
      days: {},
      settings: null
    });
    const out = bootAppWithState(malformed);
    const preference = out.data && out.data.reminders && out.data.reminders.preferences[PRAYER_ID];
    assertEqual(out.error, null);
    assertEqual(out.data.reminders.schemaVersion, 1);
    assert(preference && preference.enabled === false && preference.privacyMode === "private");
    ["daysOfWeek", "timeWindow", "offsetMinutes", "timezone", "channel", "quietHoursBehavior", "maxPerDay", "snoozeOptions", "lastEditedAt"].forEach((field) => {
      assert(!Object.prototype.hasOwnProperty.call(preference, field));
    });
    assertEqual(preference.unknownField, "preserve");
    assertEqual(out.data.reminders.futureRootField, "preserve");
    assert(out.data.settings && typeof out.data.settings === "object");
    assert(out.data.days && typeof out.data.days === "object");
  }],
  ["delivery log stays outside canonical data migration", () => {
    const out = bootAppWithState(baseState(), {
      storageSeed: {
        "seyma-reminder-delivery-v1": JSON.stringify({ occurrenceId: "local-only", status: "shown" })
      }
    });
    assertEqual(out.error, null);
    assert(!Object.prototype.hasOwnProperty.call(out.data, "delivery"));
    assert(!Object.prototype.hasOwnProperty.call(out.data, "deliveryLog"));
    assertEqual(out.storage.getItem("seyma-reminder-delivery-v1"), JSON.stringify({ occurrenceId: "local-only", status: "shown" }));
  }],
  ["second migration has deep parity", () => {
    const first = bootAppWithState(richState());
    const second = bootAppWithState(first.data);
    assertEqual(first.error, null);
    assertEqual(second.error, null);
    assert(deepEqual(first.data.reminders, second.data.reminders));
    assert(deepEqual(first.data.days[PREVIOUS_DATE].prayer, second.data.days[PREVIOUS_DATE].prayer));
    assert(deepEqual(first.data.profileAssessment.responses, second.data.profileAssessment.responses));
    assert(deepEqual(first.data.zikr, second.data.zikr));
  }]
]).catch(() => process.exitCode = 1);
