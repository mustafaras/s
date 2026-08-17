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

const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const PRIVATE_ID = "reminder.catalog.v1.therapy";

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
  const counters = { fetches: 0, schedules: 0, lastScheduled: null };
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
    navigator: { vibrate() {}, userAgent: "rem-04-privacy", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
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
  if (opts.withSync) {
    sandbox.SeySync = {
      schedule(payload) { counters.schedules += 1; counters.lastScheduled = JSON.parse(JSON.stringify(payload)); },
      pushNow() { return Promise.resolve(); }
    };
  }
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { data: JSON.parse(localStorage.getItem("seyma-reset-v1")), storage: localStorage, counters, sandbox, error: null };
  } catch (error) {
    return { data: null, storage: localStorage, counters, sandbox, error: error && error.message ? error.message : "REMINDER_PRIVACY_FIXTURE_FAILED" };
  }
}

function privacyState() {
  return {
    version: 2,
    startDate: "2026-08-12",
    lastOpenedDate: "2026-08-12",
    days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    settings: {
      nickname: "REM-04 privacy fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    reminders: {
      schemaVersion: 1,
      preferences: {
        [PRIVATE_ID]: {
          reminderId: PRIVATE_ID,
          enabled: true,
          privacyMode: "private",
          privateDetail: "PRIVATE_DETAIL_FIXTURE",
          therapyNote: "SENSITIVE_NOTE_FIXTURE",
          secretFixture: "SECRET_FIXTURE"
        }
      },
      medications: [{
        id: "reminder.medication.v1.privacy",
        kind: "medication",
        name: "MEDICATION_NAME_FIXTURE",
        privateLabel: "PRIVATE_LABEL_FIXTURE",
        time: "08:00",
        note: "MEDICATION_NOTE_FIXTURE",
        dose: "DOSE_FIXTURE",
        healthText: "HEALTH_TEXT_FIXTURE",
        enabled: false
      }]
    }
  };
}

const deliverySeed = JSON.stringify({ occurrenceId: "local-occurrence", status: "shown" });

runTests([
  ["canonical preference stays local while sync projection is redacted", () => {
    const out = bootAppWithState(privacyState(), {
      withSync: true,
      storageSeed: { [DELIVERY_KEY]: deliverySeed }
    });
    assertEqual(out.error, null);
    assert(out.data.reminders.preferences[PRIVATE_ID].privateDetail === "PRIVATE_DETAIL_FIXTURE");
    assertEqual(out.data.notifications[0].id, "observer-fixture");
    assertEqual(out.data.reminders.medications[0].name, "MEDICATION_NAME_FIXTURE");

    out.sandbox.App.saveNow();

    assert(out.counters.schedules >= 1);
    assert(out.counters.lastScheduled && !Object.prototype.hasOwnProperty.call(out.counters.lastScheduled, "reminders"));
    const remoteFixtureText = JSON.stringify(out.counters.lastScheduled);
    assert(!remoteFixtureText.includes("PRIVATE_DETAIL_FIXTURE"));
    assert(!remoteFixtureText.includes("SENSITIVE_NOTE_FIXTURE"));
    assert(!remoteFixtureText.includes("SECRET_FIXTURE"));
    assert(!remoteFixtureText.includes("MEDICATION_NAME_FIXTURE"));
    assert(!remoteFixtureText.includes("PRIVATE_LABEL_FIXTURE"));
    assert(!remoteFixtureText.includes("MEDICATION_NOTE_FIXTURE"));
    assert(!remoteFixtureText.includes("HEALTH_TEXT_FIXTURE"));
    assert(!Object.prototype.hasOwnProperty.call(out.counters.lastScheduled, "delivery"));
    assert(!Object.prototype.hasOwnProperty.call(out.counters.lastScheduled, "deliveryLog"));

    const localAfterSave = out.storage.getJSON("seyma-reset-v1");
    assert(localAfterSave.reminders.preferences[PRIVATE_ID].privateDetail === "PRIVATE_DETAIL_FIXTURE");
    assert(deepEqual(localAfterSave.notifications, privacyState().notifications));
    assertEqual(out.storage.getItem(DELIVERY_KEY), deliverySeed);
    assertEqual(out.counters.fetches, 0);
  }],
  ["delivery log and observer notifications do not share a state owner", () => {
    const out = bootAppWithState(privacyState(), {
      withSync: true,
      storageSeed: { [DELIVERY_KEY]: deliverySeed }
    });
    assertEqual(out.error, null);
    assert(!Object.prototype.hasOwnProperty.call(out.data, "delivery"));
    assert(!Object.prototype.hasOwnProperty.call(out.data, "deliveryLog"));
    assert(Array.isArray(out.data.notifications));
    assertEqual(out.storage.getItem(DELIVERY_KEY), deliverySeed);
  }],
  ["delivery adapter drops native and private content fields", () => {
    const out = bootAppWithState(privacyState());
    assertEqual(out.error, null);
    out.sandbox.App.reminderDeliveryShow({
      occurrenceId: "privacy-occurrence",
      channel: "native",
      nativeBody: "NATIVE_BODY_SECRET",
      userNote: "USER_NOTE_SECRET",
      therapyText: "THERAPY_TEXT_SECRET",
      medicationName: "MEDICATION_SECRET",
      dose: "DOSE_SECRET",
      now: "2026-08-14T12:00:00.000Z"
    });
    const raw = out.storage.getItem(DELIVERY_KEY);
    ["NATIVE_BODY_SECRET", "USER_NOTE_SECRET", "THERAPY_TEXT_SECRET", "MEDICATION_SECRET", "DOSE_SECRET"].forEach((secret) => assert(!raw.includes(secret)));
    assert(!raw.includes("nativeBody"));
    assert(!raw.includes("userNote"));
    assert(!raw.includes("therapyText"));
    assert(!raw.includes("medicationName"));
    assert(!raw.includes("data.notifications"));
  }],
  ["export summary is aggregate-only and contains no private or secret residue", () => {
    const out = bootAppWithState(privacyState(), {
      storageSeed: {
        [DELIVERY_KEY]: JSON.stringify({ entries: [{ occurrenceId: "private-occurrence", status: "shown", recordedAt: "2026-08-14T12:00:00.000Z", nativeBody: "NATIVE_EXPORT_SECRET", therapyBody: "THERAPY_EXPORT_SECRET" }] }),
        "seyma-reminder-actions-v1": JSON.stringify({ entries: [{ actionId: "private-action", action: "open", status: "completed", reminderId: PRIVATE_ID, recordedAt: "2026-08-14T12:00:00.000Z", medicationDose: "DOSE_EXPORT_SECRET" }] })
      }
    });
    assertEqual(out.error, null);
    const summary = out.sandbox.App.reminderExportSummary({ download: false, nowIso: "2026-08-17T12:00:00.000Z" });
    const text = JSON.stringify(summary);
    [
      "PRIVATE_DETAIL_FIXTURE", "SENSITIVE_NOTE_FIXTURE", "SECRET_FIXTURE", "MEDICATION_NAME_FIXTURE",
      "PRIVATE_LABEL_FIXTURE", "MEDICATION_NOTE_FIXTURE", "HEALTH_TEXT_FIXTURE", "DOSE_FIXTURE",
      "NATIVE_EXPORT_SECRET", "THERAPY_EXPORT_SECRET", "DOSE_EXPORT_SECRET", "ghToken", "openaiKey", "syncUrl"
    ].forEach((secret) => assert(!text.includes(secret)));
    assertEqual(summary.localOnly, true);
    assertEqual(summary.privacyBoundary.rawNote, false);
    assertEqual(summary.privacyBoundary.therapyBody, false);
    assertEqual(summary.privacyBoundary.medicationDose, false);
    assertEqual(summary.privacyBoundary.token, false);
    assertEqual(summary.privacyBoundary.syncSecret, false);
    assert(!Object.prototype.hasOwnProperty.call(summary, "entries"));
    assert(!Object.prototype.hasOwnProperty.call(summary, "preferencesRaw"));
  }]
]).catch(() => process.exitCode = 1);
