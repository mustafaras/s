"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { assert, assertEqual, runTests } = require("./helpers/reminder-test-helper");

const rootDir = path.resolve(__dirname, "../..");
const DATE = "2026-08-13";
const NOW = "2026-08-13T12:34:56.000Z";
const AFTER_SNOOZE = "2026-08-13T13:35:00.000Z";

function fixtureElement(id) {
  const attrs = {};
  return {
    id: id || "", _html: "", _text: "", style: { cssText: "", setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: "", files: [], parentNode: null,
    get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; }, set textContent(value) { this._text = String(value); },
    setAttribute(name, value) { attrs[name] = String(value); }, getAttribute(name) { return attrs[name] || null; },
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
    version: 2, startDate: DATE, lastOpenedDate: DATE, days: {},
    notifications: [{ id: "fixture-notification", kind: "observer", message: "observer-safe" }],
    luna: { qa: [] }, aeon: { qa: [] },
    reminders: { schemaVersion: 1, preferences: {
      "reminder.catalog.v1.prayer": { reminderId: "reminder.catalog.v1.prayer", enabled: true, channel: "native" },
      "reminder.catalog.v1.zikr": { reminderId: "reminder.catalog.v1.zikr", enabled: true, channel: "in_app" }
    } },
    settings: { nickname: "REM-13 fixture", ghToken: "", ghRepo: "", ghBranch: "", openaiKey: "", profileAssessmentInactive: true, locationEnabled: true, locationMode: "auto",
      auth: { rememberMe: true, usernameHash: "fixture-auth-hash", unlockedAt: NOW } },
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
    removeItem(key) { delete store[key]; }, clear() { Object.keys(store).forEach((key) => delete store[key]); }
  };
  let fetches = 0;
  let notificationCalls = 0;
  function NotificationMock() { notificationCalls += 1; }
  NotificationMock.permission = "default";
  NotificationMock.requestPermission = function requestPermission() { return Promise.resolve("default"); };
  const document = {
    hidden: false, body: fixtureElement("body"), documentElement: root,
    getElementById(id) { return { app, root }[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return fixtureElement(""); }, createDocumentFragment() { return fixtureElement(""); },
    addEventListener() {}, removeEventListener() {}
  };
  class DOMParserStub { parseFromString() { return { body: fixtureElement("body"), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
  const sandbox = {
    console, localStorage, document, Notification: NotificationMock,
    navigator: { vibrate() {}, userAgent: "rem-13-actions-fixture", clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); }, watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; }, clearWatch() {} } },
    location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/", reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub, fetch() { fetches += 1; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(array) { return array; }, randomUUID() { return "rem-13-actions-uuid"; } },
    URL: Object.assign(function URL() {}, { createObjectURL() { return "blob:rem-13"; }, revokeObjectURL() {} }),
    URLSearchParams, Blob: function Blob() {}, File: function File() {}, FileReader: function FileReader() {},
    TextDecoder, TextEncoder, atob, btoa, alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, parseInt, parseFloat,
    isNaN, isFinite, encodeURIComponent, decodeURIComponent, Promise, Set, Map, Symbol, Intl
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  ["profileAssessmentV1.js", "esmaulHusnaV1.js", "app/core/constants.js", "app/core/reminderCatalog.js", "app.js"].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(rootDir, file), "utf8"), context, { filename: file });
  });
  sandbox.App.start();
  sandbox.App.reminderDeliveryClear();
  localStorage.removeItem(sandbox.App.reminderActionKey);
  fetches = 0;
  return { sandbox, app, localStorage, fetches: () => fetches, notificationCalls: () => notificationCalls };
}

function occurrence(definition, occurrenceId) {
  return {
    occurrenceId, reminderId: definition.id, localDate: DATE, scheduledAt: "12:00", timezone: "Europe/Istanbul",
    due: true, past: false, priority: definition.priority, category: definition.category,
    definitionVersion: definition.definitionVersion
  };
}

runTests([
  ["catalogue exposes only semantically appropriate snooze choices", () => {
    const out = boot(baseState());
    const prayer = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.prayer");
    const reading = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.reading");
    const candidate = (definition, id) => ({ occurrence: occurrence(definition, id), definition, preference: { enabled: true, channel: "in_app" } });
    const html = out.sandbox.App.reminderInboxCardHTML({ occurrences: [candidate(prayer, "prayer-choice"), candidate(reading, "reading-choice")], nowIso: NOW, timezone: "Europe/Istanbul" });
    assert(html.includes("Ertele · 10 dakika"));
    assert(html.includes("Ertele · 30 dakika"));
    assert(html.includes("Ertele · Bu akşam"));
    assert(html.includes("Ertele · Yarın"));
    assert(html.includes("Bugün sustur"));
    assert(html.includes("Kapat · bu hatırlatmayı kapat"));
    assertEqual((html.match(/Ertele · 10 dakika/g) || []).length, 1);
    assertEqual((html.match(/Ertele · Bu akşam/g) || []).length, 1);
  }],
  ["snooze creates one deterministic follow-up and remains idempotent", () => {
    const out = boot(baseState());
    const def = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.zikr");
    const parent = occurrence(def, "occ-snooze-1");
    let first;
    let second;
    try {
      first = out.sandbox.App.reminderInboxSnooze(parent.occurrenceId, "30m", def.id, { nowIso: NOW, occurrence: parent });
      second = out.sandbox.App.reminderInboxSnooze(parent.occurrenceId, "30m", def.id, { nowIso: NOW, occurrence: parent });
    } catch (error) {
      console.log("DEBUG_SNOOZE_ERROR", error && error.stack || error);
      throw error;
    }
    assert(first.ok);
    assert(!first.duplicate);
    assert(second.ok && second.duplicate);
    assert(first.occurrence.occurrenceId !== parent.occurrenceId);
    const entries = out.sandbox.App.reminderDeliveryEntries(NOW);
    assertEqual(entries.length, 2);
    assertEqual(entries.filter((entry) => entry.status === "snoozed").length, 1);
    assertEqual(entries.filter((entry) => entry.status === "scheduled").length, 1);
    const dueView = out.sandbox.App.reminderInboxItems({ nowIso: AFTER_SNOOZE, timezone: "Europe/Istanbul" });
    assert(dueView.items.some((item) => item.occurrenceId === first.occurrence.occurrenceId));
    const actions = out.sandbox.App.reminderActionState(NOW).entries;
    assertEqual(actions.length, 1);
    assertEqual(actions[0].action, "snooze");
    assert(!JSON.stringify(actions).includes(def.privateBody));
    assert(!JSON.stringify(actions).includes("notification"));
    const saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(JSON.stringify(saved.notifications), JSON.stringify(baseState().notifications));
  }],
  ["today mute is traceable but remains separate from canonical reminder data", () => {
    const out = boot(baseState());
    const def = out.sandbox.ReminderCatalogV1.get("reminder.catalog.v1.prayer");
    const before = JSON.stringify(JSON.parse(out.localStorage.getItem("seyma-reset-v1")).reminders);
    const result = out.sandbox.App.reminderInboxTodayOff("occ-today-off", def.id, { nowIso: NOW });
    assert(result.ok);
    assertEqual(out.sandbox.App.reminderDeliveryGet("occ-today-off", NOW).status, "suppressed");
    assertEqual(out.sandbox.App.reminderDeliveryGet("occ-today-off", NOW).reason, "today-muted");
    assertEqual(out.sandbox.App.reminderActionState(NOW).entries[0].action, "todayOff");
    assertEqual(JSON.stringify(JSON.parse(out.localStorage.getItem("seyma-reset-v1")).reminders), before);
    const repeat = out.sandbox.App.reminderInboxTodayOff("occ-today-off", def.id, { nowIso: NOW });
    assert(repeat.ok && repeat.duplicate);
    assertEqual(out.sandbox.App.reminderDeliveryEntries(NOW).length, 1);
  }],
  ["permanent disable is individual, reversible and does not touch permission or another category", () => {
    const out = boot(baseState());
    const prayer = "reminder.catalog.v1.prayer";
    const zikr = "reminder.catalog.v1.zikr";
    const permission = out.sandbox.Notification.permission;
    const result = out.sandbox.App.reminderDisable(prayer, { nowIso: NOW });
    assert(result.ok && result.changed);
    let saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(saved.reminders.preferences[prayer].enabled, false);
    assertEqual(saved.reminders.preferences[zikr].enabled, true);
    assertEqual(saved.reminders.preferences[prayer].channel, "native");
    assertEqual(out.sandbox.Notification.permission, permission);
    const restored = out.sandbox.App.reminderEnable(prayer, { nowIso: "2026-08-13T12:35:56.000Z" });
    assert(restored.ok && restored.changed);
    saved = JSON.parse(out.localStorage.getItem("seyma-reset-v1"));
    assertEqual(saved.reminders.preferences[prayer].enabled, true);
    assertEqual(saved.reminders.preferences[zikr].enabled, true);
    assertEqual(out.sandbox.App.reminderActionState("2026-08-13T12:35:56.000Z").entries.filter((entry) => entry.reminderId === prayer).length, 2);
    assertEqual(out.notificationCalls(), 0);
    assertEqual(out.fetches(), 0);
  }]
]);
