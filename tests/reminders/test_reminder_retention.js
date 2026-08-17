"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, deepEqual, runTests } = require("./helpers/reminder-test-helper");

const NOW = "2026-08-17T12:00:00.000Z";
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const ACTION_KEY = "seyma-reminder-actions-v1";
const PERMISSION_KEY = "seyma-reminder-permission-v1";

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

function baseState(overrides) {
  return Object.assign({
    version: 2,
    startDate: "2026-08-12",
    lastOpenedDate: "2026-08-17",
    days: { "2026-08-12": { note: "daily-note-stays-outside-reminder-reset" } },
    notifications: [],
    settings: { nickname: "REM-39 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    reminders: {
      schemaVersion: 1,
      preferences: {
        "reminder.catalog.v1.prayer": { reminderId: "reminder.catalog.v1.prayer", enabled: true, channel: "in_app" }
      },
      policy: { careNativeCategories: ["care"], careMovementOptIn: true },
      medications: [{ id: "reminder.medication.v1.fixture", name: "private-name", dose: "private-dose", time: "08:00", enabled: true }]
    }
  }, overrides || {});
}

function boot(seed, options) {
  const opts = options || {};
  const app = fixtureElement("app");
  const root = fixtureElement("root");
  const elements = { app, root };
  const store = Object.assign({}, opts.storageSeed || {}, { "seyma-reset-v1": JSON.stringify(seed) });
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root, activeElement: null,
    getElementById(id) { return elements[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub {
    parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  let confirmResult = opts.confirmResult !== false;
  const sandbox = {
    console, localStorage, document, DOMParser: DOMParserStub,
    navigator: { vibrate() {}, userAgent: "rem-39-retention", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    fetch() { throw new Error("REMINDER_TEST_NETWORK_DISABLED"); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-39-fixture-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-39"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return confirmResult; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.setConfirmResult = (value) => { confirmResult = value === true; };
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
    return { sandbox, storage: localStorage, app, error: null };
  } catch (error) {
    return { sandbox, storage: localStorage, app, error: error && error.message ? error.message : "REMINDER_RETENTION_FIXTURE_FAILED" };
  }
}

function privateReminderState() {
  return baseState({
    reminders: {
      schemaVersion: 1,
      preferences: {
        "reminder.catalog.v1.prayer": { reminderId: "reminder.catalog.v1.prayer", enabled: true, channel: "native" }
      },
      policy: { careNativeCategories: ["care"], careMovementOptIn: true },
      medications: [{ id: "reminder.medication.v1.fixture", name: "private-name", dose: "private-dose", note: "private-note", time: "08:00", enabled: true }]
    }
  });
}

runTests([
  ["retention policy is explicit and malformed local logs get safe defaults", () => {
    const out = boot(baseState({ reminders: null }), {
      storageSeed: { [DELIVERY_KEY]: "{malformed", [ACTION_KEY]: "[]", [PERMISSION_KEY]: "secret" }
    });
    assertEqual(out.error, null);
    const policy = out.sandbox.App.reminderRetentionPolicy();
    assertEqual(policy.schemaVersion, 1);
    assertEqual(policy.preference.mode, "until-cleared");
    assertEqual(policy.occurrence.maxAgeDays, 1);
    assertEqual(policy.deliveryJournal.maxAgeDays, 30);
    assertEqual(policy.deliveryJournal.maxEntries, 200);
    assertEqual(policy.notificationHistory.maxAgeDays, 14);
    assertEqual(policy.notificationHistory.maxEntries, 100);
    assertEqual(policy.digest.maxAgeDays, 7);
    assertEqual(out.sandbox.App.reminderDeliveryLoad(NOW).entries.length, 0);
    assertEqual(out.sandbox.App.reminderActionState(NOW).entries.length, 0);
    assert(out.storage.getItem(DELIVERY_KEY).includes('"schemaVersion":2'));
    assert(out.storage.getItem(ACTION_KEY).includes('"schemaVersion":1'));
    assert(deepEqual(out.sandbox.App.reminderRetentionSummary({ download: false, nowIso: NOW }).retention, policy));
  }],
  ["delivery and notification journals are deterministically bounded", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    const deliveryEntries = Array.from({ length: 205 }, (_, index) => ({
      occurrenceId: `retention-${index}`,
      status: "shown",
      recordedAt: new Date(Date.parse(NOW) - index * 60 * 60 * 1000).toISOString()
    }));
    const boundedDelivery = out.sandbox.App.reminderDeliveryNormalize({ entries: deliveryEntries }, NOW);
    assertEqual(boundedDelivery.entries.length, 200);
    assert(boundedDelivery.entries.some((entry) => entry.occurrenceId === "retention-0"));
    assert(!boundedDelivery.entries.some((entry) => entry.occurrenceId === "retention-204"));

    const actionEntries = Array.from({ length: 105 }, (_, index) => ({
      actionId: `action-${index}`,
      action: "open",
      status: "completed",
      reminderId: "reminder.catalog.v1.prayer",
      recordedAt: new Date(Date.parse(NOW) - index * 60 * 60 * 1000).toISOString()
    }));
    out.storage.setItem(ACTION_KEY, JSON.stringify({ entries: actionEntries }));
    const boundedActions = out.sandbox.App.reminderActionState(NOW);
    assertEqual(boundedActions.entries.length, 100);
    assert(boundedActions.entries.some((entry) => entry.actionId === "action-0"));
    assert(!boundedActions.entries.some((entry) => entry.actionId === "action-104"));
  }],
  ["clear uses a tombstone boundary and blocks old occurrence replay", () => {
    const out = boot(baseState());
    assertEqual(out.error, null);
    const oldOccurrence = { occurrenceId: "old-occurrence", scheduledAtIso: "2026-08-16T08:00:00.000Z", localDate: "2026-08-16", scheduledAt: "08:00", timezone: "Europe/Istanbul" };
    const shown = out.sandbox.App.reminderDeliveryShow(oldOccurrence, { now: "2026-08-16T08:01:00.000Z" });
    assertEqual(shown.ok, true);
    out.sandbox.setConfirmResult(false);
    const cancelled = out.sandbox.App.clearReminderHistory({ nowIso: NOW });
    assertEqual(cancelled.reason, "cancelled");
    assert(out.sandbox.App.reminderDeliveryLoad(NOW).entries.length > 0);
    out.sandbox.setConfirmResult(true);
    const cleared = out.sandbox.App.clearReminderHistory({ confirmed: true, nowIso: NOW });
    assertEqual(cleared.ok, true);
    const log = out.sandbox.App.reminderDeliveryLoad(NOW);
    assertEqual(log.entries.length, 0);
    assertEqual(log.clearBoundaryAt, NOW);
    assert(log.tombstones.includes("old-occurrence"));
    const blocked = out.sandbox.App.reminderDeliveryShow(oldOccurrence, { now: "2026-08-17T13:00:00.000Z" });
    assertEqual(blocked.ok, false);
    assertEqual(blocked.duplicate, true);
    assertEqual(blocked.reason, "cleared-boundary");
    const fresh = out.sandbox.App.reminderDeliveryShow({ occurrenceId: "new-occurrence", scheduledAtIso: "2026-08-18T08:00:00.000Z" }, { now: "2026-08-17T13:00:00.000Z" });
    assertEqual(fresh.ok, true);
    const undone = out.sandbox.App.undoReminderHistory();
    assertEqual(undone.ok, true);
    assert(out.sandbox.App.reminderDeliveryLoad(NOW).entries.some((entry) => entry.occurrenceId === "old-occurrence"));
  }],
  ["disable all is confirmed, preserves history, and is undoable", () => {
    const out = boot(privateReminderState());
    assertEqual(out.error, null);
    const before = out.sandbox.App.reminderRetentionSummary({ download: false, nowIso: NOW }).preferences;
    const disabled = out.sandbox.App.disableAllReminders({ confirmed: true, nowIso: NOW });
    assertEqual(disabled.ok, true);
    const root = out.storage.getJSON("seyma-reset-v1").reminders;
    assert(root.preferences["reminder.catalog.v1.prayer"].enabled === false);
    assert(root.medications[0].enabled === false);
    assertEqual(root.specialDays.mode, "none");
    assertEqual(root.policy.careMovementOptIn, false);
    const after = out.sandbox.App.reminderRetentionSummary({ download: false, nowIso: NOW }).preferences;
    assert(after.configuredCount >= before.configuredCount);
    assertEqual(after.enabledCount, 0);
    assertEqual(after.disabledCount, after.configuredCount);
    const undone = out.sandbox.App.undoDisableAllReminders({ nowIso: "2026-08-17T13:00:00.000Z" });
    assertEqual(undone.ok, true);
    const restored = out.storage.getJSON("seyma-reset-v1").reminders;
    assert(restored.preferences["reminder.catalog.v1.prayer"].enabled === true);
    assert(restored.medications[0].enabled === true);
  }],
  ["full reminder reset removes private reminder residue but leaves the daily record", () => {
    const out = boot(privateReminderState(), {
      storageSeed: {
        [DELIVERY_KEY]: JSON.stringify({ entries: [{ occurrenceId: "private-occurrence", status: "shown", recordedAt: NOW, nativeBody: "NATIVE_SECRET" }] }),
        [ACTION_KEY]: JSON.stringify({ entries: [{ actionId: "private-action", action: "open", status: "completed", reminderId: "reminder.medication.v1.fixture", recordedAt: NOW, medicationDose: "DOSE_SECRET" }] }),
        [PERMISSION_KEY]: "granted"
      }
    });
    assertEqual(out.error, null);
    const reset = out.sandbox.App.reminderFullReset({ confirmed: true });
    assertEqual(reset.ok, true);
    [DELIVERY_KEY, ACTION_KEY, PERMISSION_KEY].forEach((key) => assertEqual(out.storage.getItem(key), null));
    const data = out.storage.getJSON("seyma-reset-v1");
    assert(data.days["2026-08-12"].note === "daily-note-stays-outside-reminder-reset");
    assertEqual(data.reminders.preferences && Object.keys(data.reminders.preferences).length, 0);
    assertEqual(data.reminders.medications.length, 0);
    assert(!JSON.stringify(data.reminders).includes("private-name"));
    assert(!JSON.stringify(data.reminders).includes("private-dose"));
    assertEqual(reset.undoAvailable, false);
  }]
]).catch(() => { process.exitCode = 1; });
