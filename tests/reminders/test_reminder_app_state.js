"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  assert,
  assertEqual,
  deepClone,
  deepEqual,
  runTests
} = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const DATE = "2026-08-17";
const NOW = "2026-08-17T09:00:00.000Z";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const REMINDER_ID = "reminder.catalog.v1.prayer";

function element(id) {
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

function baseState(extra) {
  return Object.assign({
    version: 2,
    startDate: DATE,
    lastOpenedDate: DATE,
    days: {},
    notifications: [{ id: "aeon-safe", kind: "observer", message: "safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    settings: {
      nickname: "REM-45 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    __rem45Future: { keep: true }
  }, extra || {});
}

function boot(seed, storageSeed) {
  const store = Object.assign({}, storageSeed || {}, { "seyma-reset-v1": JSON.stringify(seed) });
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    _store: store
  };
  const app = element("app");
  const root = element("root");
  const elements = { app, root };
  const document = {
    hidden: false,
    body: element("body"),
    documentElement: root,
    getElementById(id) { return elements[id] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return element(""); },
    createDocumentFragment() { return element(""); },
    addEventListener() {},
    removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: element("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const sandbox = {
    console,
    localStorage,
    document,
    navigator: { vibrate() {}, userAgent: "rem-45-state", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-45-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-45"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { data: JSON.parse(localStorage.getItem("seyma-reset-v1")), storage: localStorage, sandbox, error: null };
  } catch (error) {
    return { data: null, storage: localStorage, sandbox, error: error && error.message ? error.message : "REMINDER_APP_STATE_FIXTURE_FAILED" };
  }
}

runTests([
  ["owner contract separates preference, definition, occurrence, delivery and suppression", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    const contract = out.sandbox.App.reminderStateContract();
    assertEqual(contract.preference.owner, "data.reminders.preferences");
    assertEqual(contract.definition.owner, "ReminderCatalogV1");
    assertEqual(contract.occurrence.persisted, false);
    assertEqual(contract.suppression.persisted, false);
    assertEqual(contract.deliveryJournal.storage, `localStorage:${DELIVERY_KEY}`);
    assertEqual(contract.deliveryJournal.sync, "never");
    assert(contract.syncGate.blockedRoots.includes("reminders"));
    assert(contract.syncGate.blockedRoots.includes("deliveryLog"));
    assert(out.data.reminders && out.data.reminders.preferences);
    ["occurrence", "deliveryJournal", "suppression"].forEach((field) => {
      assert(!Object.prototype.hasOwnProperty.call(out.data.reminders, field));
    });
    const definitions = out.sandbox.ReminderCatalogV1.list();
    assert(definitions.length > 0 && definitions.every((definition) => typeof definition.definitionVersion === "string" && definition.definitionVersion));
  }],
  ["minimal, partial and malformed saves migrate additively without importing journals", () => {
    const out = boot(baseState({
      reminders: [],
      delivery: { occurrenceId: "LEGACY_DELIVERY_SECRET" },
      deliveryLog: [{ occurrenceId: "LEGACY_DELIVERY_SECRET" }],
      days: { [DATE]: { mood: "calm", futureDayField: { keep: true } } },
      settings: null
    }), {
      [DELIVERY_KEY]: JSON.stringify({ entries: [{ occurrenceId: "local-only", status: "shown" }] })
    });
    assertEqual(out.error, null);
    assert(out.data.reminders && out.data.reminders.preferences);
    assert(out.data.days[DATE].futureDayField.keep === true);
    assert(out.data.__rem45Future.keep === true);
    ["delivery", "deliveryLog", "reminderDelivery", "reminderHistory", "notificationDelivery"].forEach((field) => {
      assert(!Object.prototype.hasOwnProperty.call(out.data, field));
    });
    assertEqual(out.storage.getItem(DELIVERY_KEY), JSON.stringify({ entries: [{ occurrenceId: "local-only", status: "shown" }] }));
  }],
  ["rich preference keeps unknown fields and canonicalizes timestamps", () => {
    const out = boot(baseState({
      reminders: {
        schemaVersion: 0,
        preferences: {
          [REMINDER_ID]: {
            reminderId: "wrong-owner",
            enabled: true,
            privacyMode: "private",
            lastEditedAt: "2026-08-17T12:00:00+03:00",
            futurePreferenceField: { keep: true }
          }
        },
        _localMeta: { preferences: "2026-08-17T12:00:00+03:00" },
        futureRootField: { keep: true }
      }})
    );
    assertEqual(out.error, null);
    const root = out.data.reminders;
    const preference = root.preferences[REMINDER_ID];
    assertEqual(preference.reminderId, REMINDER_ID);
    assertEqual(preference.lastEditedAt, "2026-08-17T09:00:00.000Z");
    assertEqual(root._localMeta.preferences, "2026-08-17T09:00:00.000Z");
    assert(preference.futurePreferenceField.keep === true);
    assert(root.futureRootField.keep === true);
  }],
  ["second migration has deep parity and timestamp stability", () => {
    const first = boot(baseState({
      reminders: {
        preferences: {
          [REMINDER_ID]: { enabled: true, lastEditedAt: "2026-08-17T12:00:00+03:00", future: { keep: true } }
        },
        _localMeta: { preferences: "2026-08-17T12:00:00+03:00" },
        futureRoot: "keep"
      }
    }));
    const second = boot(first.data);
    assertEqual(first.error, null);
    assertEqual(second.error, null);
    assert(deepEqual(first.data.reminders, second.data.reminders));
    assertEqual(second.data.reminders.preferences[REMINDER_ID].lastEditedAt, "2026-08-17T09:00:00.000Z");
    assertEqual(second.data.reminders._localMeta.preferences, "2026-08-17T09:00:00.000Z");
    assert(second.data.reminders.preferences[REMINDER_ID].future.keep === true);
    assertEqual(second.data.reminders.futureRoot, "keep");
  }],
  ["ui mute state remains ephemeral and does not enter persisted reminder state", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    const before = deepClone(out.data);
    out.sandbox.App.reminderInboxMuteToday();
    const after = JSON.parse(out.storage.getItem("seyma-reset-v1"));
    assert(deepEqual(after, before));
    assert(!Object.prototype.hasOwnProperty.call(after.reminders, "todayMuted"));
    assert(!Object.prototype.hasOwnProperty.call(after.reminders, "inboxTodayMuted"));
  }],
  ["privacy gate removes user-owned reminder detail before sync projection", () => {
    const out = boot(baseState({
      reminders: {
        preferences: { [REMINDER_ID]: { enabled: true, privateNote: "PRIVATE_REMINDER_DETAIL" } },
        medications: [{ id: "reminder.medication.v1.fixture", name: "PRIVATE_MEDICATION", time: "08:00" }]
      },
      delivery: { occurrenceId: "PRIVATE_OCCURRENCE" },
      deliveryLog: [{ occurrenceId: "PRIVATE_OCCURRENCE" }]
    }));
    const input = deepClone(out.data);
    const projection = out.sandbox.App.reminderSyncPayload(input);
    assert(projection && !Object.prototype.hasOwnProperty.call(projection, "reminders"));
    ["delivery", "deliveryLog", "reminderDelivery", "reminderHistory", "notificationDelivery"].forEach((field) => {
      assert(!Object.prototype.hasOwnProperty.call(projection, field));
    });
    assert(!JSON.stringify(projection).includes("PRIVATE_REMINDER_DETAIL"));
    assert(!JSON.stringify(projection).includes("PRIVATE_MEDICATION"));
    assert(!JSON.stringify(projection).includes("PRIVATE_OCCURRENCE"));
    assert(deepEqual(input, out.data));
    assertEqual(out.sandbox.App.reminderSyncPayload([]), null);
  }]
]).catch(() => { process.exitCode = 1; });
