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

const rootDir = path.resolve(__dirname, "../..");
const DELIVERY_KEY = "seyma-reminder-delivery-v1";
const NOW = "2026-08-14T12:00:00.000Z";

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

function baseState() {
  return {
    version: 2,
    startDate: "2026-08-14",
    lastOpenedDate: "2026-08-14",
    days: {},
    notifications: [{ id: "observer-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] },
    aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {} },
    settings: {
      nickname: "REM-09 fixture",
      ghToken: "",
      ghRepo: "",
      ghBranch: "",
      openaiKey: "",
      profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot(storageSeed) {
  const app = element("app");
  const root = element("root");
  const store = Object.assign({}, storageSeed || {}, { "seyma-reset-v1": JSON.stringify(baseState()) });
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: element("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  function NotificationMock() {}
  NotificationMock.permission = "granted";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("granted"); };
  const sandbox = {
    console, localStorage, document, DOMParser: DOMParserStub,
    navigator: { userAgent: "rem-09-delivery-fixture", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    Notification: NotificationMock,
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-09-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-09"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  return { App: sandbox.App, storage: localStorage };
}

runTests([
  ["all delivery states exist and repeated show/open keeps one occurrence", () => {
    const out = boot();
    assert(deepEqual(out.App.reminderDeliveryStatuses(), ["scheduled", "shown", "opened", "snoozed", "dismissed", "suppressed", "failed"]));
    const scheduled = out.App.reminderDeliverySchedule({ occurrenceId: "occurrence-1", channel: "native", now: NOW });
    assertEqual(scheduled.created, true);
    out.App.reminderDeliveryShow({ occurrenceId: "occurrence-1", channel: "native", now: NOW });
    const duplicateShow = out.App.reminderDeliveryShow({ occurrenceId: "occurrence-1", channel: "native", now: NOW });
    assertEqual(duplicateShow.duplicate, true);
    out.App.reminderDeliveryOpen({ occurrenceId: "occurrence-1", channel: "native", now: NOW });
    const duplicateOpen = out.App.reminderDeliveryOpen({ occurrenceId: "occurrence-1", channel: "native", now: NOW });
    assertEqual(duplicateOpen.duplicate, true);
    const log = out.App.reminderDeliveryLoad(NOW);
    assertEqual(log.entries.length, 1);
    assertEqual(log.entries[0].status, "opened");
    assert(log.entries[0].shownAt && log.entries[0].actedAt);
    assert(!Object.prototype.hasOwnProperty.call(log, "notifications"));
  }],
  ["suppression and failure reasons are short, canonical and stateful", () => {
    const out = boot();
    const suppressed = out.App.reminderDeliverySuppress({ occurrenceId: "occurrence-2", channel: "in_app", reason: "quiet-hours-suppressed", now: NOW });
    assertEqual(suppressed.entry.reason, "quiet-hours");
    const repeated = out.App.reminderDeliverySuppress({ occurrenceId: "occurrence-2", reason: "THERAPY_NOTE_SHOULD_NOT_APPEAR", now: NOW });
    assertEqual(repeated.duplicate, true);
    const failed = out.App.reminderDeliveryFail({ occurrenceId: "occurrence-3", reason: "native-error", now: NOW });
    assertEqual(failed.entry.status, "failed");
    assertEqual(failed.entry.reason, "native-error");
    const text = out.storage.getItem(DELIVERY_KEY);
    assert(!text.includes("THERAPY_NOTE_SHOULD_NOT_APPEAR"));
    assert(!text.includes("body"));
  }],
  ["retention keeps only the latest 30 days and latest 200 occurrences", () => {
    const entries = [{ occurrenceId: "old", status: "shown", recordedAt: "2026-07-14T12:00:00.000Z" }];
    for (let i = 0; i < 201; i += 1) {
      entries.push({ occurrenceId: `recent-${String(i).padStart(3, "0")}`, status: "scheduled", recordedAt: `2026-08-${String(1 + Math.floor(i / 13)).padStart(2, "0")}T12:00:00.000Z` });
    }
    const out = boot({ [DELIVERY_KEY]: JSON.stringify({ schemaVersion: 1, entries }) });
    const log = out.App.reminderDeliveryRetain(NOW);
    assertEqual(log.entries.length, 200);
    assert(!log.entries.some((entry) => entry.occurrenceId === "old"));
    assert(!log.entries.some((entry) => entry.occurrenceId === "recent-000"));
    assert(log.entries.some((entry) => entry.occurrenceId === "recent-001"));
  }],
  ["sensitive notification fields never enter the journal", () => {
    const out = boot();
    out.App.reminderDeliveryShow({
      occurrenceId: "therapy-occurrence",
      channel: "native",
      nativeTitle: "TERAPİ DETAYI",
      nativeBody: "THERAPY_BODY_SECRET",
      body: "THERAPY_BODY_SECRET",
      userNote: "USER_NOTE_SECRET",
      therapyText: "THERAPY_TEXT_SECRET",
      medicationName: "MEDICATION_SECRET",
      dose: "DOSE_SECRET",
      now: NOW
    });
    const text = out.storage.getItem(DELIVERY_KEY);
    ["TERAPİ DETAYI", "THERAPY_BODY_SECRET", "USER_NOTE_SECRET", "THERAPY_TEXT_SECRET", "MEDICATION_SECRET", "DOSE_SECRET"].forEach((secret) => assert(!text.includes(secret)));
    const entry = out.App.reminderDeliveryGet("therapy-occurrence", NOW);
    ["nativeTitle", "nativeBody", "body", "userNote", "therapyText", "medicationName", "dose"].forEach((field) => assert(!Object.prototype.hasOwnProperty.call(entry, field)));
  }],
  ["failed occurrence can retry without creating a second row", () => {
    const out = boot();
    out.App.reminderDeliveryFail({ occurrenceId: "retry-occurrence", reason: "native-error", now: NOW });
    assertEqual(out.App.reminderDeliveryCanShow("retry-occurrence", NOW), true);
    const retried = out.App.reminderDeliveryShow({ occurrenceId: "retry-occurrence", now: NOW });
    assertEqual(retried.changed, true);
    assertEqual(out.App.reminderDeliveryLoad(NOW).entries.length, 1);
    assertEqual(out.App.reminderDeliveryGet("retry-occurrence", NOW).status, "shown");
  }],
  ["snoozed and dismissed are explicit action states", () => {
    const out = boot();
    out.App.reminderDeliveryRecord("snooze-occurrence", "snoozed", { now: NOW });
    out.App.reminderDeliveryRecord({ occurrenceId: "dismiss-occurrence", status: "dismissed", now: NOW });
    assertEqual(out.App.reminderDeliveryGet("snooze-occurrence", NOW).status, "snoozed");
    assertEqual(out.App.reminderDeliveryGet("dismiss-occurrence", NOW).status, "dismissed");
    assertEqual(out.App.reminderDeliveryLoad(NOW).entries.length, 2);
  }]
]).catch(() => process.exitCode = 1);
