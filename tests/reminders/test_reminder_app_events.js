"use strict";

// REM-47 — app save / local action journal / canonical event-log lifecycle.
// Synthetic VM only: browser, real localStorage, network ve remote data yok.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const ROOT = path.resolve(__dirname, "../..");
const KEY = "seyma-reset-v1";
const NOW = "2026-08-17T12:34:56.000Z";
const DATE = "2026-08-17";

function element(id) {
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

function seed() {
  return {
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "aeon-social-fixture", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {
      "reminder.catalog.v1.prayer": { reminderId: "reminder.catalog.v1.prayer", enabled: false, channel: "in_app" },
      "reminder.catalog.v1.zikr": { reminderId: "reminder.catalog.v1.zikr", enabled: false, channel: "in_app" }
    } },
    settings: { nickname: "REM-47 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto", auth: { rememberMe: true, usernameHash: "fixture-auth", unlockedAt: NOW } },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 }
  };
}

function boot() {
  const app = element("app");
  const root = element("root");
  const store = { [KEY]: JSON.stringify(seed()) };
  let writes = 0;
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { if (key === KEY) writes += 1; store[key] = String(value); },
    removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); },
    getJSON(key) { const raw = this.getItem(key); return raw === null ? null : JSON.parse(raw); }
  };
  const document = {
    hidden: false, body: element("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return element(""); }, createDocumentFragment() { return element(""); }, addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: element("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, DOMParser: DOMParserStub,
    navigator: { userAgent: "rem-47-events", vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 41.0082, longitude: 28.9784, accuracy: 20, speed: 0 } }); }, watchPosition() { return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    Notification: Object.assign(function Notification() {}, { permission: "granted", requestPermission() { return Promise.resolve("granted"); } }),
    fetch() { return new Promise(() => {}); }, setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {}, requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-47-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-47"; }, revokeObjectURL() {} }), URLSearchParams,
    Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {}, TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; }, addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  try {
    ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
      vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
    });
    sandbox.App.start();
  } catch (error) { console.log("DEBUG_BOOT_ERROR", error && error.stack || error); throw error; }
  sandbox.App.reminderDeliveryClear();
  localStorage.removeItem(sandbox.App.reminderActionKey);
  writes = 0;
  return { sandbox, localStorage, app: sandbox.App, writes: () => writes };
}

function state(out) { return out.localStorage.getJSON(KEY); }
function events(out) { return state(out).eventLog.events; }
function occurrence(id, reminderId) {
  return { occurrenceId: id, reminderId, localDate: DATE, scheduledAt: "12:00", timezone: "Europe/Istanbul", due: true, past: false, category: "reflection", priority: "P1", definitionVersion: "1.0.0" };
}

runTests([
  ["all reminder lifecycle actions map to one safe personal category", () => {
    const out = boot();
    const prayer = "reminder.catalog.v1.prayer";
    const zikr = "reminder.catalog.v1.zikr";
    out.app.reminderEnable(prayer, { nowIso: NOW });
    out.app.reminderDisable(prayer, { nowIso: "2026-08-17T12:35:00.000Z" });
    out.app.reminderDeliveryShow({ occurrenceId: "delivered-1", nativeBody: "RAW_BODY", therapyText: "THERAPY_TEXT", medicationName: "MEDICATION", dose: "DOSE", now: NOW });
    out.app.reminderDeliveryOpen({ occurrenceId: "opened-1", body: "RAW_BODY", now: NOW });
    out.app.reminderDeliveryDismiss({ occurrenceId: "dismissed-1", mood: "MOOD_SECRET", note: "JOURNAL_SECRET", now: NOW });
    out.app.reminderInboxTodayOff("muted-1", prayer, { nowIso: NOW });
    out.app.reminderInboxSnooze("snoozed-1", "30m", zikr, { nowIso: NOW, occurrence: occurrence("snoozed-1", zikr) });
    const list = events(out);
    assertEqual(list.length, 7);
    assert(list.every((event) => event.section === "wellness" && event.path === "data.reminders" && event.summary === "Bildirim yaşam döngüsü güncellendi"));
    assert(list.every((event) => event.submittedAt === null && event.acceptedAt === null));
    const text = JSON.stringify(list);
    ["RAW_BODY", "THERAPY_TEXT", "MEDICATION", "DOSE", "MOOD_SECRET", "JOURNAL_SECRET"].forEach((secret) => assert(!text.includes(secret)));
  }],
  ["replay or no-op action does not add another app save or event", () => {
    const out = boot();
    const prayer = "reminder.catalog.v1.prayer";
    const zikr = "reminder.catalog.v1.zikr";
    out.app.reminderDeliveryShow({ occurrenceId: "repeat-delivery", now: NOW });
    out.app.reminderDeliveryShow({ occurrenceId: "repeat-delivery", now: NOW });
    out.app.reminderDeliveryOpen({ occurrenceId: "repeat-open", now: NOW });
    out.app.reminderDeliveryOpen({ occurrenceId: "repeat-open", now: NOW });
    out.app.reminderInboxTodayOff("repeat-mute", prayer, { nowIso: NOW });
    out.app.reminderInboxTodayOff("repeat-mute", prayer, { nowIso: NOW });
    out.app.reminderInboxSnooze("repeat-snooze", "30m", zikr, { nowIso: NOW, occurrence: occurrence("repeat-snooze", zikr) });
    out.app.reminderInboxSnooze("repeat-snooze", "30m", zikr, { nowIso: NOW, occurrence: occurrence("repeat-snooze", zikr) });
    out.app.reminderEnable(prayer, { nowIso: NOW });
    out.app.reminderEnable(prayer, { nowIso: NOW });
    const beforeNoOp = out.writes();
    out.app.reminderEnable(prayer, { nowIso: NOW });
    const afterNoOp = out.writes();
    assertEqual(events(out).length, 5);
    assertEqual(afterNoOp - beforeNoOp, 0);
    assertEqual(out.writes() - afterNoOp, 0);
    assertEqual(out.app.reminderActionState(NOW).entries.filter((entry) => entry.action === "snooze").length, 1);
  }],
  ["foreground evaluator records delivered once after durable delivery change", () => {
    const out = boot();
    const definition = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.zikr");
    const candidate = {
      occurrence: Object.assign(occurrence("scheduler-delivered", definition.id), { deepLink: "zikr", category: definition.category, priority: definition.priority }),
      definition,
      preference: { reminderId: definition.id, enabled: true, channel: "in_app" },
      due: true
    };
    const first = out.app.reminderLifecycleEvaluate("manual", { nowIso: NOW, occurrences: [candidate], context: { timezone: "Europe/Istanbul", localDate: DATE, localTime: "12:00", visibilityState: "visible", permissionState: "granted", offline: false, dailyFlowBudget: 8, nativeDailyCap: 3 } });
    const second = out.app.reminderLifecycleEvaluate("manual", { nowIso: NOW, occurrences: [candidate], context: { timezone: "Europe/Istanbul", localDate: DATE, localTime: "12:00", visibilityState: "visible", permissionState: "granted", offline: false, dailyFlowBudget: 8, nativeDailyCap: 3 } });
    assertEqual(first.shownCount, 1);
    assertEqual(second.duplicateCount, 1);
    assertEqual(out.app.reminderEventState().events.filter((event) => event.summary === "Bildirim yaşam döngüsü güncellendi").length, 1);
    assertEqual(events(out).length, 0);
  }],
  ["personal reminder and ÆON social categories stay separate", () => {
    const out = boot();
    const contract = out.app.reminderEventContract();
    assertEqual(contract.personal.section, "wellness");
    assertEqual(contract.personal.path, "data.reminders");
    assertEqual(contract.social.section, "notifications");
    assertEqual(contract.social.path, "data.aeon");
    const socialData = { syncReceipt: { status: "idle" }, eventLog: { schemaVersion: 1, sourceDeviceId: "dev_rem47", nextSequence: 1, events: [], days: {} } };
    const social = out.app.eventLog.append(socialData, "ÆON sosyal bildirim", { section: "notifications", path: "data.aeon", operation: "update", summary: "Bildirim yaşam döngüsü güncellendi", correlationId: "aeon-social-fixture" });
    assertEqual(social.section, "notifications");
    assertEqual(social.path, "data.aeon");
    assertEqual(events(out).filter((event) => event.section === "wellness").length, 0);
    assertEqual(social.summary, "Bildirim yaşam döngüsü güncellendi");
  }],
  ["action event lifecycle is independent from pending and accepted sync receipts", () => {
    const out = boot();
    out.app.reminderDeliveryShow({ occurrenceId: "receipt-independent", now: NOW });
    const before = events(out).length;
    assertEqual(state(out).syncReceipt.status, "idle");
    out.sandbox.SeyOnSyncState({ status: "saving", submittedAt: NOW, sourceUpdatedAt: NOW });
    assertEqual(events(out).length, before);
    assertEqual(state(out).syncReceipt.status, "saving");
    out.sandbox.SeyOnSynced({ status: "accepted", submittedAt: NOW, acceptedAt: "2026-08-17T12:35:00.000Z", snapshotRevision: "a".repeat(40) });
    assertEqual(events(out).length, before);
    assertEqual(state(out).syncReceipt.status, "accepted");
    assertEqual(events(out)[0].submittedAt, null);
  }]
]).catch(() => { process.exitCode = 1; });
